import { Injectable } from '@angular/core';
import { Web3Service } from './../web3.service';
import { environment } from '../../../environments/environment';
import { DecentralandCosigner, Parcel, District } from '../../models/cosigners/decentraland-cosigner.model';
import { Loan } from '../../models/loan.model';
import { HttpClient, HttpResponse } from '@angular/common/http';

declare let require: any;

const landMarketAbi = require('../../contracts/decentraland/LandMarket.json');
// const landRegistryAbi = require('../../contracts/decentraland/LandRegistry.json');
const mortgageManagerAbi = require('../../contracts/decentraland/MortgageManager.json');

@Injectable()
export class DecentralandCosignerService {
  private _landMarketContract: any;
  private _mortgageManagerContract: any;

  private _districts: District[];

  constructor(private web3: Web3Service, private http: HttpClient) {
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
        this.http.get('./proxy_decentraland/api/districts').subscribe((resp: any) => {
          this._districts = resp.data as District[];
          resolve(this._districts);
        });
      }
    }) as Promise<District[]>;
  }
  getDecentralandOption(loan: Loan): Promise<DecentralandCosigner> {
    return new Promise((resolve) => {
      const engine = environment.contracts.basaltEngine;
      const mortgageManager = environment.contracts.decentraland.mortgageManager;
      this._mortgageManagerContract.loanToLiability(engine, loan.id, (errId, mortgageId) => {
        console.log(mortgageId);
        this._mortgageManagerContract.mortgages(mortgageId, (errD, mortgageData) => {
          console.log(mortgageData);
          const decentralandCosigner = new DecentralandCosigner(
            mortgageManager,
            this.buildData(mortgageId),
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
  private buildData(index: number): string {
    const hex = index.toString(16);
    return '0x' + Array(65 - hex.length).join('0') + hex;
  }
}
