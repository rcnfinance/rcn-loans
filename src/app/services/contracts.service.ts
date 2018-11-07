import BigNumber from 'bignumber.js';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Request, Loan, BasaltLoan } from '../models/loan.model';
import { LoanCurator } from './../utils/loan-curator';
import { LoanUtils } from './../utils/loan-utils';
import { environment } from '../../environments/environment';
import { Web3Service } from './web3.service';
import { TxService } from '../tx.service';
import { CosignerService } from './cosigner.service';
import { Utils } from '../utils/utils';
import { promisify } from './../utils/utils';

declare let require: any;

const tokenAbi = require('../contracts/Token.json');
const engineAbi = require('../contracts/NanoLoanEngine.json');
const extensionAbi = require('../contracts/NanoLoanEngineExtension.json');
const oracleAbi = require('../contracts/Oracle.json');
const requestsAbi = require('../contracts/RequestsView.json');
const loanManagerAbi = require('../contracts/LoanManager.json');

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
      private http: HttpClient
    ) {
    this._rcnContract = this.web3.web3.eth.contract(tokenAbi.abi).at(this._rcnContractAddress);
    this._rcnEngine = this.web3.web3.eth.contract(engineAbi.abi).at(this._rcnEngineAddress);
    this._loanManager = this.web3.web3.eth.contract(loanManagerAbi).at(environment.contracts.diaspore.loanManager);
    this._rcnExtension = this.web3.web3reader.eth.contract(extensionAbi.abi).at(this._rcnExtensionAddress);
    this._requestsView = this.web3.web3reader.eth.contract(requestsAbi).at(environment.contracts.diaspore.viewRequets);
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
        resolve(this.web3.web3reader.fromWei(balance));
      });
    }) as Promise<number>;
  }
  async isApproved(contract: string): Promise<boolean> {
    const pending = this.txService.getLastPendingApprove(this._rcnContract.address, contract);
    if (pending !== undefined) {
      return pending;
    }
    const result = await promisify(this._rcnContract.allowance.call, [contract]);
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
  async estimateRequiredAmount(loan: Request): Promise<number> {
    if (loan.oracle === Utils.address0x) {
      return loan.amount;
    }

    const oracleData = await this.getOracleData(loan);
    const oracle = this.web3.web3reader.eth.contract(oracleAbi.abi).at(loan.oracle);
    const oracleRate = await promisify(oracle.getRate, [loan.currency, oracleData]);
    const rate = oracleRate[0];
    const decimals = oracleRate[1];
    console.info('Oracle rate obtained', rate, decimals);
    const required = (rate * loan.amount * 10 ** (18 - decimals) / 10 ** 18) * 1.02;
    console.info('Estimated required rcn is', required);
    return required;
  }
  async lendLoan(request: Request): Promise<string> {
    const pOracleData = this.getOracleData(request);
    const cosigner = this.cosignerService.getCosigner(request);
    let cosignerAddr = '0x0';
    let cosignerData = '0x0';
    if (cosigner !== undefined) {
      const cosignerOffer = await cosigner.offer(request);
      cosignerAddr = cosignerOffer.contract;
      cosignerData = cosignerOffer.lendData;
    }
    const oracleData = await pOracleData;

    if (request instanceof BasaltLoan) {
      return await promisify(this._rcnEngine.lend, [request.id, oracleData, cosignerAddr, cosignerData]);
    }

    return await promisify(this._loanManager.lend, [request.id, oracleData, cosignerAddr, cosignerData, 0]);
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
  async getOracleData(loan: Request): Promise<string> {
    if (loan.oracle === Utils.address0x) {
      return '0x';
    }

    const oracle = this.web3.web3reader.eth.contract(oracleAbi.abi).at(loan.oracle);
    const url = await promisify(oracle.url.call, []);
    if (url === '') { return '0x'; }
    const oracleResponse = (await this.http.get(url).toPromise()) as any[];
    console.info('Searching currency', loan.currency, oracleResponse);
    let data;
    oracleResponse.forEach(e => {
      if (e.currency === loan.currency) {
        data = e.data;
        console.info('Oracle data found', data);
      }
    });
    if (data === undefined) {
      throw new Error('Oracle did not provide data');
    }
    return data;
  }
  async getLoan(id: string): Promise<Request> {
    if (id.startsWith('0x')) {
      // Load Diaspore loan
      const result = await promisify(this._requestsView.getRequest.call, [environment.contracts.diaspore.loanManager, id]);
      if (result.length === 0 ) throw new Error("Loan not found");
      return LoanUtils.parseRequest(environment.contracts.diaspore.loanManager, result);
    }

    return new Promise((resolve, reject) => {
      this._rcnExtension.getLoan.call(this._rcnEngineAddress, id, (err, result) => {
        if (err != null) {
          reject(err);
        } else if (result.length === 0) {
          reject(new Error('Loan does not exist'));
        } else {
          resolve(LoanUtils.parseBasaltLoan(this._rcnEngineAddress, +id, result));
        }
      });
    }) as Promise<Request>;
  }
  async getActiveLoans(): Promise<Loan[]> {
      // TODO: Add Diaspore, currently not supported
    return new Promise((resolve, reject) => {
        // Filter ongoing loans
      const filters = [
        environment.filters.ongoing
      ];

      const params = ['0x0', '0x0', this.addressToBytes32(environment.contracts.decentraland.mortgageCreator)];
      this._rcnExtension.queryLoans.call(this._rcnEngineAddress, 0, 0, filters, params, (err, result) => {
        if (err != null) {
          reject(err);
        }
        resolve(this.parseBasaltBytes(result));
      });
    }) as Promise<Loan[]>;
  }
  async getRequests(): Promise<Request[]> {
    const basalt = new Promise((resolve, reject) => {
          // Filter open loans, non expired loand and valid mortgage
      const filters = [
        environment.filters.openLoans,
        environment.filters.nonExpired,
        environment.filters.validMortgage
      ];

      const params = ['0x0', '0x0', this.addressToBytes32(environment.contracts.decentraland.mortgageCreator)];
      this._rcnExtension.queryLoans.call(this._rcnEngineAddress, 0, 0, filters, params, (err, result) => {
        if (err != null) {
          reject(err);
        }
        resolve(LoanCurator.curateBasaltRequests(this.parseBasaltBytes(result)));
      });
    }) as Promise<Loan[]>;
    const diaspore = new Promise((resolve, reject) => {
      this._requestsView.getRequests(environment.contracts.diaspore.loanManager, 0, 10000, [], (err, result) => {
        if (err != null) {
          reject(err);
          console.error(err);
        }
        resolve(this.parseRequestBytes(result));
      });
    }) as Promise<Request[]>;
    return (await diaspore).concat(await basalt);
  }
  getLoansOfLender(lender: string): Promise<Loan[]> {
    return new Promise((resolve, reject) => {
        // Filter [lenderIn]
      const filters = [environment.filters.lenderIn];
      const params = [this.addressToBytes32(lender)];
      this._rcnExtension.queryLoans.call(this._rcnEngineAddress, 0, 0, filters, params, (err, result) => {
        if (err != null) {
          reject(err);
        }
        resolve(LoanCurator.curateBasaltRequests(this.parseBasaltBytes(result)));
      });
    }) as Promise<Loan[]>;
  }
  readPendingWithdraws(loans: Loan[]): [BigNumber, number[]] {
    const pendingLoans = [];
    let total = 0;

    loans.forEach(loan => {
      if (loan.lenderBalance > 0) {
        total += loan.lenderBalance;
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
  private parseBasaltBytes(bytes: any): BasaltLoan[] {
    const loans = [];
    const total = bytes.length / 20;
    for (let i = 0; i < total; i++) {
      const id = parseInt(bytes[(i * 20) + 19], 16);
      const loanBytes = bytes.slice(i * 20, i * 20 + 20);
      loans.push(LoanUtils.parseBasaltLoan(this._rcnEngineAddress, id, loanBytes));
    }
    return loans;
  }
  private parseRequestBytes(bytes: any): Request[] {
    const requests = [];
    const total = bytes.length / 16;
    for (let i = 0; i < total; i++) {
      const loanBytes = bytes.slice(i * 16, i * 16 + 16);
      requests.push(LoanUtils.parseRequest(environment.contracts.diaspore.loanManager, loanBytes));
    }
    return requests;
  }

  private addressToBytes32(address: string): string {
    return '0x000000000000000000000000' + address.replace('0x', '');
  }
}
