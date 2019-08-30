import { BigNumber } from 'bignumber.js';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Loan } from '../models/loan.model';
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
const converterRampAbi = require('../contracts/ConverterRamp.json');

@Injectable()
export class ContractsService {
  private _rcnContract: any;
  private _rcnContractAddress: string = environment.contracts.rcnToken;

  private _rcnEngine: any;
  private _rcnEngineAddress: string = environment.contracts.basaltEngine;
  private _rcnExtension: any;
  private _rcnExtensionAddress: string = environment.contracts.engineExtension;
  private _rcnConverterRamp: any;
  private _rcnConverterRampAddress: string = environment.contracts.converter.converterRamp;

  constructor(
      private web3: Web3Service,
      private txService: TxService,
      private cosignerService: CosignerService,
      private http: HttpClient
    ) {
    this._rcnContract = this.web3.web3.eth.contract(tokenAbi.abi).at(this._rcnContractAddress);
    this._rcnEngine = this.web3.web3.eth.contract(engineAbi.abi).at(this._rcnEngineAddress);
    this._rcnExtension = this.web3.web3.eth.contract(extensionAbi.abi).at(this._rcnExtensionAddress);
    this._rcnConverterRamp = this.web3.web3.eth.contract(converterRampAbi.abi).at(this._rcnConverterRampAddress);

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

  async isEngineApproved(): Promise<boolean> {
    const account = await this.web3.getAccount();
    return new Promise((resolve, reject) => {
      const pending = this.txService.getLastPendingApprove(this._rcnContractAddress, this._rcnEngineAddress);
      if (pending !== undefined) {
        console.info('Pending engine approved found', pending);
        resolve(pending);
      } else {
        const _web3 = this.web3.web3;
        this._rcnContract.allowance.call(account, this._rcnEngineAddress, function (err, result) {
          if (err != null) {
            reject(err);
          }

          resolve(_web3.fromWei(result) >= _web3.toWei(1000000000));
        });
      }
    }) as Promise<boolean>;
  }

  async approveEngine(): Promise<string> {
    const account = await this.web3.getAccount();
    const txService = this.txService;
    const rcnAddress = this._rcnContractAddress;
    const engineAddress = this._rcnEngineAddress;
    return new Promise((resolve, reject) => {
      const web3 = this.web3.opsWeb3;
      this.loadAltContract(
        web3,
        this._rcnContract
      ).approve(this._rcnEngineAddress, web3.toWei(10 ** 32), { from: account }, function (err, result) {
        if (err != null) {
          reject(err);
        } else {
          txService.registerApproveTx(result, rcnAddress, engineAddress, true);
          resolve(result);
        }
      });
    }) as Promise<string>;
  }

  async disapproveEngine(): Promise<string> {
    const account = await this.web3.getAccount();
    const txService = this.txService;
    const rcnAddress = this._rcnContractAddress;
    const engineAddress = this._rcnEngineAddress;
    return new Promise((resolve, reject) => {
      const web3 = this.web3.opsWeb3;
      this.loadAltContract(
        web3,
        this._rcnContract
      ).approve(this._rcnEngineAddress, 0, { from: account }, function (err, result) {
        if (err != null) {
          reject(err);
        } else {
          txService.registerApproveTx(result, rcnAddress, engineAddress, false);
          resolve(result);
        }
      });
    }) as Promise<string>;
  }
  async estimateEthRequiredAmount(loan: Loan): Promise<BigNumber> {
    let oracleData = await this.getOracleData(loan);
    if (Utils.isEmpty(oracleData)) {
      oracleData = Utils.initBytes();
    }
    const account = await this.web3.getAccount();

    let cosignerData = Utils.initBytes();
    let cosignerAddr = Utils.address0x;
    const cosigner = this.cosignerService.getCosigner(loan);
    if (cosigner !== undefined) {
      const cosignerOffer = await cosigner.offer(loan);
      cosignerAddr = cosignerOffer.contract;
      cosignerData = cosignerOffer.lendData;
    }
    const loanId = loan.id.toString(16);
    const loanIdBytes = Utils.toBytes(loanId);
    const loanParams = [
      this.addressToBytes32(environment.contracts.basaltEngine),
      loanIdBytes,
      this.addressToBytes32(cosignerAddr)
    ];
    const convertParams = [
      environment.contracts.converter.params.marginSpend,
      environment.contracts.converter.params.maxSpend,
      environment.contracts.converter.params.rebuyThreshold
    ];
    return new Promise((resolve, reject) => {
      this._rcnConverterRamp.requiredLendSell.call(
        environment.contracts.converter.tokenConverter,
        environment.contracts.converter.ethAddress,
        loanParams,
        oracleData,
        cosignerData,
        convertParams,
        { from: account },
        (err, result) => {
          if (err != null) {
            reject(err);
          } else {
            resolve(result);
          }
        }
      );
    }) as Promise<BigNumber>;
  }
  async estimateLendAmount(loan: Loan): Promise<BigNumber> {
    // TODO: Calculate and add cost of the cosigner
    if (loan.oracle === Utils.address0x) {
      return loan.rawAmount;
    }
    const oracleData = await this.getOracleData(loan);
    const oracle = this.web3.web3.eth.contract(oracleAbi.abi).at(loan.oracle);
    const oracleRate = await promisify(oracle.getRate, [loan.currency, oracleData]);
    const rate = oracleRate[0];
    const decimals = oracleRate[1];
    console.info('Oracle rate obtained', rate, decimals);
    const required = (rate * loan.rawAmount * 10 ** (18 - decimals) / 10 ** 18) * 1.02;
    console.info('Estimated required rcn is', required);
    return required;
  }
  async estimatePayAmount(loan: Loan, amount: number): Promise<number> {
    if (loan.oracle === Utils.address0x) {
      return loan.rawAmount;
    }
    const oracleData = await this.getOracleData(loan);
    const oracle = this.web3.web3.eth.contract(oracleAbi.abi).at(loan.oracle);
    const oracleRate = await promisify(oracle.getRate, [loan.currency, oracleData]);
    const rate = oracleRate[0];
    const decimals = oracleRate[1];
    console.info('Oracle rate obtained', rate, decimals);
    const required = (rate * amount * 10 ** (18 - decimals) / 10 ** 18) * 1.02;
    console.info('Estimated required rcn is', required);
    return required;
  }
  async payLoan(loan: Loan, amount: number): Promise<string> {
    const account = await this.web3.getAccount();
    const pOracleData = this.getOracleData(loan);
    const oracleData = await pOracleData;

    return new Promise((resolve, reject) => {
      this.loadAltContract(
        this.web3.opsWeb3,
        this._rcnEngine
      ).pay(loan.id, amount, account, oracleData, { from: account }, function(err, result) {
        if (err != null) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    }) as Promise<string>;
  }
  async lendLoan(loan: Loan): Promise<string> {
    const pOracleData = this.getOracleData(loan);
    const account = await this.web3.getAccount();
    const cosigner = this.cosignerService.getCosigner(loan);
    let cosignerAddr = '0x0';
    let cosignerData = '0x0';
    if (cosigner !== undefined) {
      const cosignerOffer = await cosigner.offer(loan);
      cosignerAddr = cosignerOffer.contract;
      cosignerData = cosignerOffer.lendData;
    }
    const oracleData = await pOracleData;
    return new Promise((resolve, reject) => {
      this.loadAltContract(
        this.web3.opsWeb3,
        this._rcnEngine
      ).lend(
        loan.id,
        oracleData,
        cosignerAddr,
        cosignerData,
        { from: account },
        function(err, result) {
          if (err != null) {
            reject(err);
          } else {
            resolve(result);
          }
        }
      );
    }) as Promise<string>;
  }
  async lendLoanWithSwap(loan: Loan, value: number): Promise<string> {
    const pOracleData = this.getOracleData(loan);
    const account = await this.web3.getAccount();
    const cosigner = this.cosignerService.getCosigner(loan);
    let cosignerData = Utils.initBytes();
    let cosignerAddr = Utils.address0x;
    if (cosigner !== undefined) {
      const cosignerOffer = await cosigner.offer(loan);
      cosignerAddr = cosignerOffer.contract;
      cosignerData = cosignerOffer.lendData;
    }
    const oracleData = await pOracleData;
    const loanId = loan.id.toString(16);
    const loanIdBytes = Utils.toBytes(loanId);
    const loanParams = [
      this.addressToBytes32(environment.contracts.basaltEngine),
      loanIdBytes,
      this.addressToBytes32(cosignerAddr)
    ];
    const convertParams = [
      environment.contracts.converter.params.marginSpend,
      environment.contracts.converter.params.maxSpend,
      environment.contracts.converter.params.rebuyThreshold
    ];
    return new Promise((resolve, reject) => {
      this.loadAltContract(
        this.web3.opsWeb3,
        this._rcnConverterRamp
      ).lend(
        environment.contracts.converter.tokenConverter,
        environment.contracts.converter.ethAddress,
        loanParams,
        oracleData,
        cosignerData,
        convertParams,
        {
          from: account,
          value: value
        },
        (err, result) => {
          if (err != null) {
            reject(err);
          } else {
            resolve(result);
          }
        }
      );
    }) as Promise<string>;
  }
  async transferLoan(loan: Loan, to: string): Promise<string> {
    const account = await this.web3.getAccount();
    return new Promise((resolve, reject) => {
      this.loadAltContract(
        this.web3.opsWeb3,
        this._rcnEngine
      ).transfer(to, loan.id, { from: account }, function(err, result) {
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
      this.loadAltContract(
        this.web3.opsWeb3,
        this._rcnEngine
      ).withdrawalList(loans, account, { from: account }, (err, result) => {
        if (err != null) {
          reject(err);
        }
        resolve(result);
      });
    }) as Promise<string>;
  }
  async getOracleData(loan: Loan): Promise<string> {
    if (loan.oracle === Utils.address0x) {
      return '0x';
    }

    const oracle = this.web3.web3.eth.contract(oracleAbi.abi).at(loan.oracle);
    const url = await promisify(oracle.url.call, []);
    if (url === '') { return '0x'; }
    const oracleResponse = await this.http.get(url).toPromise() as any[];
    console.info('Searching currency', loan.currencyRaw);
    let data;
    oracleResponse.forEach(e => {
      if (e.currency === loan.currencyRaw) {
        data = e.data;
        console.info('Oracle data found', data);
      }
    });

    if (data === undefined) {
      throw new Error('Oracle did not provide data');
    }
    return data;
  }
  async getLoan(id: number): Promise<Loan> {
    return new Promise((resolve, reject) => {
      this._rcnExtension.getLoan.call(this._rcnEngineAddress, id, (err, result) => {
        if (err != null) {
          reject(err);
        } else if (result.length === 0) {
          reject(new Error('Loan does not exist'));
        } else {
          resolve(LoanUtils.loanFromBytes(this._rcnEngineAddress, id, result));
        }
      });
    }) as Promise<Loan>;
  }
  async getActiveLoans(): Promise<Loan[]> {
    return new Promise((resolve, reject) => {
        // Filter ongoing loans
      const filters = [
        environment.filters.ongoing
      ];

      const params = ['0x0', '0x0', this.addressToBytes32(environment.contracts.decentraland.mortgageCreator)];
      this._rcnExtension.queryLoans.call(this._rcnEngineAddress, 0, 25, filters, params, (err, result) => {
        if (err != null) {
          reject(err);
        }
        resolve(LoanCurator.curateLoans(this.parseLoansBytes(result)));
      });
    }) as Promise<Loan[]>;
  }
  async getOpenLoans(): Promise<Loan[]> {
    return new Promise((resolve, reject) => {
          // Filter open loans, non expired loand and valid mortgage
      const filters = [
        environment.filters.openLoans,
        environment.filters.nonExpired,
        environment.filters.validMortgage
      ];

      const params = [
        '0x0',
        '0x0',
        Utils.toBytes32(environment.contracts.decentraland.mortgageCreator)
      ];

      this._rcnExtension.queryLoans.call(this._rcnEngineAddress, 0, 0, filters, params, (err, result) => {
        if (err != null) {
          reject(err);
        }
        resolve(LoanCurator.curateLoans(this.parseLoansBytes(result)));
      });
    }) as Promise<Loan[]>;
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
        resolve(LoanCurator.curateLoans(this.parseLoansBytes(result)));
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
    return new Promise((resolve) => {
      this.getLoansOfLender(account).then((loans: Loan[]) => {
        resolve(this.readPendingWithdraws(loans));
      });
    }) as Promise<[number, number[]]>;
  }
  private loadAltContract(web3: any, contract: any): any {
    return web3.eth.contract(contract.abi).at(contract.address);
  }
  private parseLoansBytes(bytes: any): Loan[] {
    const loans = [];
    const total = bytes.length / 20;
    for (let i = 0; i < total; i++) {
      const id = parseInt(bytes[(i * 20) + 19], 16);
      const loanBytes = bytes.slice(i * 20, i * 20 + 20);
      loans.push(LoanUtils.loanFromBytes(this._rcnEngineAddress, id, loanBytes));
    }
    return loans;
  }
  private addressToBytes32(address: string): string {
    return '0x000000000000000000000000' + address.replace('0x', '');
  }
}
