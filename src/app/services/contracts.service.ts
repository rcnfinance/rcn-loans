import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as BN from 'bn.js';
import { Loan, LoanType, Engine, Oracle } from 'app/models/loan.model';
import { AvailableChains } from 'app/interfaces/chain';
import { LoanContentApi } from 'app/interfaces/loan-api-diaspore';
import { LoanUtils } from 'app/utils/loan-utils';
import { Web3Service } from 'app/services/web3.service';
import { TxService } from 'app/services/tx.service';
import { LoanTypeService } from 'app/services/loan-type.service';
import { ApiService } from 'app/services/api.service';
import { ChainService } from 'app/services/chain.service';
import { EventsService } from 'app/services/events.service';
import { Utils } from 'app/utils/utils';
declare let require: any;

const tokenAbi = require('../contracts/Token.json');
const loanManagerAbi = require('../contracts/LoanManager.json');
const debtEngineAbi = require('../contracts/DebtEngine.json');
const diasporeOracleAbi = require('../contracts/Oracle.json');
const converterRampAbi = require('../contracts/ConverterRamp.json');
const uniswapV2ConverterAbi = require('../contracts/UniswapV2Converter.json');
const oracleFactoryAbi = require('../contracts/OracleFactory.json');
const installmentsModelAbi = require('../contracts/InstallmentsModel.json');
const collateralAbi = require('../contracts/Collateral.json');
const collateralWethManagerAbi = require('../contracts/CollateralWETHManager.json');
const aggregatorProxyAbi = require('../contracts/chainlink/EACAggregatorProxy.json');
const chainlinkAdapterV3Abi = require('../contracts/chainlink/ChainlinkAdapterV3.json');

@Injectable()
export class ContractsService {
  // multi-engine contracts
  private _loanManager: {[engine: string]: any} = {};
  private _debtEngine: {[engine: string]: any} = {};
  private _rcnConverterRamp: {[engine: string]: any} = {};
  private _uniswapConverter: {[engine: string]: any} = {};
  private _oracleFactory: {[engine: string]: any} = {};
  private _installmentsModel: {[engine: string]: any} = {};
  private _collateral: {[engine: string]: any} = {};
  private _collateralWethManager: {[engine: string]: any} = {};

  // single-engine contracts
  private _aggregatorProxyChainCurrencyToUsd: any;
  private _chainlinkAdapterV3Abi: any;

  constructor(
    private http: HttpClient,
    private web3Service: Web3Service,
    private txService: TxService,
    private apiService: ApiService,
    private loanTypeService: LoanTypeService,
    private chainService: ChainService,
    private eventsService: EventsService
  ) {
    this.buildContracts();
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
   * Get user RCN balance
   * @return Balance in wei
   */
  async getUserBalanceRCNWei(): Promise<BN> {
    const { config } = this.chainService;
    return await this.getUserBalanceInToken(config.contracts[Engine.RcnEngine].token);
  }

  /**
   * Get user RCN balance
   * @return Balance
   */
  async getUserBalanceRCN(): Promise<number> {
    const { config } = this.chainService;
    const balance = await this.getUserBalanceInToken(config.contracts[Engine.RcnEngine].token);
    return this.web3Service.web3.utils.fromWei(balance);
  }

  /**
   * Get user balance in selected token
   * @param tokenAddress Token address
   * @return Balance amount
   */
  async getUserBalanceInToken(tokenAddress: string): Promise<BN> {
    const account = await this.web3Service.getAccount();

    return new Promise(async (resolve, reject) => {
      const tokenContract = this.makeContract(tokenAbi.abi, tokenAddress);
      const { config } = this.chainService;

      if (!this.tokenIsValid(tokenAddress)) {
        reject('The currency does not exist');
      }
      if (!account) {
        resolve(Utils.bn(0));
      }
      if (tokenAddress === config.contracts.chainCurrencyAddress) {
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
  async isApproved(contract: string, tokenAddress: string): Promise<boolean> {
    const pending = this.txService.getLastPendingApprove(tokenAddress, contract);
    const { config } = this.chainService;
    const chainCurrencyAddress = config.contracts.chainCurrencyAddress;

    if (pending !== undefined) {
      return true;
    }

    switch (tokenAddress) {
      // eth does not require approve
      case chainCurrencyAddress:
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
  async approve(contract: string, tokenAddress: string): Promise<string> {
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
  async disapprove(contract: string, tokenAddress: string): Promise<string> {
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
  async estimateLendAmount(loan: Loan, tokenAddress: string): Promise<BN> {
    const loanAmount: BN = Utils.bn(loan.amount);
    const decimals: number = loan.currency.decimals;
    const tokenRate = await this.getRate(loan.oracle.address, decimals);
    const tokenAmountInWei: BN = Utils.bn(loanAmount.mul(tokenRate));
    const tokenAmount: BN = tokenAmountInWei.div(Utils.bn(10).pow(Utils.bn(decimals)));
    const { engine } = loan;
    const { config } = this.chainService;
    const engineToken: string = config.contracts[engine].token;

    // amount in rcn
    if (engineToken === tokenAddress) {
      return tokenAmount;
    }

    // amount in currency
    const requiredInToken: string | BN = await this.getPriceConvertTo(
      engine,
      tokenAddress,
      engineToken,
      tokenAmount.toString()
    );
    const additionalSpend =
      Utils.bn(requiredInToken).mul(Utils.bn(1003)).div(Utils.bn(1000));

    return additionalSpend;
  }

  /**
   * Lend loan using ConverterRamp
   * @param engine Engine
   * @param payableAmount Ether amount
   * @param converter Converter address
   * @param fromToken From token address
   * @param maxSpend Max fromToken to spend during lend
   * @param cosigner Cosigner address
   * @param cosignerLimt Cosigner limit
   * @param loanId Loan ID
   * @param oracleData Oracle data
   * @param cosignerData Cosigner data
   * @param account Account address
   * @param estimate Estimate or send transaction
   * @return Tx hash
   */
  async converterRampLend(
    engine: Engine,
    payableAmount: string,
    converter: string,
    fromToken: string,
    maxSpend: string,
    cosigner: string,
    cosignerLimit: string,
    loanId: string,
    oracleData: string,
    cosignerData: string,
    callbackData: string,
    account: string,
    estimate?: boolean
  ): Promise<string> {
    const web3 = this.web3Service.opsWeb3;

    const payload = payableAmount ?
      { from: account, value: payableAmount } :
      { from: account };

    if (estimate) {
      return await this.loadAltContract(web3, this._rcnConverterRamp[engine])
          .methods
          .lend(converter, fromToken, maxSpend, cosigner, cosignerLimit, loanId, oracleData, cosignerData, callbackData)
          .estimateGas(payload);
    }

    return new Promise((resolve, reject) => {
      this.loadAltContract(web3, this._rcnConverterRamp[engine])
          .methods
          .lend(converter, fromToken, maxSpend, cosigner, cosignerLimit, loanId, oracleData, cosignerData, callbackData)
          .send(payload)
          .on('transactionHash', (hash: string) => resolve(hash))
          .on('error', (err) => reject(err));
    });
  }

  /**
   * Get the cost, in wei, of making a convertion using the value specified
   * @param engine Engine
   * @param fromToken From token address
   * @param toToken To token address
   * @param amount Amount to convert
   * @return Spend amount
   */
  async getPriceConvertTo(
    engine: Engine,
    fromToken: string,
    toToken: string,
    toAmount: string | BN
  ): Promise<string> {
    return await this._uniswapConverter[engine].methods.getPriceConvertTo(
      fromToken,
      toToken,
      toAmount
    ).call();
  }

  /**
   * Lend loan using ConverterRamp
   * @param engine Engine
   * @param payableAmount Ether amount
   * @param converter Converter address
   * @param fromToken From token address
   * @param maxSpend Max fromToken to spend during lend
   * @param cosigner Cosigner address
   * @param loanId Loan ID
   * @param oracleData Oracle data
   * @param cosignerData Cosigner data
   * @param account Account address
   * @param estimate Estimate or send transaction
   * @return Tx hash
   */
  async lendLoan(
    engine: Engine,
    cosigner: string,
    loanId: string,
    oracleData: string,
    cosignerData: string,
    callbackData: string,
    account: string,
    estimate?: boolean
  ): Promise<string> {
    const web3 = this.web3Service.opsWeb3;
    const COSIGNER_LIMIT = 0;

    const payload = { from: account };

    if (estimate) {
      return await this.loadAltContract(web3, this._loanManager[engine])
          .methods
          .lend(loanId, oracleData, cosigner, COSIGNER_LIMIT, cosignerData, callbackData)
          .estimateGas(payload);
    }

    return new Promise((resolve, reject) => {
      this.loadAltContract(web3, this._loanManager[engine])
          .methods
          .lend(loanId, oracleData, cosigner, COSIGNER_LIMIT, cosignerData, callbackData)
          .send(payload)
          .on('transactionHash', (hash: string) => resolve(hash))
          .on('error', (err) => reject(err));
    });
  }

  /**
   * Get oracle rate
   * @param oracleAddress Oracle address
   * @param decimals Currency decimals
   * @return Token equivalent in wei
   */
  async getRate(oracleAddress: string, decimals: number): Promise<any> {
    if (oracleAddress === Utils.address0x) {
      return Utils.pow(10, decimals);
    }

    const oracle = this.makeContract(diasporeOracleAbi.abi, oracleAddress);
    const oracleRate = await oracle.methods.readSample([]).call();
    const amount = Utils.bn('10').pow(Utils.bn(decimals));
    const tokens = Utils.bn(oracleRate[0]);
    const equivalent = Utils.bn(oracleRate[1]);
    const rate = tokens.mul(amount).div(equivalent);

    return rate;
  }

  /**
   * Get pair rate using Chainlink
   * @param pair Ex: ['BTC', 'ETH']
   * @return Pair rate
   */
  async getPairRate(pair: string[]) {
    const { web3 } = this.web3Service;
    const pairBytes32 = pair.map((currency) => web3.utils.toHex(currency));
    return await this._chainlinkAdapterV3Abi.methods.getRate(pairBytes32).call();
  }

  async estimatePayAmount(loan: Loan, amount: number): Promise<number> {
    if (loan.oracle.address === Utils.address0x) {
      return amount;
    }

    const oracleData = await this.getOracleData(loan.oracle);
    const oracleAbi = this.loanOracleAbi();
    const oracle = this.makeContract(oracleAbi, loan.oracle.address);

    try {
      // TODO: Implement BN
      const oracleResult = await oracle.methods.readSample(oracleData).call();
      const tokens = oracleResult[0];
      const equivalent = oracleResult[1];
      return (tokens * amount) / equivalent;
    } catch (err) {
      this.eventsService.trackError(err);
      throw Error('Oracle did not provide data');
    }
  }

  async payLoan(
    loan: Loan,
    amount: string,
    estimate?: boolean
  ): Promise<string> {
    const account = await this.web3Service.getAccount();
    const pOracleData = this.getOracleData(loan.oracle);
    const oracleData = await pOracleData;
    const web3 = this.web3Service.opsWeb3;
    const payload = { from: account };
    const { engine } = loan;

    if (estimate) {
      return await this.loadAltContract(web3, this._debtEngine[engine])
          .methods
          .pay(loan.id, amount, account, oracleData)
          .estimateGas(payload);
    }

    return new Promise((resolve, reject) => {
      this.loadAltContract(web3, this._debtEngine[engine])
          .methods
          .pay(loan.id, amount, account, oracleData)
          .send(payload)
          .on('transactionHash', (hash: string) => resolve(hash))
          .on('error', (err) => reject(err));
    });
  }

  async transferLoan(loan: Loan, to: string): Promise<string> {
    const account = await this.web3Service.getAccount();
    const web3 = this.web3Service.opsWeb3;
    const { engine } = loan;

    return new Promise((resolve, reject) => {
      this.loadAltContract(web3, this._debtEngine[engine]).methods.safeTransferFrom(
        account,
        to,
        loan.id
      )
      .send({ from: account })
      .on('transactionHash', (hash: string) => resolve(hash))
      .on('error', (err) => reject(err));
    });
  }

  async withdrawFundsDiaspore(engine: Engine, diasporeIdLoans: number[]): Promise<string> {
    const account = await this.web3Service.getAccount();
    const web3 = this.web3Service.opsWeb3;

    console.info('loans to withdraw diaspore', diasporeIdLoans);
    return new Promise((resolve, reject) => {
      this.loadAltContract(web3, this._debtEngine[engine]).methods.withdrawBatch(
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
    const { config } = this.chainService;
    const { chainCurrencyAddress } = config.contracts;
    if (tokenAddress === chainCurrencyAddress) {
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
   * @param engine Engine
   * @param symbol Currency symbol
   * @return Oracle address
   */
  async symbolToOracle(engine: Engine, symbol: string) {
    return await this._oracleFactory[engine].methods.symbolToOracle(symbol).call();
  }

  /**
   * Get currency symbol from oracle address
   * @param engine Engine
   * @param oracle Oracle address
   * @return Currency symbol
   */
  async oracleToSymbol(engine: Engine, oracle: string) {
    return await this._oracleFactory[engine].methods.oracleToSymbol(oracle).call();
  }

  /**
   * Get pending loans to withdraw
   * @param engine Engine
   * @return Loan IDs and amount to withdraw
   */
  async getPendingWithdraws(engine: Engine): Promise<[number, number[], number, number[]]> {
    const account = await this.web3Service.getAccount();
    const { config } = this.chainService;

    return new Promise(async (resolve, _reject) => {
      const { content } = await this.apiService.getLent(engine, account).toPromise();
      const loans: Loan[] = content.map((loanData: LoanContentApi) => LoanUtils.buildLoan(loanData, config));
      resolve(this.readPendingWithdraws(loans));
    }) as Promise<[number, number[], number, number[]]>;

    // TODO: optimize for iterate pages
  }

  /**
   * Get the params expected by the contract
   * @param loan Loan
   * @param lendToken Token address
   * @return Object with params
   */
  async getLendParams(loan: Loan, lendToken: string): Promise<{
    payableAmount: string,
    tokenConverter: string,
    lendToken: string,
    required: string,
    cosignerAddress: string,
    cosignerLimit: string,
    loanId: string,
    oracleData: string,
    cosignerData: string,
    callbackData: string,
    account: string
  }> {
    const oracleData = await this.getOracleData(loan.oracle);
    const web3: any = this.web3Service.web3;
    const { config } = this.chainService;

    // set value in specified token
    const required = String(await this.estimateLendAmount(loan, lendToken));
    const payableAmount = lendToken === config.contracts.chainCurrencyAddress ? required : '';

    // set cosigner
    const cosignerLimit = '0'; // TODO: implement cosigner limit
    let cosignerAddress: string;
    let cosignerData: string;

    if (this.loanTypeService.getLoanType(loan) === LoanType.UnknownWithCollateral) {
      const { collateral } = loan;
      cosignerAddress = config.contracts[loan.engine].collateral.collateral;
      cosignerData = Utils.toBytes32(web3.utils.toHex(collateral.id));
    } else {
      cosignerAddress = Utils.address0x;
      cosignerData = '0x';
    }

    let account: string = await this.web3Service.getAccount();
    account = web3.utils.toChecksumAddress(account);

    const loanId = loan.id;
    const callbackData = '0x';
    const tokenConverter =
      lendToken !== config.contracts[loan.engine].token ?
      config.contracts[loan.engine].converter.uniswapConverter :
      null;

    return {
      payableAmount,
      tokenConverter,
      lendToken,
      required,
      cosignerAddress,
      cosignerLimit,
      loanId,
      oracleData,
      cosignerData,
      callbackData,
      account
    };
  }

  /**
   * Encode installments data
   * @param engine Engine
   * @param cuota Installment amount
   * @param interestRate Interest rate
   * @param installments Number of installments
   * @param duration Installment duration in seconds
   * @param timeUnit Time unit (seconds)
   * @return Encoded installments data
   */
  async encodeInstallmentsData(
    engine: Engine,
    cuota: string,
    interestRate: string,
    installments: string,
    duration: string,
    timeUnit: string
  ) {
    return await this._installmentsModel[engine].methods.encodeData(
      cuota,
      interestRate,
      installments,
      duration,
      timeUnit
    ).call();
  }

  /**
   * Check encoded installments data
   * @param engine Engine
   * @param encodedData Array of bytes
   * @return True if can validate the data
   */
  async validateEncodedData(engine: Engine, encodedData: string) {
    return await this._installmentsModel[engine].methods.validate(encodedData).call();
  }

  /**
   * Calculate loan ID
   * @param engine Engine
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
    engine: Engine,
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
    return await this._loanManager[engine].methods.calcId(
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
   * @param engine Engine
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
    engine: Engine,
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
      this.loadAltContract(web3, this._loanManager[engine]).methods.requestLoan(
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
   * @param engine Engine
   * @param loanId Loan ID
   * @return Boolean if the loan exist
   */
  async loanWasCreated(engine: Engine, loanId: string): Promise<boolean> {
    try {
      const loan = await this._loanManager[engine].methods.getLoanData(loanId).call();

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
   * @param engine Engine
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
    engine: Engine,
    debtId: string,
    oracle: string,
    amount: BN | string,
    liquidationRatio: BN | string,
    balanceRatio: BN | string,
    account: string
  ): Promise<string> {
    const web3 = this.web3Service.opsWeb3;
    return new Promise(async (resolve, reject) => {
      const symbol = await this.oracleToSymbol(engine, oracle);
      const { currency: chainCurrency } = this.chainService.config.network;

      if (symbol === chainCurrency) {
        this.loadAltContract(web3, this._collateralWethManager[engine]).methods.create(
          debtId,
          oracle,
          liquidationRatio,
          balanceRatio
        )
        .send({ from: account, value: amount })
        .on('transactionHash', (hash: string) => resolve(hash))
        .on('error', (err) => reject(err));
      } else {
        this.loadAltContract(web3, this._collateral[engine]).methods.create(
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
      }
    });
  }

  /**
   * Deposit tokens in collateral
   * @param engine Engine
   * @param collateralId Collateral ID
   * @param tokenAddress Collateral token address
   * @param amount Amount to add in wei
   * @param account Account address
   * @param estimate Estimate or send transaction
   * @return Tx hash
   */
  async addCollateral(
    engine: Engine,
    collateralId: number,
    tokenAddress: string,
    amount: string,
    account: string,
    estimate?: boolean
  ): Promise<string> {
    const web3 = this.web3Service.opsWeb3;
    const { config } = this.chainService;
    const isEth: boolean = tokenAddress === config.contracts.chainCurrencyAddress;
    const payload = isEth ?
      { from: account, value: amount } :
      { from: account };

    if (estimate) {
      if (isEth) {
        return await this.loadAltContract(web3, this._collateralWethManager[engine])
            .methods
            .deposit(collateralId)
            .estimateGas(payload);
      }

      return await this.loadAltContract(web3, this._collateral[engine])
          .methods
          .deposit(collateralId, amount)
          .estimateGas(payload);
    }

    return new Promise((resolve, reject) => {
      if (isEth) {
        this.loadAltContract(web3, this._collateralWethManager[engine])
            .methods
            .deposit(collateralId)
            .send({ from: account, value: amount })
            .on('transactionHash', (hash: string) => resolve(hash))
            .on('error', (err) => reject(err));
      } else {
        this.loadAltContract(web3, this._collateral[engine])
            .methods
            .deposit(collateralId, amount)
            .send({ from: account })
            .on('transactionHash', (hash: string) => resolve(hash))
            .on('error', (err) => reject(err));
      }
    });
  }

  /**
   * Withdraw collateral
   * @param engine Engine
   * @param collateralId Collateral ID
   * @param to Account address
   * @param amount Amount to add in wei
   * @param oracleData Oracle data bytes
   * @param account Account address
   * @param estimate Estimate or send transaction
   * @return Tx hash
   */
  async withdrawCollateral(
    engine: Engine,
    collateralId: number,
    tokenAddress: string,
    to: string,
    amount: string,
    oracleData: string,
    account: string,
    estimate?: boolean
  ): Promise<string> {
    const web3 = this.web3Service.opsWeb3;
    const { config } = this.chainService;
    const isEth: boolean = tokenAddress === config.contracts.chainCurrencyAddress;
    const contract: string = isEth ? this._collateralWethManager[engine] : this._collateral[engine];
    const payload = { from: account };

    if (estimate) {
      return await this.loadAltContract(web3, contract)
          .methods
          .withdraw(collateralId, to, amount, oracleData)
          .estimateGas(payload);
    }

    return new Promise((resolve, reject) => {
      this.loadAltContract(web3, contract)
          .methods
          .withdraw(collateralId, to, amount, oracleData)
          .send(payload)
          .on('transactionHash', (hash: string) => resolve(hash))
          .on('error', (err) => reject(err));
    });
  }

  /**
   * Get latest ChainCurrency/USD rate
   * @return ChainCurrency/USD rate
   */
  async latestAnswer() {
    return await this._aggregatorProxyChainCurrencyToUsd.methods.latestAnswer().call();
  }

  /**
   * Build contracts using the current chain config
   */
  private buildContracts() {
    const { config } = this.chainService;
    const isEthereum = [AvailableChains.EthMainnet, AvailableChains.EthRopsten].includes(config.chain);
    const engines: Engine[] = isEthereum ? [...Object.values(Engine)] : [Engine.UsdcEngine];

    engines.map((engine) => {
      this._loanManager[engine] =
        this.makeContract(loanManagerAbi, config.contracts[engine].diaspore.loanManager);
      this._debtEngine[engine] =
        this.makeContract(debtEngineAbi, config.contracts[engine].diaspore.debtEngine);
      this._rcnConverterRamp[engine] =
        this.makeContract(converterRampAbi.abi, config.contracts[engine].converter.converterRamp);
      this._uniswapConverter[engine] =
        this.makeContract(uniswapV2ConverterAbi.abi, config.contracts[engine].converter.uniswapConverter);
      this._oracleFactory[engine] =
        this.makeContract(oracleFactoryAbi.abi, config.contracts[engine].oracleFactory);
      this._installmentsModel[engine] =
        this.makeContract(installmentsModelAbi.abi, config.contracts[engine].models.installments);
      this._collateral[engine] =
        this.makeContract(collateralAbi.abi, config.contracts[engine].collateral.collateral);
      this._collateralWethManager[engine] =
        this.makeContract(collateralWethManagerAbi.abi, config.contracts[engine].collateral.wethManager);
    });

    this._aggregatorProxyChainCurrencyToUsd =
      this.makeContract(aggregatorProxyAbi.abi, config.contracts.chainlink.EACAggregatorProxy.chainCurrencyToUsd);
    this._chainlinkAdapterV3Abi =
      this.makeContract(chainlinkAdapterV3Abi.abi, config.contracts.chainlink.chainlinkAdapterV3);
  }

  /**
   * Read total amount to withdraw
   * @param loan Loans to withdraw
   * @return Loan IDs and amount to withdraw
   */
  private readPendingWithdraws(loans: Loan[]): [number, number[], number, number[]] {
    const pendingDiasporeLoans = [];
    let totalDiaspore = 0;

    loans.forEach(loan => {
      if (loan.debt && loan.debt.balance > 0) {
        totalDiaspore += loan.debt.balance;
        pendingDiasporeLoans.push(loan.id);
      }
    });

    return [0, [0], totalDiaspore, pendingDiasporeLoans];
  }

  /**
   * Check if token is valid
   * @param tokenAddress Token address
   * @return Boolean
   */
  private tokenIsValid(tokenAddress): boolean {
    const { config } = this.chainService;
    const currencies = config.usableCurrencies;
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
   * @return Oracle ABI
   */
  private loanOracleAbi() {
    return diasporeOracleAbi.abi;
  }
}
