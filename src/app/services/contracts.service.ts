import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as BN from 'bn.js';

import { Loan, LoanType, Oracle, Network } from '../models/loan.model';
import { LoanCurator } from './../utils/loan-curator';
import { LoanUtils } from './../utils/loan-utils';
import { environment } from '../../environments/environment';
// App services
import { Web3Service } from './web3.service';
import { TxService } from '../services/tx.service';
import { CosignerService } from './cosigner.service';
import { LoanTypeService } from './loan-type.service';
import { ApiService } from './api.service';
import { Utils } from './../utils/utils';
import { EventsService } from './events.service';
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
    private web3Service: Web3Service,
    private txService: TxService,
    private cosignerService: CosignerService,
    private apiService: ApiService,
    private loanTypeService: LoanTypeService,
    private eventsService: EventsService
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
    return new this.web3Service.web3.eth.Contract(abi, address);
  }

  /**
   * Get user ETH balance
   * @return Balance in wei
   */
  async getUserBalanceETHWei(): Promise<BN> {
    return await this.getUserBalanceInToken(environment.contracts.converter.ethAddress);
  }

  /**
   * Get user RCN balance
   * @return Balance in wei
   */
  async getUserBalanceRCNWei(): Promise<BN> {
    return await this.getUserBalanceInToken(environment.contracts.rcnToken);
  }

  /**
   * Get user RCN balance
   * @return Balance
   */
  async getUserBalanceRCN(): Promise<number> {
    const balance = await this.getUserBalanceInToken(environment.contracts.rcnToken);
    return this.web3Service.web3.utils.fromWei(balance);
  }

  /**
   * Get user balance in selected token
   * @param tokenAddress Token address
   * @return Balance amount
   */
  async getUserBalanceInToken(
    tokenAddress: string = environment.contracts.rcnToken
  ): Promise<BN> {
    const account = await this.web3Service.getAccount();

    return new Promise(async (resolve, reject) => {
      const tokenContract = this.makeContract(tokenAbi.abi, tokenAddress);

      if (!this.tokenIsValid(tokenAddress)) {
        reject('The currency does not exist');
      }
      if (!account) {
        resolve(Utils.bn(0));
      }
      if (tokenAddress === environment.contracts.converter.ethAddress) {
        const ethBalance = await this.web3Service.web3.eth.getBalance(account);
        resolve(Utils.bn(ethBalance));
      }
      try {
        const balance = await tokenContract.methods.balanceOf(account).call();
        resolve(Utils.bn(balance));
      } catch (err) {
        reject(err);
      }
    }) as Promise<BN>;
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

        const result = await tokenContract.methods.allowance(
          await this.web3Service.getAccount(),
          contract
        ).call();

        const MIN_APPROVED_TOKENS = Utils.bn(1000000000);
        return result >= this.web3Service.web3.utils.toWei(MIN_APPROVED_TOKENS);
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
    const account = await this.web3Service.getAccount();
    const web3 = this.web3Service.opsWeb3;

    if (!this.tokenIsValid(tokenAddress)) {
      throw Error('The currency does not exist');
    }

    const tokenContract = this.makeContract(tokenAbi.abi, tokenAddress);

    return new Promise((resolve, reject) => {
      this.loadAltContract(web3, tokenContract).methods.approve(
        contract,
        web3.utils.toTwosComplement('-1')
      )
      .send({ from: account })
      .on('transactionHash', (hash: string) => {
        this.txService.registerApproveTx(hash, tokenAddress, contract, true);
        resolve(hash);
      })
      .on('error', (err) => reject(err));
    });
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
    const account = await this.web3Service.getAccount();
    const web3 = this.web3Service.opsWeb3;

    if (!this.tokenIsValid(tokenAddress)) {
      throw Error('The currency does not exist');
    }

    const tokenContract = this.makeContract(tokenAbi.abi, tokenAddress);

    return new Promise((resolve, reject) => {
      return this.loadAltContract(web3, tokenContract).methods.approve(
        contract,
        0
      )
      .send({ from: account })
      .on('transactionHash', (hash: string) => {
        this.txService.registerApproveTx(hash, tokenAddress, contract, false);
        resolve(hash);
      })
      .on('error', (err) => reject(err));
    });
  }

  /**
   * Check if the contract is approved for operate with ERC721
   * @param contractAddress ERC721 address
   * @param operatorAddress address to be disapproved
   * @return Boolean
   */
  async isApprovedERC721(contractAddress: string, operatorAddress: string) {
    const pending = this.txService.getLastPendingApprove(contractAddress, operatorAddress);

    if (pending !== undefined) {
      return true;
    }

    const account = await this.web3Service.getAccount();
    const erc721abi: any = collateralAbi.abi;
    const erc721 = this.makeContract(erc721abi, contractAddress);

    return await erc721.methods.isApprovedForAll(
      operatorAddress,
      account
    ).call();
  }

  /**
   * Approve contract for operate with erc721
   * @param contractAddress ERC721 address
   * @param operatorAddress address to be approved
   * @return Tx hash
   */
  async approveERC721(contractAddress: string, operatorAddress: string): Promise<string> {
    const web3 = this.web3Service.opsWeb3;
    const account = await this.web3Service.getAccount();
    const erc721abi: any = collateralAbi.abi;
    const erc721: any = this.makeContract(erc721abi, contractAddress);

    return new Promise((resolve, reject) => {
      this.loadAltContract(web3, erc721).methods.setApprovalForAll(
        operatorAddress,
        true
      )
      .send({ from: account })
      .on('transactionHash', (hash: string) => {
        this.txService.registerApproveTx(hash, contractAddress, operatorAddress, true);
        resolve(hash);
      })
      .on('error', (err) => reject(err));
    });
  }

  /**
   * Disapprove contract for operate with erc721
   * @param contractAddress ERC721 address
   * @param operatorAddress address to be disapproved
   * @return Tx hash
   */
  async disapproveERC721(contractAddress: string, operatorAddress: string): Promise<string> {
    const web3 = this.web3Service.opsWeb3;
    const account = await this.web3Service.getAccount();
    const erc721abi: any = collateralAbi.abi;
    const erc721: any = this.makeContract(erc721abi, contractAddress);

    return new Promise((resolve, reject) => {
      this.loadAltContract(web3, erc721).methods.setApprovalForAll(
        operatorAddress,
        false
      )
      .send({ from: account })
      .on('transactionHash', (hash: string) => {
        this.txService.registerApproveTx(hash, contractAddress, operatorAddress, false);
        resolve(hash);
      })
      .on('error', (err) => reject(err));
    });
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
  ): Promise<BN> {
    const loanAmount: BN = Utils.bn(loan.amount);
    const decimals: number = loan.currency.decimals;
    const rcnRate = await this.getRate(loan.oracle.address, decimals);
    const rcnAmountInWei: BN = Utils.bn(loanAmount.mul(rcnRate));
    const rcnAmount: BN = rcnAmountInWei.div(Utils.bn(10).pow(Utils.bn(decimals)));
    const rcnToken: string = environment.contracts.rcnToken;

    // amount in rcn
    if (rcnToken === tokenAddress) {
      return rcnAmount;
    }

    // amount in currency
    const requiredInToken: string | BN = await this.getPriceConvertTo(
      tokenAddress,
      rcnToken,
      rcnAmount.toString()
    );
    const additionalSpend =
      Utils.bn(requiredInToken).mul(Utils.bn(1003)).div(Utils.bn(1000));

    return additionalSpend;
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
   * @return Tx hash
   */
  async converterRampLend(
    payableAmount: string,
    converter: string,
    fromToken: string,
    maxSpend: string,
    cosigner: string,
    loanId: string,
    oracleData: string,
    cosignerData: string,
    callbackData: string,
    account: string
  ): Promise<string> {
    const web3 = this.web3Service.opsWeb3;

    return new Promise((resolve, reject) => {
      this.loadAltContract(web3, this._rcnConverterRamp).methods.lend(
        converter,
        fromToken,
        maxSpend,
        cosigner,
        loanId,
        oracleData,
        cosignerData,
        callbackData
      )
      .send({ from: account, value: payableAmount })
      .on('transactionHash', (hash: string) => resolve(hash))
      .on('error', (err) => reject(err));
    });
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
   * @return Tx hash
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
  ): Promise<string> {
    const web3 = this.web3Service.opsWeb3;

    return new Promise((resolve, reject) => {
      this.loadAltContract(web3, this._rcnConverterRamp).methods.pay(
        payableAmount,
        converter,
        fromToken,
        loanManager,
        debtEngine,
        account,
        loanId,
        oracleData
      )
      .send({ from: account })
      .on('transactionHash', (hash: string) => resolve(hash))
      .on('error', (err) => reject(err));
    });
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
    fromAmount: string | BN
  ): Promise<string> {
    return await this._tokenConverter.methods.getPriceConvertFrom(
      fromToken,
      toToken,
      fromAmount
    ).call();
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
    toAmount: string | BN
  ): Promise<string> {
    return await this._tokenConverter.methods.getPriceConvertTo(
      fromToken,
      toToken,
      toAmount
    ).call();
  }

  async lendLoan(loan: Loan, providedCosigner: string = '0x0'): Promise<string> {
    const pOracleData = await this.getOracleData(loan.oracle);
    console.info('oracle Data', pOracleData);
    const cosigner = this.cosignerService.getCosigner(loan);
    let cosignerAddr = providedCosigner;
    let cosignerData = '0x0';

    if (cosigner !== undefined) {
      const cosignerOffer = await cosigner.offer(loan);
      cosignerAddr = cosignerOffer.contract;
      cosignerData = cosignerOffer.lendData;
    }

    const callbackData = '0x0';
    const oracleData = pOracleData;
    const web3 = this.web3Service.opsWeb3;
    const account = await this.web3Service.getAccount();

    return new Promise((resolve, reject) => {
      switch (loan.network) {
        case Network.Basalt:
          this.loadAltContract(web3, this._rcnEngine).methods.lend(
            loan.id,
            oracleData,
            cosignerAddr,
            cosignerData
          )
          .send({ from: account })
          .on('transactionHash', (hash: string) => resolve(hash))
          .on('error', (err) => reject(err));
          break;

        case Network.Diaspore:
          this.loadAltContract(web3, this._loanManager).methods.lend(
            loan.id,
            oracleData,
            cosignerAddr,
            0,
            cosignerData,
            callbackData
          )
          .send({ from: account })
          .on('transactionHash', (hash: string) => resolve(hash))
          .on('error', (err) => reject(err));
          break;

        default:
          throw Error('Unknown network');
      }
    });
  }

  /**
   * Get oracle rate
   * @param oracleAddress Oracle address
   * @param decimals Currency decimals
   * @return Token equivalent in wei
   */
  async getRate(oracleAddress: string, decimals = 18): Promise<any> {
    const web3: any = this.web3Service.web3;
    if (oracleAddress === Utils.address0x) {
      return web3.utils.toWei(Utils.bn(1));
    }

    const oracle = this.makeContract(diasporeOracleAbi.abi, oracleAddress);
    const oracleRate = await oracle.methods.readSample([]).call();
    const amount = Utils.bn('10').pow(Utils.bn(decimals));
    const tokens = Utils.bn(oracleRate[0]);
    const equivalent = Utils.bn(oracleRate[1]);
    const rate = tokens.mul(amount).div(equivalent);

    return rate;
  }

  async estimatePayAmount(loan: Loan, amount: number): Promise<number> {
    if (loan.oracle.address === Utils.address0x) {
      return amount;
    }

    const oracleData = await this.getOracleData(loan.oracle);
    const oracleAbi = this.loanOracleAbi(loan.network);
    const oracle = this.makeContract(oracleAbi, loan.oracle.address);

    try {
      // TODO: Implement BN
      switch (loan.network) {
        case Network.Basalt:
          const oracleRate = await oracle.methods.getRate(loan.oracle.code, oracleData).call();
          const rate = oracleRate[0];
          const decimals = oracleRate[1];
          console.info('Oracle rate obtained', rate, decimals);
          const required = (rate * amount * 10 ** (18 - decimals) / 10 ** 18) * 1.02;
          console.info('Estimated required rcn is', required);
          return required;

        case Network.Diaspore:
          const oracleResult = await oracle.methods.readSample(oracleData).call();
          const tokens = oracleResult[0];
          const equivalent = oracleResult[1];
          return (tokens * amount) / equivalent;

        default:
          break;
      }
    } catch (err) {
      this.eventsService.trackError(err);
      throw Error('Oracle did not provide data');
    }
  }

  async payLoan(loan: Loan, amount: number): Promise<string> {
    const account = await this.web3Service.getAccount();
    const pOracleData = this.getOracleData(loan.oracle);
    const oracleData = await pOracleData;
    const web3 = this.web3Service.opsWeb3;

    return new Promise((resolve, reject) => {
      switch (loan.network) {
        case Network.Basalt:
          this.loadAltContract(web3, this._rcnEngine).methods.pay(
            loan.id,
            amount,
            account,
            oracleData
          )
          .send({ from: account })
          .on('transactionHash', (hash: string) => resolve(hash))
          .on('error', (err) => reject(err));
          break;

        case Network.Diaspore:
          this.loadAltContract(web3, this._debtEngine).methods.pay(
            loan.id,
            amount,
            account,
            oracleData
          )
          .send({ from: account })
          .on('transactionHash', (hash: string) => resolve(hash))
          .on('error', (err) => reject(err));
          break;

        default:
          throw Error('Unknown network');
      }
    });
  }

  async transferLoan(loan: Loan, to: string): Promise<string> {
    const account = await this.web3Service.getAccount();
    const web3 = this.web3Service.opsWeb3;

    return new Promise((resolve, reject) => {
      switch (loan.network) {
        case Network.Basalt:
          this.loadAltContract(web3, this._rcnEngine).methods.transfer(
            to,
            loan.id
          )
          .send({ from: account })
          .on('transactionHash', (hash: string) => resolve(hash))
          .on('error', (err) => reject(err));
          break;

        case Network.Diaspore:
          this.loadAltContract(web3, this._debtEngine).methods.safeTransferFrom(
            account,
            to,
            loan.id
          )
          .send({ from: account })
          .on('transactionHash', (hash: string) => resolve(hash))
          .on('error', (err) => reject(err));
          break;

        default:
          throw Error('Unknown network');
      }
    });
  }

  async withdrawFundsBasalt(basaltIdLoans: number[]): Promise<string> {
    const account = await this.web3Service.getAccount();
    const web3 = this.web3Service.opsWeb3;

    return new Promise((resolve, reject) => {
      this.loadAltContract(web3, this._rcnEngine).methods.withdrawalList(
        basaltIdLoans,
        account
      )
      .send({ from: account })
      .on('transactionHash', (hash: string) => resolve(hash))
      .on('error', (err) => reject(err));
    });
  }

  async withdrawFundsDiaspore(diasporeIdLoans: number[]): Promise<string> {
    const account = await this.web3Service.getAccount();
    const web3 = this.web3Service.opsWeb3;

    console.info('loans to withdraw diaspore', diasporeIdLoans);
    return new Promise((resolve, reject) => {
      this.loadAltContract(web3, this._debtEngine).methods.withdrawBatch(
        diasporeIdLoans,
        account
      )
      .send({ from: account })
      .on('transactionHash', (hash: string) => resolve(hash))
      .on('error', (err) => reject(err));
    });
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

    const oracleContract = this.makeContract(diasporeOracleAbi.abi, oracle.address);
    const oracleUrl = await oracleContract.methods.url().call();
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
    } catch (err) {
      this.eventsService.trackError(err);
      throw Error('Oracle did not provide data');
    }
  }

  async getOracleUrl(oracle?: Oracle): Promise<string> {
    const oracleContract = new this.web3Service.web3.eth.Contract(diasporeOracleAbi.abi, oracle.address);
    const url = await oracleContract.methods.url().call();
    return url;
  }

  /**
   * Get ERC20 decimals
   * @param tokenAddress Token address
   * @param loan Loan
   * @return Decimals
   */
  async getTokenDecimals(tokenAddress: string, loan?: Loan): Promise<number> {
    const { ethAddress } = environment.contracts.converter;
    if (tokenAddress === ethAddress) {
      return 18;
    }
    if (loan && loan.currency.decimals) {
      return loan.currency.decimals;
    }

    const tokenContract = this.makeContract(tokenAbi.abi, tokenAddress);
    const decimals = await tokenContract.methods.decimals().call();
    return Number(decimals);
  }

  /**
   * Get oracle address from currency symbol
   * @param symbol Currency symbol
   * @return Oracle address
   */
  async symbolToOracle(symbol: string) {
    return await this._oracleFactory.methods.symbolToOracle(symbol).call();
  }

  /**
   * Get currency symbol from oracle address
   * @param oracle Oracle address
   * @return Currency symbol
   */
  async oracleToSymbol(oracle: string) {
    return await this._oracleFactory.methods.oracleToSymbol(oracle).call();
  }

  /**
   * Loads loan by ID
   * @param id Loan ID
   * @return Loan
   */
  // TODO: remove method from this service
  async getLoan(id: string): Promise<Loan> {
    if (id.startsWith('0x')) {
      const loan: Loan = await this.apiService.getLoan(id, Network.Diaspore);
      const collaterals = await this.apiService.getCollateralByLoan(id);
      loan.collateral = collaterals[0];

      return loan;
    }

    return await this.apiService.getLoan(id, Network.Basalt);
  }

  /**
   * Gets all loans that were lent and there status is ongoing. Meaning that
   * they are not canceled or finished.
   * @return Loans array
   */
  // TODO: remove method from this service
  async getActiveLoans(): Promise<Loan[]> {
    const diaspore: Loan[] = await this.apiService.getActiveLoans(Network.Diaspore);
    const basalt: Loan[] = await this.apiService.getActiveLoans(Network.Basalt);
    const collaterals = await this.apiService.getCollateral();
    const diasporeWithCollateral = LoanUtils.completeLoansCollateral(diaspore, collaterals);

    return LoanCurator.curateLoans(diasporeWithCollateral).concat(LoanCurator.curateLoans(basalt));
  }

  /**
   * Get all loans request that are open, not canceled or expired.
   * @return Loans array
   */
  // TODO: remove method from this service
  async getRequests(): Promise<Loan[]> {
    const web3 = await this.web3Service.web3;
    const block = await web3.eth.getBlock('latest');
    const now = block.timestamp;
    const diaspore: Loan[] = await this.apiService.getRequests(now, Network.Diaspore);
    const ALLOWED_TYPES = [LoanType.UnknownWithCollateral, LoanType.FintechOriginator, LoanType.NftCollateral];
    const loans: Loan[] = this.loanTypeService.filterLoanByType(diaspore, ALLOWED_TYPES);

    return LoanCurator.curateLoans(loans);
  }

  /**
   * Loads all loans lent by the specified account
   * @param lender Lender address
   * @return Loans array
   */
  // TODO: remove method from this service
  async getLoansOfLender(lender: string): Promise<Loan[]> {
    const basalt: Loan[] = await this.apiService.getLoansOfLenderOrBorrower(lender, 'lender', Network.Basalt);
    const diaspore: Loan[] = await this.apiService.getLoansOfLenderOrBorrower(lender, 'lender', Network.Diaspore);

    return diaspore.concat(LoanCurator.curateLoans(basalt));
  }

  /**
   * Loads all loans borrowed by the specified account
   * @param borrower Borrower address
   * @return Loans array
   */
  async getLoansOfBorrower(borrower: string): Promise<Loan[]> {
    const basalt: Loan[] = await this.apiService.getLoansOfLenderOrBorrower(borrower, 'borrower', Network.Basalt);
    const diaspore: Loan[] = await this.apiService.getLoansOfLenderOrBorrower(borrower, 'borrower', Network.Diaspore);

    return diaspore.concat(LoanCurator.curateLoans(basalt));
  }

  readPendingWithdraws(loans: Loan[]): [number, number[], number, number[]] {
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
    const account = await this.web3Service.getAccount();

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
    cuota: string,
    interestRate: string,
    installments: string,
    duration: string,
    timeUnit: string
  ) {
    return await this._installmentsModel.methods.encodeData(
      cuota,
      interestRate,
      installments,
      duration,
      timeUnit
    ).call();
  }

  /**
   * Check encoded installments data
   * @param encodedData Array of bytes
   * @return True if can validate the data
   */
  async validateEncodedData(encodedData: string) {
    return await this._installmentsModel.methods.validate(encodedData).call();
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
    amount: BN | string,
    borrower: string,
    creator: string,
    model: string,
    oracle: string,
    callback: string,
    salt: string,
    expiration: number,
    data: any
  ) {
    return await this._loanManager.methods.calcId(
      amount,
      borrower,
      creator,
      model,
      oracle,
      callback,
      salt,
      expiration,
      data
    ).call();
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
    amount: BN | string,
    model: string,
    oracle: string,
    borrower: string,
    callback: string,
    salt: string,
    expiration: number,
    loanData: any
  ): Promise<string> {
    const web3 = this.web3Service.opsWeb3;
    return new Promise((resolve, reject) => {
      this.loadAltContract(web3, this._loanManager).methods.requestLoan(
        amount,
        model,
        oracle,
        borrower,
        callback,
        salt,
        expiration,
        loanData
      )
      .send({ from: borrower })
      .on('transactionHash', (hash: string) => resolve(hash))
      .on('error', (err) => reject(err));
    });
  }

  /**
   * Check if the loan was created
   * @param loanId Loan ID
   * @return Boolean if the loan exist
   */
  async loanWasCreated(loanId: string): Promise<boolean> {
    try {
      const loan = await this._loanManager.methods.getLoanData(loanId).call();

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
    debtId: string,
    oracle: string,
    amount: BN | string,
    liquidationRatio: BN | string,
    balanceRatio: BN | string,
    account: string
  ): Promise<string> {
    const web3 = this.web3Service.opsWeb3;
    return new Promise((resolve, reject) => {
      // FIXME: see collateral with ETH implementation
      this.loadAltContract(web3, this._collateral).methods.create(
        account,
        debtId,
        oracle,
        amount,
        liquidationRatio,
        balanceRatio
      )
      .send({ from: account })
      .on('transactionHash', (hash: string) => resolve(hash))
      .on('error', (err) => reject(err));
    });
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
    amount: string,
    account: string
  ): Promise<string> {
    const web3 = this.web3Service.opsWeb3;

    return new Promise((resolve, reject) => {
      if (tokenAddress === environment.contracts.converter.ethAddress) {
        this.loadAltContract(web3, this._collateralWethManager).methods.deposit(
          collateralId
        )
        .send({ from: account, value: amount })
        .on('transactionHash', (hash: string) => resolve(hash))
        .on('error', (err) => reject(err));
      }

      this.loadAltContract(web3, this._collateral).methods.deposit(
        collateralId,
        amount
      )
      .send({ from: account })
      .on('transactionHash', (hash: string) => resolve(hash))
      .on('error', (err) => reject(err));
    });
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
    amount: string,
    oracleData: string,
    account: string
  ): Promise<string> {
    const web3 = this.web3Service.opsWeb3;
    let contract: any = this._collateral;

    if (tokenAddress === environment.contracts.converter.ethAddress) {
      contract = this._collateralWethManager;
    }

    return new Promise((resolve, reject) => {
      this.loadAltContract(web3, contract).methods.withdraw(
        collateralId,
        to,
        amount,
        oracleData
      )
      .send({ from: account })
      .on('transactionHash', (hash: string) => resolve(hash))
      .on('error', (err) => reject(err));
    });
  }

  /**
   * Get loan debt amount value
   * @param loanId Loan ID
   * @return Debt amount
   */
  async getClosingObligation(loanId: string): Promise<string> {
    return await this._loanManager.methods.getClosingObligation(loanId).call();
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
    return new web3.eth.Contract(contract._jsonInterface, contract._address);
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
