import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Parcel, District, DecentralandCosigner } from '../../models/cosigners/decentraland-cosigner.model';
import { Web3Service } from '../../services/web3.service';
import { Utils } from '../../utils/utils';
import { CosignerOffer, CosignerLiability } from '../../models/cosigner.model';
import { CosignerProvider } from '../cosigner-provider';
import { Loan, Status } from '../../models/loan.model';

declare let require: any;

const mortgageManagerAbi = require('../../contracts/decentraland/MortgageManager.json');
enum MortgageStatus {Pending, Ongoing, Canceled, Paid, Defaulted}

@Injectable()
export class DecentralandCosignerProvider implements CosignerProvider {
  http: HttpClient;
  web3: Web3Service;
  _districts: District[] = undefined;
  managerContract: any;
  mortgageStatus: typeof MortgageStatus = MortgageStatus;
  engine: string;
  manager: string;
  creator: string;
  market: string;
  dataUrl: string;

  constructor() {}

  getEngine() {
    return this.engine;
  }
  setEngine(engine: string) {
    this.engine = engine;
  }
  getManager() {
    return this.manager;
  }
  setManager(manager: string) {
    this.manager = manager;
  }
  getCreator() {
    return this.creator;
  }
  setCreator(creator: string) {
    this.creator = creator;
  }
  getMarket() {
    return this.market;
  }
  setMarket(market: string) {
    this.market = market;
  }
  getDataUrl() {
    return this.dataUrl;
  }
  setDataUrl(dataUrl: string) {
    this.dataUrl = dataUrl;
  }
  injectHttp(http: HttpClient) {
    this.http = http;
  }
  injectWeb3(web3: Web3Service) {
    this.web3 = web3;
  }
  title(_loan: Loan): string {
    return 'Decentraland Parcel';
  }
  contract(_loan: Loan): string {
    return this.manager;
  }
  isValid(loan: Loan): boolean {
    return loan.creator === this.creator;
  }
  isCurrent(loan: Loan): boolean {
    return !loan.isRequest && loan.cosigner === this.manager;
  }
  offer(loan: Loan): Promise<CosignerOffer> {
    return new Promise((resolve, _err) => {
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
    return new Promise((resolve, _err) => {
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
  getStatusOfParcel(loan: Loan): Promise<Boolean> {
    return new Promise(resolve => {
      this.detail(loan).then((decentralandCosignerDetail) => {
        const parcel: Parcel = decentralandCosignerDetail.parcel;
        if (parcel.status === 'open') {
          resolve(true);
        }
        resolve(false);
      });
    }) as Promise<Boolean>;
  }

  /**
   * Check if mortgage is cancelled
   * @param loan Loan
   * @return Boolean
   */
  async isMortgageCancelled(loan: Loan): Promise<Boolean> {
    try {
      const mortgageId = await this.managerContract.methods.loanToLiability(this.engine, loan.id).call();
      const mortgageData = await this.managerContract.methods.mortgages(mortgageId).call();
      const mortgageStatus = parseInt(mortgageData[7], 16);
      if (mortgageStatus === this.mortgageStatus.Canceled) {
        return true;
      }
    } catch (err) {
      return false;
    }
  }

  private setupContracts() {
    if (this.managerContract === undefined) {
      this.managerContract = new this.web3.web3.eth.Contract(mortgageManagerAbi, this.manager);
    }
  }
  private isDefaulted(loan: Loan, detail: DecentralandCosigner): boolean {
    return (loan.status === Status.Ongoing || loan.status === Status.Indebt) // The loan should not be in debt
            && loan.debt.model.dueTime + (7 * 24 * 60 * 60) < Math.floor(Date.now() / 1000) // Due time must be pased by 1 week
            // tslint:disable-next-line:triple-equals
            && detail.status == 1; // Detail should be ongoing
  }
  private buildClaim(loan: Loan): () => Promise<string> {
    return async () => {
      const managerContract = new this.web3.web3.eth.Contract(mortgageManagerAbi, this.manager);
      const account = await this.web3.getAccount();
      const result = await managerContract.methods
          .claim(this.engine, loan.id, '0x0')
          .send({ from: account });

      return result;
    };
  }

  private async detail(loan: Loan): Promise<DecentralandCosigner> {
    this.setupContracts();
    const mortgageId = await this.managerContract.methods.loanToLiability(this.engine, loan.id).call();
    const mortgageData = await this.managerContract.methods.mortgages(mortgageId).call();
    const landId = this.web3.web3.utils.toHex(mortgageData[5]);
    const landPrice = mortgageData[6];
    const motrgageAmount = mortgageData[6];
    const financedAmount = (loan.amount / motrgageAmount) * 100;
    const parcelData = undefined;
    const mortgageStatus = mortgageData[7];
    const decentralandCosigner = new DecentralandCosigner(
        mortgageId,
        Utils.toBytes32(landId),
        landPrice,
        financedAmount.toPrecision(2),
        parcelData,
        mortgageStatus
    );
    const { x, y } = decentralandCosigner;
    const parcel = await this.getParcelInfo(x, y);

    decentralandCosigner.parcel = parcel;

    return decentralandCosigner;
  }

  private buildData(index: number): string {
    const hex = index.toString(16);
    return '0x' + Array(65 - hex.length).join('0') + hex;
  }
}
