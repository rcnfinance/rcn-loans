import { Loan } from '../models/loan.model';
import { Injectable } from '@angular/core';
import { LoanCurator } from './../utils/loan-curator';
import { LoanUtils } from './../utils/loan-utils';
import { environment } from '../../environments/environment';
import { Web3Service } from './web3.service';

declare let require: any;

const tokenAbi = require('../contracts/Token.json');
const engineAbi = require('../contracts/NanoLoanEngine.json');
const extensionAbi = require('../contracts/NanoLoanEngineExtension.json');

@Injectable()
export class ContractsService {
    private _rcnContract: any;
    private _rcnContractAddress: string = environment.contracts.rcnToken;
  
    private _rcnEngine: any;
    private _rcnEngineAddress: string = environment.contracts.basaltEngine;

    private _rcnExtension: any;
    private _rcnExtensionAddress: string = environment.contracts.engineExtension;

    constructor(private web3: Web3Service) {
      this._rcnContract = this.web3.web3.eth.contract(tokenAbi.abi).at(this._rcnContractAddress);
      this._rcnEngine = this.web3.web3.eth.contract(engineAbi.abi).at(this._rcnEngineAddress);
      this._rcnExtension = this.web3.web3.eth.contract(extensionAbi.abi).at(this._rcnExtensionAddress);
    }

    public async getUserBalanceRCN(): Promise<number> {
        const account = await this.web3.getAccount();
        return new Promise((resolve, reject) => {
          const _web3 = this.web3.web3;
          this._rcnContract.balanceOf.call(account, function (err, result) {
            if (err != null) {
              reject(err);
            }
            resolve(_web3.fromWei(result));
          });
        }) as Promise<number>;
    }

    public async isEngineApproved(): Promise<boolean> {
        const account = await this.web3.getAccount();
        return new Promise((resolve, reject) => {
          let _web3 = this.web3.web3;
          this._rcnContract.allowance.call(account, this._rcnEngineAddress, function (err, result) {
            if(err != null) {
              reject(err);
            }
      
            resolve(_web3.fromWei(result) >= _web3.toWei(1000000000));
          });
        }) as Promise<boolean>;
    }

    public async approveEngine() : Promise<string> {
        let account = await this.web3.getAccount();
        return new Promise((resolve, reject) => {
          let _web3 = this.web3.web3;
          this._rcnContract.approve(this._rcnEngineAddress, _web3.toWei(3000000000), { from: account }, function (err, result) {
            if(err != null) {
              reject(err);
            }
            resolve(result);
          });
        }) as Promise<string>;
    }

    public async lendLoan(loan: Loan) : Promise<string> {
        let account = await this.web3.getAccount();
        return new Promise((resolve, reject) => {
          let _web3 = this.web3.web3;
          this._rcnEngine.lend(loan.id, 0x0, 0x0, 0x0, { from: account }, function (err, result) {
            if(err != null) {
              reject(err);
            }
      
            resolve(result);
          });
        }) as Promise<string>;
    }
    public async getLoan(id: number): Promise<Loan> {
      return new Promise((resolve, reject) => {
        this._rcnExtension.getLoan.call(this._rcnEngineAddress, id, (err, result) => {
          if (err != null) {
            reject(err);
          }
          resolve(LoanUtils.loanFromBytes(this._rcnEngineAddress, id, result));
        });
      }) as Promise<Loan>;
    }
    public async getOpenLoans(): Promise<Loan[]> {
        return new Promise((resolve, reject) => {
          this._rcnExtension.searchOpenLoans.call(this._rcnEngineAddress, 0, 0, (err, result) => {
            if (err != null) {
              reject(err);
            }

            let total = result.length / 20;
            let allLoans = [];

            for (let i = 0; i < total; i++) {
              let id = parseInt(result[(i * 20) + 19], 16);
              let loanBytes = result.slice(i * 20, i * 20 + 20);
              allLoans.push(LoanUtils.loanFromBytes(this._rcnEngineAddress, id, loanBytes));
            }
            console.log(LoanCurator.curateLoans(allLoans));
            resolve(LoanCurator.curateLoans(allLoans));
          });
        }) as Promise<Loan[]>;
    }
}
