import { Injectable } from '@angular/core';
import { Web3Service } from './../web3.service';
import { environment } from '../../../environments/environment';
import { DecentralandCosigner, Parcel, District } from '../../models/cosigners/decentraland-cosigner.model';
import { Loan } from '../../models/loan.model';
import { HttpClient, HttpResponse } from '@angular/common/http';

declare let require: any;

const landMarketAbi = require('../../contracts/decentraland/LandMarket.json');
// const landRegistryAbi = require('../../contracts/decentraland/LandRegistry.json');
const mHelperAbi = require('../../contracts/decentraland/MHelper.json');
const mortgageManagerAbi = require('../../contracts/decentraland/MortgageManager.json');

@Injectable()
export class DecentralandCosignerService {
  private _mhelper: any;
  private _mhelperAddress = '0x5ef16f3412e7c01e5c9803caae1322b28596d0bd';

  private _landMarketContract: any;
  // private _landRegistryContract: any;
  private _mortgageManagerContract: any;

  constructor(private web3: Web3Service, private http: HttpClient) {
    this._mhelper = this.web3.web3.eth.contract(mHelperAbi).at(this._mhelperAddress);
    this._landMarketContract = this.web3.web3.eth.contract(landMarketAbi).at(environment.contracts.decentraland.landMarket);
    this._mortgageManagerContract = this.web3.web3.eth.contract(mortgageManagerAbi).at(environment.contracts.decentraland.mortgageManager);
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
      const sx = size[0] / 2;
      const sy = size[1] / 2;
      console.log(size, sx, sy);
      const limitNw = (x - sx) + ',' + (y - sy);
      const limitSe = (x + sx) + ',' + (y + sy);
      this.http.get('./proxy_decentraland/api/parcels?nw=' + limitNw + '&se=' + limitSe).subscribe((resp: any) => {
        const parcels = resp.data as Parcel[];
        resolve(resp.data.parcels);
      });
    }) as Promise<Parcel[]>;
  }
  getDecentralandOption(loan: Loan): Promise<DecentralandCosigner> {
    return new Promise((resolve) => {
      const engine = environment.contracts.basaltEngine;
      const mortgageManager = environment.contracts.decentraland.mortgageManager;
      this._mhelper.findMortgageId(mortgageManager, engine, loan.id, (errId, mortgageId) => {
        this._mortgageManagerContract.mortgages(mortgageId, (errD, mortgageData) => {
          const decentralandCosigner = new DecentralandCosigner(
            mortgageId, // Mortgage ID
            '0x' + mortgageData[4].toString(16), // Land ID
            mortgageData[5], // Land price
            ((loan.rawAmount / mortgageData[5]) * 100).toFixed(2), // Financed amount
            undefined // Parcel data
          );
          this.getParcelInfo(decentralandCosigner.x, decentralandCosigner.y).then((parcel) => {
            decentralandCosigner.parcel = parcel;
            resolve(decentralandCosigner);
          });
        });
      });
    });
  }
}
