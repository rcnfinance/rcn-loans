import { BigNumber } from 'bignumber.js';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Loan, Oracle, Network } from '../models/loan.model';
import { LoanCurator } from './../utils/loan-curator';
import { LoanUtils } from './../utils/loan-utils';
import { environment } from '../../environments/environment';
import { Web3Service } from './web3.service';
import { TxService } from '../tx.service';
import { CosignerService } from './cosigner.service';
import { ApiService } from './api.service';
import { promisify, Utils } from './../utils/utils';

declare let require: any;

const tokenAbi = require('../contracts/Token.json');
const engineAbi = require('../contracts/NanoLoanEngine.json');
const extensionAbi = require('../contracts/NanoLoanEngineExtension.json');
const oracleAbi = require('../contracts/Oracle.json');
const requestsAbi = require('../contracts/RequestsView.json');
const loanManagerAbi = require('../contracts/LoanManager.json');
const diasporeOracleAbi = require('../contracts/DiasporeOracle.json');

@Injectable()
export class ContractsService {
  private _rcnContract: any;
  private _rcnContractAddress: string = environment.contracts.rcnToken;

  private _rcnEngine: any;
  private _rcnEngineAddress: string = environment.contracts.basaltEngine;
  private _rcnExtension: any;
  private _rcnExtensionAddress: string = environment.contracts.engineExtension;
  private _requestsView: any;
  private _loanManager: any;

  constructor(
      private web3: Web3Service,
      private txService: TxService,
      private cosignerService: CosignerService,
      private http: HttpClient,
      private apiService: ApiService
    ) {
    this._rcnContract = this.web3.web3.eth.contract(tokenAbi.abi).at(this._rcnContractAddress);
    this._rcnEngine = this.web3.web3.eth.contract(engineAbi.abi).at(this._rcnEngineAddress);
    this._loanManager = this.web3.web3.eth.contract(loanManagerAbi).at(environment.contracts.diaspore.loanManager);
    this._rcnExtension = this.web3.web3.eth.contract(extensionAbi.abi).at(this._rcnExtensionAddress);
    this._requestsView = this.web3.web3.eth.contract(requestsAbi).at(environment.contracts.diaspore.viewRequets);
    this._rcnExtension = this.web3.web3.eth.contract(extensionAbi.abi).at(this._rcnExtensionAddress);

  }

  async getUserBalanceETHWei(): Promise<BigNumber> {
    const account = await this.web3.getAccount();
    const balance = await this.web3.web3.eth.getBalance(account);
    return new Promise((resolve) => {
      resolve(balance);
    }) as Promise<BigNumber>;
  }

  async getUserBalanceRCNWei(): Promise<number> {
    const account = await this.web3.getAccount();
    return new Promise((resolve, reject) => {
      this._rcnContract.balanceOf.call(account, function (err, result) {
        if (err != null) {
          reject(err);
        }
        resolve(result);
      });
    }) as Promise<number>;
  }

  async getUserBalanceRCN(): Promise<number> {
    return new Promise((resolve) => {
      this.getUserBalanceRCNWei().then((balance) => {
        resolve(this.web3.web3.fromWei(balance));
      });
    }) as Promise<number>;
  }
  async isApproved(contract: string): Promise<boolean> {
    const pending = this.txService.getLastPendingApprove(this._rcnContract.address, contract);
    if (pending !== undefined) {
      return pending;
    }
    const result = await promisify(this._rcnContract.allowance.call, [await this.web3.getAccount(), contract]);
    return result >= this.web3.web3.toWei(1000000000);
  }
  async approve(contract: string): Promise<string> {
    const _web3 = this.web3.web3;
    const result = await promisify(this._rcnContract.approve, [contract, _web3.toWei(10 ** 32)]);
    this.txService.registerApproveTx(result, this._rcnContract.address, contract, true);
    return result;
  }
  async disapprove(contract: string): Promise<string> {
    const result = await promisify(this._rcnContract.approve, [contract, 0]);
    this.txService.registerApproveTx(result, this._rcnContract.address, contract, false);
    return result;
  }
  async estimateRequiredAmount(loan: Loan): Promise<number> {
    if (!loan.oracle) {
      return loan.amount;
    }

    const oracleData = await this.getOracleData(loan.oracle);

    if (loan.network === Network.Basalt) {
      const legacyOracle = this.web3.web3.eth.contract(oracleAbi.abi).at(loan.oracle.address);
      const oracleRate = await promisify(legacyOracle.getRate, [loan.oracle.code, oracleData]);
      const rate = oracleRate[0];
      const decimals = oracleRate[1];
      console.info('Oracle rate obtained', rate, decimals);
      const required = (rate * loan.amount * 10 ** (18 - decimals) / 10 ** 18) * 1.02;
      console.info('Estimated required rcn is', required);
      return required;
    }

    const oracle = this.web3.web3.eth.contract(diasporeOracleAbi).at(loan.oracle.address);
    const oracleResult = await promisify(oracle.readSample.call, [oracleData]);
    const tokens = oracleResult[0];
    const equivalent = oracleResult[1];
    return (tokens * loan.amount) / equivalent;
  }
  async lendLoan(loan: Loan): Promise<string> {
    const pOracleData = this.getOracleData(loan.oracle);
    const cosigner = this.cosignerService.getCosigner(loan);
    let cosignerAddr = '0x0';
    let cosignerData = '0x0';
    if (cosigner !== undefined) {
      const cosignerOffer = await cosigner.offer(loan);
      cosignerAddr = cosignerOffer.contract;
      cosignerData = cosignerOffer.lendData;
    }
    const oracleData = await pOracleData;

    switch (loan.network) {
      case Network.Basalt:
        return await promisify(this._rcnEngine.lend, [loan.id, oracleData, cosignerAddr, cosignerData]);
      case Network.Diaspore:
        return await promisify(this._loanManager.lend, [loan.id, oracleData, cosignerAddr, cosignerData, 0]);
      default:
        throw Error('Unknown network');
    }
  }
  async transferLoan(loan: Loan, to: string): Promise<string> {
    const account = await this.web3.getAccount();
    return new Promise((resolve, reject) => {
      this._rcnEngine.transfer(to, loan.id, { from: account }, function(err, result) {
        if (err != null) {
          reject(err);
        }
        resolve(result);
      });
    }) as Promise<string>;
  }
  async withdrawFunds(loans: number[]): Promise<string> {
    const account = await this.web3.getAccount();
    return new Promise((resolve, reject) => {
      this._rcnEngine.withdrawalList(loans, account, (err, result) => {
        if (err != null) {
          reject(err);
        }
        resolve(result);
      });
    }) as Promise<string>;
  }

  async getOracleData(oracle?: Oracle): Promise<string> {
    if (!oracle) {
      return '0x';
    }

    const oracleContract = this.web3.web3.eth.contract(oracleAbi.abi).at(oracle.address);
    const url = await promisify(oracleContract.url.call, []);
    if (url === '') { return '0x'; }
    const oracleResponse = (await this.http.get(url).toPromise()) as any[];
    console.info('Searching currency', oracle.currency, oracleResponse);
    let data;
    oracleResponse.forEach(e => {
      if (e.currency === oracle.code) {
        data = e.data;
        console.info('Oracle data found', data);
      }
    });
    if (data === undefined) {
      throw new Error('Oracle did not provide data');
    }
    return data;
  }
  async getLoan(id: string): Promise<Loan> {
    if (id.startsWith('0x')) {
      // Load Diaspore loan
      return this.apiService.getLoan(id);
      // const result = await promisify(this._requestsView.getLoan.call, [environment.contracts.diaspore.loanManager, id]);
      // if (result.length === 0) throw new Error('Loan not found');
      // return LoanUtils.parseLoan(environment.contracts.diaspore.loanManager, result);
    }

    return new Promise((resolve, reject) => {
      this._rcnExtension.getLoan.call(this._rcnEngineAddress, id, (err, result) => {
        if (err != null) {
          reject(err);
        } else if (result.length === 0) {
          reject(new Error('Loan does not exist'));
        } else {
          resolve(LoanUtils.parseBasaltLoan(this._rcnEngineAddress, result));
        }
      });
    }) as Promise<Loan>;
  }
  async getActiveLoans(): Promise<Loan[]> {
    const bfilters = [environment.filters.ongoing];
    const bparams = ['0x0'];
    const pbasalt = promisify(this._rcnExtension.queryLoans.call, [this._rcnEngineAddress, 0, 0, bfilters, bparams]);
    // Filter lenderIn Diaspore loans
    const dfilter = [
      // Created by loan manager
      this.addressToBytes32(environment.contracts.diaspore.filters.debtCreator),
      this.addressToBytes32(this._loanManager.address),
      // Ongoing status
      this.addressToBytes32(environment.contracts.diaspore.filters.isStatus),
      Utils.toBytes32('0x1')
    ];
    const pdiaspore = promisify(this._requestsView.getLoans, [this._loanManager.address, dfilter]);
    return this.parseLoanBytes(await pdiaspore).concat(this.parseBasaltBytes(await pbasalt));
  }
  async getRequests(): Promise<Loan[]> {
    // const basalt = new Promise((resolve, reject) => {
    //   // Filter open loans, non expired loand and valid mortgage
    //   const filters = [
    //     environment.filters.openLoans,
    //     environment.filters.nonExpired,
    //     environment.filters.validMortgage
    //   ];

    //   const params = ['0x0', '0x0', this.addressToBytes32(environment.contracts.decentraland.mortgageCreator)];
    //   this._rcnExtension.queryLoans.call(this._rcnEngineAddress, 0, 0, filters, params, (err, result) => {
    //     if (err != null) {
    //       reject(err);
    //     }
    //     resolve(LoanCurator.curateBasaltRequests(this.parseBasaltBytes(result)));
    //   });
    // }) as Promise<Loan[]>;

    const diaspore = this.apiService.getRequests();

    // const diaspore = new Promise((resolve, reject) => {
    //   const filters = [
    //     this.addressToBytes32(environment.contracts.diaspore.filters.notExpired),
    //     '0x0000000000000000000000000000000000000000000000000000000000000000'
    //   ];
    //   this._requestsView.getRequests(environment.contracts.diaspore.loanManager, 1, 10000, filters, (err, result) => {
    //     if (err != null) {
    //       reject(err);
    //       console.error(err);
    //     }
    //     resolve(this.parseRequestBytes(result));
    //   });
    // }) as Promise<Loan[]>;
    return diaspore;
    // return (await diaspore).concat(await basalt);
  }
  async getLoansOfLender(lender: string): Promise<Loan[]> {
    // Filter [lenderIn] Basalt loans
    const bfilters = [environment.filters.lenderIn];
    const bparams = [this.addressToBytes32(lender)];
    const pbasalt = promisify(this._rcnExtension.queryLoans.call, [this._rcnEngineAddress, 0, 0, bfilters, bparams]);
    // Filter lenderIn Diaspore loans
    const dfilter = [
      // Created by loan manager
      this.addressToBytes32(environment.contracts.diaspore.filters.debtCreator),
      this.addressToBytes32(this._loanManager.address),
      // Lender in
      this.addressToBytes32(environment.contracts.diaspore.filters.isLender),
      this.addressToBytes32(lender)
    ];
    const pdiaspore = promisify(this._requestsView.getLoans, [this._loanManager.address, dfilter]);
    return this.parseLoanBytes(await pdiaspore).concat(this.parseBasaltBytes(await pbasalt));
  }
  readPendingWithdraws(loans: Loan[]): [BigNumber, number[]] {
    const pendingLoans = [];
    let total = 0;

    loans.forEach(loan => {
      if (loan.debt.balance > 0) {
        total += loan.debt.balance;
        pendingLoans.push(loan.id);
      }
    });

    return [total, pendingLoans];
  }
  async getPendingWithdraws(): Promise<[number, number[]]> {
    const account = await this.web3.getAccount();
    return new Promise((resolve, _reject) => {
      this.getLoansOfLender(account).then((loans: Loan[]) => {
        resolve(this.readPendingWithdraws(loans));
      });
    }) as Promise<[number, number[]]>;
  }
  private parseBasaltBytes(bytes: any): Loan[] {
    const loans = [];
    const total = bytes.length / 20;
    for (let i = 0; i < total; i++) {
      const loanBytes = bytes.slice(i * 20, i * 20 + 20);
      loans.push(LoanUtils.parseBasaltLoan(this._rcnEngineAddress, loanBytes));
    }
    return loans;
  }
  private parseRequestBytes(bytes: any): Loan[] {
    const requests = [];
    const total = bytes.length / 17;
    for (let i = 0; i < total; i++) {
      const loanBytes = bytes.slice(i * 17, i * 17 + 17);
      requests.push(LoanUtils.parseLoan(environment.contracts.diaspore.loanManager, loanBytes));
    }
    return requests;
  }
  private parseLoanBytes(bytes: any): Loan[] {
    const requests = [];
    const total = bytes.length / 25;
    for (let i = 0; i < total; i++) {
      const loanBytes = bytes.slice(i * 25, i * 25 + 25);
      requests.push(LoanUtils.parseLoan(environment.contracts.diaspore.loanManager, loanBytes));
    }
    return requests;
  }
  private addressToBytes32(address: string): string {
    return '0x000000000000000000000000' + address.replace('0x', '');
  }
}
