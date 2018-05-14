import { Injectable } from '@angular/core';
import { Web3Service } from './../web3.service';
import { environment } from '../../../environments/environment';
import { DecentralandCosigner } from '../../models/cosigner.model';
import { Loan } from '../../models/loan.model';

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

  constructor(private web3: Web3Service) {
    this._mhelper = this.web3.web3.eth.contract(mHelperAbi).at(this._mhelperAddress);
    this._landMarketContract = this.web3.web3.eth.contract(landMarketAbi).at(environment.contracts.decentraland.landMarket);
    this._mortgageManagerContract = this.web3.web3.eth.contract(mortgageManagerAbi).at(environment.contracts.decentraland.mortgageManager);
  }
  private formatData(id: number): string {
    let hex = id.toString(16);
    if (hex.length < 65) {
      hex = Array(65 - hex.length).join("0") + hex;
    }
    return "0x" + hex;
  }
  getDecentralandOption(loan: Loan): Promise<DecentralandCosigner> {
    return new Promise((resolve) => {
      this._mhelper.findMortgageId(environment.contracts.decentraland.mortgageManager, environment.contracts.basaltEngine, loan.id, (err, result) => {
        let mortgageId: number = result;
        this._mortgageManagerContract.mortgages(mortgageId, (err, result) => {
          resolve(new DecentralandCosigner(
            this.formatData(mortgageId),
            "0x" + result[4].toString(16),
            result[5]
          ))
        })
      })
    })
  }
}
