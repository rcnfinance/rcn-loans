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
const loanManagerAbi = require('../contracts/LoanManager.json');
const debtEngineAbi = require('../contracts/DebtEngine.json');
const diasporeOracleAbi = require('../contracts/DiasporeOracle.json');
const converterRampAbi = require('../contracts/ConverterRamp.json');
const tokenConverterAbi = require('../contracts/TokenConverter.json');
const oracleFactoryAbi = require('../contracts/OracleFactory.json');
// const requestsAbi = require('../contracts/RequestsView.json');

@Injectable()
export class ContractsService {
  private _rcnEngine: any;
  private _rcnEngineAddress: string = environment.contracts.basaltEngine;
  private _rcnExtension: any;
  private _rcnExtensionAddress: string = environment.contracts.engineExtension;
  private _loanManager: any;
  private _debtEngine: any;
  private _rcnConverterRampAddress: string = environment.contracts.converter.converterRamp;
  private _rcnConverterRamp: any;
  private _tokenConverterAddress: string = environment.contracts.converter.tokenConverter;
  private _tokenConverter: any;
  private _oracleFactoryAddress: string = environment.contracts.oracleFactory;
  private _oracleFactory: any;

  constructor(
    private http: HttpClient,
    private web3: Web3Service,
    private txService: TxService,
    private cosignerService: CosignerService,
    private apiService: ApiService
  ) {
    this._rcnEngine = this.makeContract(engineAbi.abi, this._rcnEngineAddress);
    this._loanManager = this.makeContract(loanManagerAbi, environment.contracts.diaspore.loanManager);
    this._debtEngine = this.makeContract(debtEngineAbi, environment.contracts.diaspore.debtEngine);
    this._rcnExtension = this.makeContract(extensionAbi.abi, this._rcnExtensionAddress);
    this._rcnConverterRamp = this.makeContract(converterRampAbi.abi, this._rcnConverterRampAddress);
    this._tokenConverter = this.makeContract(tokenConverterAbi.abi, this._tokenConverterAddress);
    this._oracleFactory = this.makeContract(oracleFactoryAbi.abi, this._oracleFactoryAddress);
  }

  /**
   * Make contract private variable
   * @param abi Contract ABI
   * @param address Contract address
   * @return Contract object
   */
  makeContract(abi: string, address: string) {
    return this.web3.web3.eth.contract(abi).at(address);
  }

  /**
   * Get user ETH balance
   * @return Balance in wei
   */
  async getUserBalanceETHWei(): Promise<number> {
    return await this.getUserBalanceInToken(environment.contracts.converter.ethAddress);
  }

  /**
   * Get user RCN balance
   * @return Balance in wei
   */
  async getUserBalanceRCNWei(): Promise<number> {
    return await this.getUserBalanceInToken(environment.contracts.rcnToken);
  }

  /**
   * Get user RCN balance
   * @return Balance
   */
  async getUserBalanceRCN(): Promise<number> {
    const balance = await this.getUserBalanceInToken(environment.contracts.rcnToken);
    return this.web3.web3.fromWei(balance);
  }

  /**
   * Get user balance in selected token
   * @param tokenAddress Token address
   * @return Balance amount
   */
  async getUserBalanceInToken(
    tokenAddress: string = environment.contracts.rcnToken
  ): Promise<number> {
    const account = await this.web3.getAccount();

    return new Promise(async (resolve, reject) => {
      const tokenContract = this.makeContract(tokenAbi.abi, tokenAddress);

      if (!this.tokenIsValid(tokenAddress)) {
        reject('The currency does not exist');
      }

      if (tokenAddress === environment.contracts.converter.ethAddress) {
        const ethBalance = await this.web3.web3.eth.getBalance(account);
        resolve(ethBalance);
      }

      tokenContract.balanceOf.call(account, (err, balance) => {
        if (err != null) {
          reject(err);
        }
        resolve(balance);
      });
    }) as Promise<number>;
  }

  /**
   * Check if the contract is approved for operate with ERC20 token
   * @param contract Contract address
   * @param tokenAddress Token address
   * @return Pending tx or boolean
   */
  async isApproved(
    contract: string,
    tokenAddress: string = environment.contracts.rcnToken
  ): Promise<boolean> {
    const pending = this.txService.getLastPendingApprove(tokenAddress, contract);
    const ethAddress = environment.contracts.converter.ethAddress;

    if (pending !== undefined) {
      return true;
    }

    switch (tokenAddress) {
      // eth does not require approve
      case ethAddress:
        return true;

      // check if token is valid and approved
      default:
        const tokenContract = this.makeContract(tokenAbi.abi, tokenAddress);
        const result: number = await promisify(tokenContract.allowance.call, [
          await this.web3.getAccount(),
          contract
        ]);
        return result >= this.web3.web3.toWei(1000000000);
    }
  }

  /**
   * Approve contract for operate with token
   * @param contract Contract address
   * @param tokenAddress Token address
   * @return Tx hash
   */
  async approve(
    contract: string,
    tokenAddress: string = environment.contracts.rcnToken
  ): Promise<string> {
    const account = await this.web3.getAccount();
    const web3 = this.web3.opsWeb3;

    if (!this.tokenIsValid(tokenAddress)) {
      throw Error('The currency does not exist');
    }

    const tokenContract = this.makeContract(tokenAbi.abi, tokenAddress);
    const result = await promisify(this.loadAltContract(web3, tokenContract).approve, [
      contract,
      web3.toWei(10 ** 32),
      {
        from: account
      }
    ]);

    this.txService.registerApproveTx(result, tokenAddress, contract, true);
    return result;
  }

  /**
   * Disapprove contract for operate with token
   * @param contract Contract address
   * @param tokenAddress Token address
   * @return Tx hash
   */
  async disapprove(
    contract: string,
    tokenAddress: string = environment.contracts.rcnToken
  ): Promise<string> {
    const account = await this.web3.getAccount();
    const web3 = this.web3.opsWeb3;

    if (!this.tokenIsValid(tokenAddress)) {
      throw Error('The currency does not exist');
    }

    const tokenContract = this.makeContract(tokenAbi.abi, tokenAddress);
    const result = await promisify(this.loadAltContract(web3, tokenContract).approve, [
      contract,
      0,
      { from: account }
    ]);

    this.txService.registerApproveTx(result, tokenAddress, contract, false);
    return result;
  }

  /**
   * Return estimated lend amount in RCN
   * @param loan Loan payload
   * @param tokenAddress Amount in the selected token
   * @return Required amount
   */
  async estimateLendAmount(
    loan: Loan,
    tokenAddress: string = environment.contracts.rcnToken
  ): Promise<number> {
    const rcnToken = environment.contracts.rcnToken;

    let required: number;
    required = loan.amount;

    if (loan.oracle.address !== Utils.address0x) {
      const oracle = this.web3.web3.eth.contract(oracleAbi.abi).at(loan.oracle.address);
      const oracleData = await this.getOracleData(loan.oracle);
      const oracleRate = await promisify(oracle.readSample.call, [oracleData]);
      const rate = oracleRate[0];
      const decimals = oracleRate[1];
      required = (rate * loan.amount) / decimals;
    }

    // amount in rcn
    if (tokenAddress === rcnToken) {
      return required;
    }

    // amount in currency
    const requiredInToken = await this.getPriceConvertFrom(
      rcnToken,
      tokenAddress,
      required
    );

    return requiredInToken;
  }

  /**
   * Lend loan using ConverterRamp
   * @param payableAmount Ether amount
   * @param converter Converter address
   * @param fromToken From token address
   * @param maxSpend Max fromToken to spend during lend
   * @param cosigner Cosigner address
   * @param loanId Loan ID
   * @param oracleData Oracle data
   * @param cosignerData Cosigner data
   * @param account Account address
   * @return Required amount
   */
  async converterRampLend(
    payableAmount: number,
    converter: string,
    fromToken: string,
    maxSpend: number,
    cosigner: string,
    loanId: string,
    oracleData: string,
    cosignerData: string,
    callbackData: string,
    account: string
  ) {
    const web3 = this.web3.opsWeb3;
    return await promisify(this.loadAltContract(web3, this._rcnConverterRamp).lend, [
      converter,
      fromToken,
      maxSpend,
      cosigner,
      loanId,
      oracleData,
      cosignerData,
      callbackData,
      {
        from: account,
        value: payableAmount
      }
    ]);
  }

  /**
   * Pay loan using ConverterRamp
   * @param payableAmount Ether amount
   * @param converter TokenConverter address
   * @param fromToken From token address
   * @param loanManager Loan Manager address
   * @param debtEngine Debt Engine address
   * @param loanId Loan ID
   * @param oracleData Oracle data
   * @param account Account address
   * @return Required amount
   */
  async converterRampPay(
    payableAmount: number,
    converter: string,
    fromToken: string,
    loanManager: string,
    debtEngine: string,
    loanId: string,
    oracleData: string,
    account: string
  ) {
    const web3 = this.web3.opsWeb3;
    return await promisify(this.loadAltContract(web3, this._rcnConverterRamp).pay, [
      payableAmount,
      converter,
      fromToken,
      loanManager,
      debtEngine,
      account,
      loanId,
      oracleData,
      { from: account }
    ]);
  }

  /**
   * Get the cost, in wei, of making a convertion using the value specified
   * @param fromToken From token address
   * @param toToken To token address
   * @param fromAmount Amount to convert
   * @return Receive amount
   */
  async getPriceConvertFrom(
    fromToken: string,
    toToken: string,
    fromAmount: number
  ) {
    return await promisify(this._tokenConverter.getPriceConvertFrom, [
      fromToken,
      toToken,
      fromAmount
    ]);
  }

  /**
   * Get the cost, in wei, of making a convertion using the value specified
   * @param fromToken From token address
   * @param toToken To token address
   * @param amount Amount to convert
   * @return Spend amount
   */
  async getPriceConvertTo(
    fromToken: string,
    toToken: string,
    toAmount: number
  ) {
    return await promisify(this._tokenConverter.getPriceConvertTo, [
      fromToken,
      toToken,
      toAmount
    ]);
  }

  async lendLoan(loan: Loan): Promise<string> {
    const pOracleData = await this.getOracleData(loan.oracle);
    console.info('oracle Data', pOracleData);
    const cosigner = this.cosignerService.getCosigner(loan);
    let cosignerAddr = '0x0';
    let cosignerData = '0x0';

    if (cosigner !== undefined) {
      const cosignerOffer = await cosigner.offer(loan);
      cosignerAddr = cosignerOffer.contract;
      cosignerData = cosignerOffer.lendData;
    }

    const callbackData = '0x0';
    const oracleData = pOracleData;
    const web3 = this.web3.opsWeb3;
    const account = await this.web3.getAccount();

    switch (loan.network) {
      case Network.Basalt:
        return await promisify(this.loadAltContract(web3, this._rcnEngine).lend,
          [loan.id, oracleData, cosignerAddr, cosignerData, { from: account }]);

      case Network.Diaspore:
        return await promisify(this.loadAltContract(web3, this._loanManager).lend,
          [loan.id, oracleData, cosignerAddr, 0, cosignerData, callbackData, { from: account }]);

      default:
        throw Error('Unknown network');
    }
  }

  /**
   * Get oracle rate
   * @param oracleAddress Oracle address
   * @return Token equivalent in wei
   */
  async getRate(oracleAddress: string): Promise<any> {
    const web3: any = this.web3.web3;
    if (oracleAddress === Utils.address0x) {
      return web3.toWei(1);
    }

    const oracle = this.makeContract(oracleAbi.abi, oracleAddress);
    const oracleRate = await promisify(oracle.readSample.call, []);
    const amount = web3.toWei(1);
    const tokens = oracleRate[0];
    const equivalent = oracleRate[1];

    let rate = new web3.BigNumber(tokens).div(equivalent);
    rate = new web3.BigNumber(1).div(rate);
    rate = rate.mul(amount);

    return rate;
  }

  async estimatePayAmount(loan: Loan, amount: number): Promise<number> {
    if (loan.oracle.address === Utils.address0x) {
      return amount;
    }

    const oracleData = await this.getOracleData(loan.oracle);

    if (loan.network === Network.Basalt) {
      const legacyOracle = this.web3.web3.eth.contract(oracleAbi.abi).at(loan.oracle.address);
      const oracleRate = await promisify(legacyOracle.getRate, [loan.oracle.code, oracleData]);
      const rate = oracleRate[0];
      const decimals = oracleRate[1];
      console.info('Oracle rate obtained', rate, decimals);
      const required = (rate * amount * 10 ** (18 - decimals) / 10 ** 18) * 1.02;
      console.info('Estimated required rcn is', required);
      return required;
    }

    const oracle = this.web3.web3.eth.contract(diasporeOracleAbi).at(loan.oracle.address);
    const oracleResult = await promisify(oracle.readSample.call, [oracleData]);

    const tokens = oracleResult[0];

    const equivalent = oracleResult[1];
    return (tokens * amount) / equivalent;
  }

  async payLoan(loan: Loan, amount: number): Promise<string> {
    const account = await this.web3.getAccount();
    const pOracleData = this.getOracleData(loan.oracle);
    const oracleData = await pOracleData;
    const web3 = this.web3.opsWeb3;

    switch (loan.network) {
      case Network.Basalt:
        return await promisify(this.loadAltContract(web3, this._rcnEngine).pay, [loan.id, amount, account, oracleData, { from: account }]);
      case Network.Diaspore:
        return await promisify(this.loadAltContract(web3, this._debtEngine).pay,
          [loan.id, amount, account, oracleData, { from: account }]);
      default:
        throw Error('Unknown network');
    }
  }

  async transferLoan(loan: Loan, to: string): Promise<string> {
    const account = await this.web3.getAccount();
    const web3 = this.web3.opsWeb3;
    switch (loan.network) {
      case Network.Basalt:
        return await promisify(this.loadAltContract(web3, this._rcnEngine).transfer, [to, loan.id, { from: account }]);
      case Network.Diaspore:
        return await promisify(this.loadAltContract(web3, this._debtEngine).safeTransferFrom,
          [account, to, loan.id, { from: account }]);
      default:
        throw Error('Unknown network');
    }
  }

  async withdrawFundsBasalt(basaltIdLoans: number[]): Promise<string> {
    const account = await this.web3.getAccount();
    const web3 = this.web3.opsWeb3;

    return await promisify(this.loadAltContract(web3, this._rcnEngine).withdrawalList,
      [basaltIdLoans, account, { from: account }]);
  }

  async withdrawFundsDiaspore(diasporeIdLoans: number[]): Promise<string> {
    const account = await this.web3.getAccount();
    const web3 = this.web3.opsWeb3;

    console.info('loans to withdraw diaspore', diasporeIdLoans);
    return await promisify(this.loadAltContract(web3, this._debtEngine).withdrawBatch,
      [diasporeIdLoans, account, { from: account }]);
  }

  /**
   * Get oracle object data
   * @param oracle Oracle
   * @return Oracle data
   */
  async getOracleData(oracle?: Oracle): Promise<string> {
    if (oracle.address === Utils.address0x) {
      return '0x';
    }

    const oracleContract = this.web3.web3.eth.contract(diasporeOracleAbi).at(oracle.address);
    const oracleUrl = await promisify(oracleContract.url.call, []);
    if (oracleUrl === '') {
      return '0x';
    }

    const oracleResponse = (await this.http.get(oracleUrl).toPromise()) as any[];
    console.info('Searching currency', oracle.code, oracleResponse);

    let data;
    oracleResponse.forEach(e => {
      if (e.currency === oracle.code) {
        data = e.data;
        console.info('Oracle data found', e);
      }
    });
    if (data === undefined) {
      throw new Error('Oracle did not provide data');
    }

    return data;
  }

  async getOracleUrl(oracle?: Oracle): Promise<string> {
    const oracleContract = this.web3.web3.eth.contract(diasporeOracleAbi).at(oracle.address);
    const url = await promisify(oracleContract.url.call, []);
    return url;
  }

  /**
   * Get oracle address from currency symbol
   * @param symbol Currency symbol
   * @return Oracle address
   */
  async symbolToOracle(symbol: string) {
    return await promisify(this._oracleFactory.symbolToOracle.call, [symbol]);
  }

  /**
   * Get currency symbol from oracle address
   * @param oracle Oracle address
   * @return Currency symbol
   */
  async oracleToSymbol(oracle: string) {
    return await promisify(this._oracleFactory.oracleToSymbol.call, [oracle]);
  }

  async getLoan(id: string): Promise<Loan> {
    if (id.startsWith('0x')) {
      // Load Diaspore loan
      return await this.apiService.getLoan(id);
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
    // const dfilter = [
    //   // Created by loan manager
    //   this.addressToBytes32(environment.contracts.diaspore.filters.debtCreator),
    //   this.addressToBytes32(this._loanManager.address),
    //   // Ongoing status
    //   this.addressToBytes32(environment.contracts.diaspore.filters.isStatus),
    //   Utils.toBytes32('0x1')
    // ];
    // const pdiaspore = promisify(this._requestsView.getLoans, [this._loanManager.address, dfilter]);
    // return this.parseLoanBytes(await pdiaspore).concat(this.parseBasaltBytes(await pbasalt));
    // return this.parseLoanBytes(await pdiaspore);

    const activeDiasporeLoans = this.apiService.getActiveLoans();
    return (await activeDiasporeLoans).concat(LoanCurator.curateLoans(this.parseBasaltBytes(await pbasalt)));
    // return activeDiasporeLoans;

  }
  async getRequests(): Promise<Loan[]> {
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

        resolve(LoanCurator.curateLoans(this.parseBasaltBytes(result)));
      });
    }) as Promise<Loan[]>;

    const web3 = await this.web3.web3;

    const block = await web3.eth.getBlock('latest');
    const now = block.timestamp;

    const diaspore = this.apiService.getRequests(now);

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
    // return diaspore;
    return (await diaspore).concat(await basalt);
  }

  async getLoansOfLender(lender: string): Promise<Loan[]> {
    // Filter [lenderIn] Basalt loans
    const bfilters = [environment.filters.lenderIn];
    const bparams = [this.addressToBytes32(lender)];
    const pbasalt = await promisify(this._rcnExtension.queryLoans.call, [this._rcnEngineAddress, 0, 0, bfilters, bparams]);
    // // Filter lenderIn Diaspore loans
    // const dfilter = [
    //   // Created by loan manager
    //   this.addressToBytes32(environment.contracts.diaspore.filters.debtCreator),
    //   this.addressToBytes32(this._loanManager.address),
    //   // Lender in
    //   this.addressToBytes32(environment.contracts.diaspore.filters.isLender),
    //   this.addressToBytes32(lender)
    // ];
    // const pdiaspore = promisify(this._requestsView.getLoans, [this._loanManager.address, dfilter]);
    // // return this.parseLoanBytes(await pdiaspore).concat(this.parseBasaltBytes(await pbasalt));
    // return this.parseLoanBytes(await pdiaspore);

    const pdiaspore = await this.apiService.getLoansOfLender(lender);
    return (pdiaspore).concat(LoanCurator.curateLoans(this.parseBasaltBytes(pbasalt)));
    // return await pdiaspore;
  }

  readPendingWithdraws(loans: Loan[]): [BigNumber, number[], BigNumber, number[]] {
    const pendingBasaltLoans = [];
    const pendingDiasporeLoans = [];
    let totalBasalt = 0;
    let totalDiaspore = 0;

    loans.forEach(loan => {
      if (loan.debt && loan.debt.balance > 0 && loan.network === Network.Basalt) {
        totalBasalt += loan.debt.balance;
        pendingBasaltLoans.push(loan.id);
      } else if (loan.debt && loan.debt.balance > 0 && loan.network === Network.Diaspore) {
        totalDiaspore += loan.debt.balance;
        pendingDiasporeLoans.push(loan.id);
      }
    });
    return [totalBasalt, pendingBasaltLoans, totalDiaspore, pendingDiasporeLoans];
  }

  async getPendingWithdraws(): Promise<[number, number[], number, number[]]> {
    const account = await this.web3.getAccount();

    return new Promise((resolve, _reject) => {
      this.getLoansOfLender(account).then((loans: Loan[]) => {
        resolve(this.readPendingWithdraws(loans));
      });
    }) as Promise<[number, number[], number, number[]]>;
  }

  /**
   * Check if token is valid
   * @param tokenAddress Token address
   * @return Boolean
   */
  private tokenIsValid(tokenAddress): boolean {
    const currencies = environment.usableCurrencies;
    const currency = currencies.filter(token => token.address === tokenAddress);

    if (currency.length) {
      return true;
    }

    return false;
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
  // private parseRequestBytes(bytes: any): Loan[] {
  //   const requests = [];
  //   const total = bytes.length / 17;
  //   for (let i = 0; i < total; i++) {
  //     const loanBytes = bytes.slice(i * 17, i * 17 + 17);
  //     requests.push(LoanUtils.parseLoan(environment.contracts.diaspore.loanManager, loanBytes));
  //   }
  //   return requests;
  // }
  // private parseLoanBytes(bytes: any): Loan[] {
  //   const requests = [];
  //   const total = bytes.length / 25;
  //   for (let i = 0; i < total; i++) {
  //     const loanBytes = bytes.slice(i * 25, i * 25 + 25);
  //     requests.push(LoanUtils.parseLoan(environment.contracts.diaspore.loanManager, loanBytes));
  //   }
  //   return requests;
  // }
  private addressToBytes32(address: string): string {
    try {
      address = '0x000000000000000000000000' + address.replace('0x', '');
      return address;
    } catch (e) {
      return null;
    }
  }
  private loadAltContract(web3: any, contract: any): any {
    return web3.eth.contract(contract.abi).at(contract.address);
  }
}
