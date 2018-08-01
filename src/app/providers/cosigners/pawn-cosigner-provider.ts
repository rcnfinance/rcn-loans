
import { CosignerDetail, CosignerOffer, CosignerLiability } from '../../models/cosigner.model';
import { CosignerProvider } from '../cosigner-provider';
import { Loan, Status } from '../../models/loan.model';
import { HttpClient } from '@angular/common/http';
import { Web3Service } from '../../services/web3.service';
import { PawnCosigner } from '../../models/cosigners/pawn-cosigner.model';
import { AssetItem } from '../../models/asset.model';
import { AssetsService } from '../../services/assets.service';
import { promisify } from '../../utils/utils';

declare let require: any;

const pawnManagerAbi = require('../../contracts/PawnManager.json');
const bundleAbi = require('../../contracts/Bundle.json');

export class PawnCosignerProvider implements CosignerProvider {
    http: HttpClient;
    web3: Web3Service;
    assets: AssetsService;
    constructor(
        public engine: string,
        public pawnManager: string,
        public bundle: string,
        public pouch: string
    ) {}
    injectHttp(http: HttpClient) {
        this.http = http;
    }
    injectWeb3(web3: Web3Service) {
        this.web3 = web3;
    }
    injectAssets(assets: AssetsService) {
      this.assets = assets;
    }
    title(loan: Loan): string {
        return 'Collateral backed loan';
    }
    contract(loan: Loan): string {
        return this.pawnManager;
    }
    isValid(loan: Loan): boolean {
        return loan.creator === this.pawnManager;
    }
    isCurrent(loan: Loan): boolean {
        return loan.status !== Status.Request
            && loan.cosigner === this.pawnManager;
    }
    async offer(loan: Loan): Promise<CosignerOffer> {
      const detail = await this.detail(loan) as PawnCosigner;
      return new CosignerOffer(
        this.pawnManager,
        detail,
        this.buildData(detail.id),
        async (): Promise<string> => {
          const pawnContract = this.web3.web3.eth.contract(pawnManagerAbi).at(this.pawnManager);
          const account = await this.web3.getAccount();
          const p1 = promisify(c => pawnContract.cancelPawn(detail.id, account, false, c));
          return await p1 as string;
        }
      );
    }
    async liability(loan: Loan): Promise<CosignerLiability> {
        const detail = await this.detail(loan) as PawnCosigner;
        return new CosignerLiability(
            this.pawnManager,
            detail,
            (user: string): boolean => this.isDefaulted(loan, detail, user) || this.canDestroy(loan, detail, user),
            async(): Promise<string> => {
                const pawnContract = this.web3.web3.eth.contract(pawnManagerAbi).at(this.pawnManager);
                return await promisify(c => pawnContract.claimWithdraw(loan.engine, loan.id, c)) as string;
            }
        );
    }
    private isDefaulted(loan: Loan, detail: PawnCosigner, user: string): boolean {
        return (loan.status === Status.Ongoing || loan.status === Status.Indebt) // The loan should not be in debt
            && loan.dueTimestamp < (Date.now() / 1000) // Due time must be pased by 1 week
            && detail.status.toString() === '1'
            && loan.owner === user;
    }
    private canDestroy(loan: Loan, detail: PawnCosigner, user: string): boolean {
        return (loan.status === Status.Paid || loan.status === Status.Destroyed)
            && detail.status.toString() === '1'
            && detail.owner === user;
    }
    private async detail(loan: Loan): Promise<CosignerDetail> {
      const pawnContract = this.web3.web3reader.eth.contract(pawnManagerAbi).at(this.pawnManager);
      const bundleContract = this.web3.web3reader.eth.contract(bundleAbi).at(this.bundle);
      const pPawnId = await pawnContract.getLiability(this.engine, loan.id);
      const pStatus = pawnContract.getPawnStatus(await pPawnId);
      const pOwner = pawnContract.ownerOf(await pPawnId);
      const bundleId = await pawnContract.getPawnPackageId(await pPawnId);
      const bundleContentRaw = await bundleContract.content(bundleId);
      const bundleContent: AssetItem[] = [];
      for (let i = 0; i < bundleContentRaw[0].length; i++) {
        bundleContent.push(
          this.assets.parse(bundleContentRaw[0][i], bundleContentRaw[1][i], this.pawnManager)
        );
      }
      return new PawnCosigner(await pPawnId, bundleId, bundleContent, await pStatus, await pOwner);
    }
    private buildData(index: number): string {
      const hex = index.toString(16);
      return '0x' + Array(65 - hex.length).join('0') + hex;
    }
}
