
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
          const pawnContract = this.web3.web3.eth.contract(pawnManagerAbi.abi).at(this.pawnManager);
          const bundleContract = this.web3.web3.eth.contract(bundleAbi).at(this.bundle);
          const account = await this.web3.getAccount();
          const p2 = promisify(c => bundleContract.withdrawAll(detail.bundle, account, c));
          const p1 = promisify(c => pawnContract.cancelPawn(detail.id, c));
          await p1; await p2;
          return await p1 as string;
        }
      );
    }
    liability(loan: Loan): Promise<CosignerLiability> {
        return new Promise((resolve, err) => {
            // this.detail(loan).then((detail: PawnCosigner) => {
            //     resolve(new CosignerLiability(
            //         this.manager,
            //         detail,
            //         this.isDefaulted(loan, detail),
            //         this.buildClaim(loan)
            //     ));
            // });
        }) as Promise<CosignerLiability>;
    }
    // private isDefaulted(loan: Loan, detail: DecentralandCosigner): boolean {
    //   return (loan.status === Status.Ongoing || loan.status === Status.Indebt) // The loan should not be in debt
    //       && loan.dueTimestamp + (7 * 24 * 60 * 60) > (Date.now() / 1000) // Due time must be pased by 1 week
    //       && detail.status === 1; // Detail should be ongoing
    // }
    // private async buildClaim(loan: Loan): () => Promise<string> {
    //     return () => {
    //         return new Promise((resolve, reject) => {
    //             const managerContract = this.web3.web3.eth.contract(mortgageManagerAbi).at(this.manager);
    //             this.web3.getAccount().then((account) => {
    //                 managerContract.claim(this.engine, loan.id, '0x0', {from: account}, (err, result) => {
    //                     if (err === undefined) {
    //                         reject(err);
    //                     } else {
    //                         resolve(result);
    //                     }
    //                 });
    //             });
    //         });
    //     };
    // }
    private async detail(loan: Loan): Promise<CosignerDetail> {
      const pawnContract = this.web3.web3reader.eth.contract(pawnManagerAbi.abi).at(this.pawnManager);
      const bundleContract = this.web3.web3reader.eth.contract(bundleAbi).at(this.bundle);
      const pawnId = await pawnContract.getLiability(this.engine, loan.id);
      const bundleId = await pawnContract.getPawnPackageId(pawnId);
      const bundleContentRaw = await bundleContract.content(bundleId);
      const bundleContent: AssetItem[] = [];
      for (let i = 0; i < bundleContentRaw[0].length; i++) {
        bundleContent.push(
          this.assets.parse(bundleContentRaw[0][i], bundleContentRaw[1][i], this.pawnManager)
        );
      }
      return new PawnCosigner(pawnId, bundleId, bundleContent);
    }
    private buildData(index: number): string {
      const hex = index.toString(16);
      return '0x' + Array(65 - hex.length).join('0') + hex;
    }
}
