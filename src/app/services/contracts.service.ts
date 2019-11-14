import { BigNumber } from 'bignumber.js';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Loan, Oracle, Network } from '../models/loan.model';
import { LoanCurator } from './../utils/loan-curator';
import { environment } from '../../environments/environment';
import { Web3Service } from './web3.service';
import { TxService } from '../services/tx.service';
import { CosignerService } from './cosigner.service';
import { ApiService } from './api.service';
import { promisify, Utils } from './../utils/utils';

declare let require: any;

const tokenAbi = require('../contracts/Token.json');
const engineAbi = require('../contracts/NanoLoanEngine.json');
const loanManagerAbi = require('../contracts/LoanManager.json');
const debtEngineAbi = require('../contracts/DebtEngine.json');
const diasporeOracleAbi = require('../contracts/Oracle.json');
const basaltOracleAbi = require('../contracts/BasaltOracle.json');
const converterRampAbi = require('../contracts/ConverterRamp.json');
const tokenConverterAbi = require('../contracts/TokenConverter.json');
const oracleFactoryAbi = require('../contracts/OracleFactory.json');
const installmentsModelAbi = require('../contracts/InstallmentsModel.json');
const collateralAbi = require('../contracts/Collateral.json');
const collateralWethManagerAbi = require('../contracts/CollateralWETHManager.json');

@Injectable()
export class ContractsService {
  private _rcnEngine: any;
  private _rcnEngineAddress: string = environment.contracts.basaltEngine;
  private _loanManager: any;
  private _debtEngine: any;
  private _rcnConverterRampAddress: string = environment.contracts.converter.converterRamp;
  private _rcnConverterRamp: any;
  private _tokenConverterAddress: string = environment.contracts.converter.tokenConverter;
  private _tokenConverter: any;
  private _oracleFactoryAddress: string = environment.contracts.oracleFactory;
  private _oracleFactory: any;
  private _installmentsModelAddress: string = environment.contracts.models.installments;
  private _installmentsModel: any;
  private _collateralAddress: string = environment.contracts.collateral.collateral;
  private _collateral: any;
  private _collateralWethManagerAddress: string = environment.contracts.collateral.wethManager;
  private _collateralWethManager: any;

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
    this._rcnConverterRamp = this.makeContract(converterRampAbi.abi, this._rcnConverterRampAddress);
    this._tokenConverter = this.makeContract(tokenConverterAbi.abi, this._tokenConverterAddress);
    this._oracleFactory = this.makeContract(oracleFactoryAbi.abi, this._oracleFactoryAddress);
    this._installmentsModel = this.makeContract(installmentsModelAbi.abi, this._installmentsModelAddress);
    this._collateral = this.makeContract(collateralAbi.abi, this._collateralAddress);
    this._collateralWethManager = this.makeContract(collateralWethManagerAbi.abi, this._collateralWethManagerAddress);
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
   * Check if the contract is approved for operate with ERC721
   * @param contractAddress ERC721 address
   * @param operatorAddress address to be disapproved
   * @return Boolean
   */
  async isApprovedERC721(contractAddress: string, operatorAddress: string) {
    const account = await this.web3.getAccount();
    const erc721 = this.makeContract(tokenAbi.abi, contractAddress);
    return await promisify(erc721.isApprovedForAll.call, [
      operatorAddress,
      account
    ]);
  }

  /**
   * Approve contract for operate with erc721
   * @param contractAddress ERC721 address
   * @param operatorAddress address to be approved
   * @return Tx hash
   */
  async approveERC721(contractAddress: string, operatorAddress: string) {
    const account = await this.web3.getAccount();
    const erc721: any = {
      contractAddress
    };
    // FIXME: this.makeContract(tokenAbi.abi, contractAddress);
    return await erc721.setApprovalForAll(operatorAddress, true, { from: account });
  }

  /**
   * Disapprove contract for operate with erc721
   * @param contractAddress ERC721 address
   * @param operatorAddress address to be disapproved
   * @return Tx hash
   */
  async disapproveERC721(contractAddress: string, operatorAddress: string) {
    const account = await this.web3.getAccount();
    const erc721: any = {
      contractAddress
    };
    // FIXME: this.makeContract(tokenAbi.abi, contractAddress);
    return await erc721.setApprovalForAll(operatorAddress, false, { from: account });
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

    const oracleAbi = this.loanOracleAbi(loan.network);

    if (loan.oracle.address !== Utils.address0x) {
      const oracle = this.web3.web3.eth.contract(oracleAbi).at(loan.oracle.address);
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

    const oracle = this.makeContract(diasporeOracleAbi.abi, oracleAddress);
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
    const oracleAbi = this.loanOracleAbi(loan.network);
    const oracle = this.web3.web3.eth.contract(oracleAbi).at(loan.oracle.address);

    try {
      switch (loan.network) {
        case Network.Basalt:
          const oracleRate = await promisify(oracle.getRate, [loan.oracle.code, oracleData]);
          const rate = oracleRate[0];
          const decimals = oracleRate[1];
          console.info('Oracle rate obtained', rate, decimals);
          const required = (rate * amount * 10 ** (18 - decimals) / 10 ** 18) * 1.02;
          console.info('Estimated required rcn is', required);
          return required;

        case Network.Diaspore:
          const oracleResult = await promisify(oracle.readSample.call, [oracleData]);
          const tokens = oracleResult[0];
          const equivalent = oracleResult[1];
          return (tokens * amount) / equivalent;

        default:
          break;
      }
    } catch (e) {
      console.error(e);
      throw Error('Oracle did not provide data');
    }
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

    const oracleContract = this.web3.web3.eth.contract(diasporeOracleAbi.abi).at(oracle.address);
    const oracleUrl = await promisify(oracleContract.url.call, []);
    if (oracleUrl === '') {
      return '0x';
    }

    try {
      const oracleResponse: any = await this.http.get(oracleUrl).toPromise();
      console.info('Searching currency', oracle.code, oracleResponse);

      let oracleData;

      oracleResponse.map(({ currency, data }) => {
        if (currency === oracle.code) {
          oracleData = data;
          console.info('Oracle data found', data);
        }
      });

      if (oracleData === undefined) {
        throw new Error('Oracle did not provide data');
      }

      return oracleData;
    } catch (e) {
      console.error(e);
      throw Error('Oracle did not provide data');
    }
  }

  async getOracleUrl(oracle?: Oracle): Promise<string> {
    const oracleContract = this.web3.web3.eth.contract(diasporeOracleAbi.abi).at(oracle.address);
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

  /**
   * Loads loan by ID
   * @param id Loan ID
   * @return Loan
   */
  async getLoan(id: string): Promise<Loan> {
    if (id.startsWith('0x')) {
      return await this.apiService.getLoan(id, Network.Diaspore);
    }

    return await this.apiService.getLoan(id, Network.Basalt);
  }

  /**
   * Gets all loans that were lent and there status is ongoing. Meaning that
   * they are not canceled or finished.
   * @return Loans array
   */
  async getActiveLoans(): Promise<Loan[]> {
    const diaspore: Loan[] = await this.apiService.getActiveLoans(Network.Diaspore);
    const basalt: Loan[] = await this.apiService.getActiveLoans(Network.Basalt);

    return diaspore.concat(LoanCurator.curateLoans(basalt));
  }

  /**
   * Get all loans request that are open, not canceled or expired.
   * @return Loans array
   */
  async getRequests(): Promise<Loan[]> {
    const web3 = await this.web3.web3;
    const block = await web3.eth.getBlock('latest');
    const now = block.timestamp;
    const diaspore: Loan[] = await this.apiService.getRequests(now, Network.Diaspore);
    const basalt: Loan[] = await this.apiService.getRequests(now, Network.Basalt);

    return diaspore.concat(LoanCurator.curateLoans(basalt));
  }

  /**
   * Loads all loans lent by the specified account
   * @param lender Lender address
   * @return Loans array
   */
  async getLoansOfLender(lender: string): Promise<Loan[]> {
    const basalt: Loan[] = await this.apiService.getLoansOfLender(lender, Network.Basalt);
    const diaspore: Loan[] = await this.apiService.getLoansOfLender(lender, Network.Diaspore);

    return diaspore.concat(LoanCurator.curateLoans(basalt));
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
   * Encode installments data
   * @param cuota Installment amount
   * @param interestRate Interest rate
   * @param installments Number of installments
   * @param duration Installment duration in seconds
   * @param timeUnit Time unit (seconds)
   * @return Encoded installments data
   */
  async encodeInstallmentsData(
    cuota: number,
    interestRate: number,
    installments: number,
    duration: number,
    timeUnit: number
  ) {
    return new Promise((resolve, reject) => {
      this._installmentsModel.encodeData(
        cuota,
        interestRate,
        installments,
        duration,
        timeUnit,
        (err, result) => {
          if (err != null) {
            reject(err);
          } else {
            resolve(result);
          }
        }
      );
    });
  }

  /**
   * Check encoded installments data
   * @param encodedData Array of bytes
   * @return True if can validate the data
   */
  async validateEncodedData(encodedData: string) {
    return new Promise((resolve, reject) => {
      this._installmentsModel.validate(
        encodedData,
        (err, result) => {
          if (err != null) {
            reject(err);
          } else {
            resolve(result);
          }
        }
      );
    });
  }

  /**
   * Calculate loan ID
   * @param amount Total amount
   * @param borrower Borrower address
   * @param creator Creator address
   * @param model Model address
   * @param oracle Oracle address
   * @param callback Callback address
   * @param salt Salt hash
   * @param expiration Expiration timestamp
   * @param data Model data
   * @return Loan ID
   */
  async calculateLoanId(
    amount: number,
    borrower: string,
    creator: string,
    model: string,
    oracle: string,
    callback: string,
    salt: string,
    expiration: number,
    data: any
  ) {
    return new Promise((resolve, reject) => {
      this._loanManager.calcId(
        amount,
        borrower,
        creator,
        model,
        oracle,
        callback,
        salt,
        expiration,
        data,
        (err, result) => {
          if (err != null) {
            reject(err);
          } else {
            resolve(result);
          }
        }
      );
    });
  }

  /**
   * Request a loan
   * @param amount Total amount
   * @param model Model address
   * @param oracle Oracle address
   * @param borrower Borrower address
   * @param callback Callback address
   * @param salt Salt hash
   * @param expiration Expiration timestamp
   * @param loanData Loan model data
   * @return Loan ID
   */
  async requestLoan(
    amount: number,
    model: string,
    oracle: string,
    borrower: string,
    callback: string,
    salt: string,
    expiration: number,
    loanData: any
  ) {
    const web3 = this.web3.opsWeb3;
    return await promisify(this.loadAltContract(web3, this._loanManager).requestLoan, [
      amount,
      model,
      oracle,
      borrower,
      callback,
      salt,
      expiration,
      loanData,
      { from: borrower }
    ]);
  }

  /**
   * Check if the loan was created
   * @param loanId Loan ID
   * @return Boolean if the loan exist
   */
  async loanWasCreated(loanId: string): Promise<boolean> {
    try {
      const loan = await this._loanManager.getLoanData(loanId);

      if (Utils.isEmpty(loan)) {
        throw Error('Loan does not exist');
      }

      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Create loan collateral
   * @param loanId Loan ID
   * @param oracle Oracle address
   * @param collateralToken Token address
   * @param entryAmount Collateral amount
   * @param liquidationRatio Liquidation ratio
   * @param balanceRatio Balance ratio
   * @param burnFee Burn fee
   * @param rewardFee Reward fee
   * @param account Account address
   * @return Loan ID
   */
  async createCollateral(
    loanId: string,
    oracle: string,
    collateralToken: string,
    entryAmount: number,
    liquidationRatio: number,
    balanceRatio: number,
    burnFee: number,
    rewardFee: number,
    account: string
  ) {
    const web3 = this.web3.opsWeb3;

    if (collateralToken === environment.contracts.converter.ethAddress) {
      return await promisify(this.loadAltContract(web3, this._collateralWethManager).create, [
        loanId,
        oracle,
        liquidationRatio,
        balanceRatio,
        burnFee,
        rewardFee,
        {
          from: account,
          value: entryAmount
        }
      ]);
    }

    return await promisify(this.loadAltContract(web3, this._collateral).create, [
      loanId,
      oracle,
      entryAmount,
      liquidationRatio,
      balanceRatio,
      burnFee,
      rewardFee,
      { from: account }
    ]);
  }

  /**
   * Deposit tokens in collateral
   * @param collateralId Collateral ID
   * @param tokenAddress Collateral token address
   * @param amount Amount to add in wei
   * @param account Account address
   * @return Tx hash
   */
  async addCollateral(
    collateralId: number,
    tokenAddress: string,
    amount: number,
    account: string
  ) {
    const web3 = this.web3.opsWeb3;

    if (tokenAddress === environment.contracts.converter.ethAddress) {
      return await promisify(this.loadAltContract(web3, this._collateralWethManager).deposit, [
        collateralId,
        {
          from: account,
          value: amount
        }
      ]);
    }

    return await promisify(this.loadAltContract(web3, this._collateral).deposit, [
      collateralId,
      amount,
      { from: account }
    ]);
  }

  /**
   * Withdraw collateral
   * @param collateralId Collateral ID
   * @param to Account address
   * @param amount Amount to add in wei
   * @param oracleData Oracle data bytes
   * @param account Account address
   * @return Tx hash
   */
  async withdrawCollateral(
    collateralId: number,
    tokenAddress: string,
    to: string,
    amount: number,
    oracleData: string,
    account: string
  ) {
    const web3 = this.web3.opsWeb3;
    let contract: any = this._collateral;

    if (tokenAddress === environment.contracts.converter.ethAddress) {
      contract = this._collateralWethManager;
    }

    return await promisify(this.loadAltContract(web3, contract).withdraw, [
      collateralId,
      to,
      amount,
      oracleData,
      { from: account }
    ]);
  }

  /**
   * Get loan debt amount value
   * @param loanId Loan ID
   * @return Debt amount
   */
  async getClosingObligation(loanId: string) {
    return new Promise((resolve, reject) => {
      this._loanManager.getClosingObligation(
        loanId,
        (err, result) => {
          if (err != null) {
            reject(err);
          } else {
            resolve(result);
          }
        }
      );
    });
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

  private loadAltContract(web3: any, contract: any): any {
    return web3.eth.contract(contract.abi).at(contract.address);
  }

  /**
   * Get expected oracle ABI
   * @param network Loan Network
   * @return Oracle ABI
   */
  private loanOracleAbi(network: Network) {
    switch (network) {
      case Network.Basalt:
        return basaltOracleAbi.abi;

      case Network.Diaspore:
      default:
        return diasporeOracleAbi.abi;
    }
  }
}
