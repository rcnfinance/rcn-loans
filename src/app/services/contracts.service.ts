import * as Web3 from 'web3';

import { Loan } from '../models/loan.model';
import { Injectable } from '@angular/core';

declare let require: any;
declare let window: any;

const tokenAbi = require('../contracts/Token.json');
const engineAbi = require('../contracts/NanoLoanEngine.json');
const extensionAbi = require('../contracts/NanoLoanEngineExtension.json');

function loanFromBytes(id: number, loanBytes: any): Loan {
  return new Loan(
    id,
    parseInt(loanBytes[14], 16),
    loanBytes[2],
    loanBytes[2],
    parseInt(loanBytes[5], 16),
    parseInt(loanBytes[12], 16),
    parseInt(loanBytes[9], 16),
    parseInt(loanBytes[10], 16),
    loanBytes[16]
  );
}

function curateLoans(loans: Loan[]): Loan[] {
  return loans.filter(loan => {
    return loan.annualInterest < 1000 &&
      loan.annualPunitoryInterest < 1000 &&
      loan.amount < 1000000 && 
      loan.amount > 0.00001
  })
}

@Injectable()
export class ContractsService {
    private _account: string = null;
    private _web3: any;
  
    private _rcnContract: any;
    private _rcnContractAddress: string = '0x2f45b6fb2f28a73f110400386da31044b2e953d4';
  
    private _rcnEngine: any;
    private _rcnEngineAddress: string = '0xbee217bfe06c6faaa2d5f2e06ebb84c5fb70d9bf';

    private _rcnExtension: any;
    private _rcnExtensionAddress: string = '0xd4cd87d5155b83eb9f3cec4c02c32df15bcde6b6';

    constructor() {
      if (typeof window.web3 !== 'undefined') {
        // Use Mist/MetaMask's provider
        this._web3 = new Web3(window.web3.currentProvider);
  
        // if (this._web3.version.network !== '3') {
        //   alert('Please connect to the Ropsten network');
        // }
      } else {
        console.warn(
          'Please use a dapp browser like mist or MetaMask plugin for chrome'
        );
      }
  
      this._rcnContract = this._web3.eth.contract(tokenAbi.abi).at(this._rcnContractAddress);
      this._rcnEngine = this._web3.eth.contract(engineAbi.abi).at(this._rcnEngineAddress);
      this._rcnExtension = this._web3.eth.contract(extensionAbi.abi).at(this._rcnExtensionAddress);
    }

    private async getAccount(): Promise<string> {
        if (this._account == null) {
          this._account = await new Promise((resolve, reject) => {
            this._web3.eth.getAccounts((err, accs) => {
              if (err != null) {
                alert('There was an error fetching your accounts.');
                return;
              }
      
              if (accs.length === 0) {
                alert(
                  'Couldn\'t get any accounts! Make sure your Ethereum client is configured correctly.'
                );
                return;
              }
              resolve(accs[0]);
            });
          }) as string;
      
          this._web3.eth.defaultAccount = this._account;
        }
      
        return Promise.resolve(this._account);
    }

    public async getUserBalanceRCN(): Promise<number> {
        let account = await this.getAccount();
      
        return new Promise((resolve, reject) => {
          let _web3 = this._web3;
          this._rcnContract.balanceOf.call(account, function (err, result) {
            if (err != null) {
              reject(err);
            }
      
            resolve(_web3.fromWei(result));
          });
        }) as Promise<number>;
    }

    public async isEngineApproved() : Promise<boolean> {
        let account = await this.getAccount();
      
        return new Promise((resolve, reject) => {
          let _web3 = this._web3;
          this._rcnContract.allowance.call(account, this._rcnEngineAddress, function (err, result) {
            if(err != null) {
              reject(err);
            }
      
            resolve(_web3.fromWei(result) >= _web3.toWei(1000000000));
          });
        }) as Promise<boolean>;
    }

    public async approveEngine() : Promise<string> {
        let account = await this.getAccount();
      
        return new Promise((resolve, reject) => {
          let _web3 = this._web3;
          this._rcnContract.approve(this._rcnEngineAddress, _web3.toWei(3000000000), { from: account }, function (err, result) {
            if(err != null) {
              reject(err);
            }
      
            resolve(result);
          });
        }) as Promise<string>;
    }

    public async lendLoan(loan: Loan) : Promise<string> {
        let account = await this.getAccount();
      
        return new Promise((resolve, reject) => {
          let _web3 = this._web3;
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
        this._rcnExtension.getLoan.call(this._rcnEngineAddress, id, function (err, result){
          if(err != null) {
            reject(err);
          }
          resolve(loanFromBytes(id, result));
        })
      }) as Promise<Loan>;
    }
    public async getOpenLoans(): Promise<Loan[]> {      
        return new Promise((resolve, reject) => {
          this._rcnExtension.searchOpenLoans.call(this._rcnEngineAddress, 0, 0, function (err, result) {
            if(err != null) {
              reject(err);
            }

            let total = result.length / 20;
            let allLoans = [];

            for (let i = 0; i < total; i++) {
              let id = parseInt(result[(i * 20) + 19], 16);
              let loanBytes = result.slice(i * 20, i * 20 + 20);
              allLoans.push(loanFromBytes(id, loanBytes));
            }

            resolve(curateLoans(allLoans));
          });
        }) as Promise<Loan[]>;
    }
}
