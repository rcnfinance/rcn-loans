
import { CosignerDetail, CosignerOffer, CosignerLiability } from '../../models/cosigner.model';
import { CosignerProvider } from '../cosigner-provider';
import { Loan, Status } from '../../models/loan.model';
import { HttpClient } from '@angular/common/http';
import { Parcel, District, DecentralandCosigner } from '../../models/cosigners/decentraland-cosigner.model';
import { Web3Service } from '../../services/web3.service';
import { Utils } from '../../utils/utils';

declare let require: any;

const mortgageManagerAbi = require('../../contracts/decentraland/MortgageManager.json');

export class DecentralandCosignerProvider implements CosignerProvider {
  http: HttpClient;
  web3: Web3Service;
  _districts: District[] = undefined;
  managerContract: any;
  constructor(
        public engine: string,
        public manager: string,
        public creator: string,
        public market: string,
        public dataUrl: string
    ) {}
  injectHttp(http: HttpClient) {
    this.http = http;
  }
  injectWeb3(web3: Web3Service) {
    this.web3 = web3;
  }
  title(loan: Loan): string {
    return 'Decentraland Parcel Mortgage';
  }
  contract(loan: Loan): string {
    return this.manager;
  }
  isValid(loan: Loan): boolean {
    return loan.creator.toLowerCase() === this.creator.toLowerCase();
  }
  isCurrent(loan: Loan): boolean {
    return loan.status !== Status.Request
            && loan.cosigner.toLowerCase() === this.manager.toLowerCase();
  }
  offer(loan: Loan): Promise<CosignerOffer> {
    return new Promise((resolve, err) => {
      this.detail(loan).then((detail: DecentralandCosigner) => {
        resolve(new CosignerOffer(
                    this.manager,
                    detail,
                    this.buildData(detail.id)
                ));
      });
    }) as Promise<CosignerOffer>;
  }
  liability(loan: Loan): Promise<CosignerLiability> {
    return new Promise((resolve, err) => {
      this.detail(loan).then((detail: DecentralandCosigner) => {
        resolve(new CosignerLiability(
                    this.manager,
                    detail,
                    this.isDefaulted(loan, detail),
                    this.buildClaim(loan)
                ));
      });
    }) as Promise<CosignerLiability>;
  }
  getParcelInfo(x: number, y: number): Promise<Parcel> {
    return new Promise(resolve => {
      this.getParcelArea([x, y], [0, 0]).then((result: Parcel[]) => {
        resolve(result[0]);
      });
    }) as Promise<Parcel>;
  }
  getParcelArea(center: [number, number], size: [number, number]): Promise<Parcel[]> {
    return new Promise(resolve => {
      const x = parseInt(center[0].toString(), 10);
      const y = parseInt(center[1].toString(), 10);
      const sx = Math.ceil((size[0] / 2));
      const sy = Math.ceil((size[1] / 2));
      console.log(size, sx, sy);
      const limitNw = (x - sx) + ',' + (y + sy);
      const limitSe = (x + sx) + ',' + (y - sy);
      this.http.get(this.dataUrl + 'parcels?nw=' + limitNw + '&se=' + limitSe).subscribe((resp: any) => {
        const resultArray = resp.data.parcels as Object[];
        const parcels: Parcel[] = [];
        resultArray.forEach(o => parcels.push(new Parcel(o)));
        resolve(parcels);
      });
    }) as Promise<Parcel[]>;
  }
  getDistricts(): Promise<District[]> {
    return new Promise((resolve) => {
      if (this._districts !== undefined) {
        resolve(this._districts);
      } else {
        this.http.get(this.dataUrl + 'districts').subscribe((resp: any) => {
          this._districts = resp.data as District[];
          resolve(this._districts);
        });
      }
    }) as Promise<District[]>;
  }
  private setupContracts() {
    if (this.managerContract === undefined) {
      this.managerContract = this.web3.web3reader.eth.contract(mortgageManagerAbi).at(this.manager);
    }
  }
  private isDefaulted(loan: Loan, detail: DecentralandCosigner): boolean {
    return (loan.status === Status.Ongoing || loan.status === Status.Indebt) // The loan should not be in debt
            && loan.dueTimestamp + (7 * 24 * 60 * 60) < Math.floor(Date.now() / 1000) // Due time must be pased by 1 week
            // tslint:disable-next-line:triple-equals
            && detail.status == 1; // Detail should be ongoing
  }
  private buildClaim(loan: Loan): () => Promise<string> {
    return () => {
      return new Promise((resolve, reject) => {
        const managerContract = this.web3.web3.eth.contract(mortgageManagerAbi).at(this.manager);
        this.web3.getAccount().then((account) => {
          managerContract.claim(this.engine, loan.id, '0x0', { from: account }, (err, result) => {
            if (err === undefined) {
              reject(err);
            } else {
              resolve(result);
            }
          });
        });
      });
    };
  }
  private detail(loan: Loan): Promise<CosignerDetail> {
    return new Promise((resolve, err) => {
      this.setupContracts();
      this.managerContract.loanToLiability(this.engine, loan.id, (errId, mortgageId) => {
        this.managerContract.mortgages(mortgageId, (errD, mortgageData) => {
          const decentralandCosigner = new DecentralandCosigner(
                  mortgageId, // Mortgage ID
                  Utils.toBytes32(this.web3.web3.toHex(mortgageData[5])), // Land ID
                  mortgageData[6], // Land price
                  ((loan.rawAmount / mortgageData[6]) * 100).toPrecision(2), // Financed amount
                  undefined, // Parcel data
                  mortgageData[7] // Mortgage status
                );
          this.getParcelInfo(decentralandCosigner.x, decentralandCosigner.y).then((parcel) => {
            decentralandCosigner.parcel = parcel;
            resolve(decentralandCosigner);
          });
        });
      });
    });
  }
  private buildData(index: number): string {
    const hex = index.toString(16);
    return '0x' + Array(65 - hex.length).join('0') + hex;
  }
}
