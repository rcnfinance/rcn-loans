import { Loan } from '../models/loan.model';
import { Injectable } from '@angular/core';
import { LoanCurator } from './../utils/loan-curator';
import { LoanUtils } from './../utils/loan-utils';
import { environment } from '../../environments/environment';
import { Web3Service } from './web3.service';
import { TxService } from '../tx.service';
import { CosignerService } from './cosigner.service';
import { Utils, promisify } from '../utils/utils';
import { HttpClient, HttpResponse } from '@angular/common/http';
import BigNumber from 'bignumber.js';
import { AssetItem } from '../models/asset.model';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

declare let require: any;

const tokenAbi = require('../contracts/Token.json');
const engineAbi = require('../contracts/NanoLoanEngine.json');
const extensionAbi = require('../contracts/NanoLoanEngineExtension.json');
const oracleAbi = require('../contracts/Oracle.json');
const pawnAbi = require('../contracts/PawnManager.json');

@Injectable()
export class ContractsService {
    private _rcnContract: any;
    private _rcnContractAddress: string = environment.contracts.rcnToken;

    private _rcnEngine: any;
    private _rcnEngineAddress: string = environment.contracts.basaltEngine;
    private _rcnExtension: any;
    private _rcnExtensionAddress: string = environment.contracts.engineExtension;

    constructor(
      private web3: Web3Service,
      private txService: TxService,
      private cosignerService: CosignerService,
      private http: HttpClient
    ) {
      this._rcnContract = this.web3.web3.eth.contract(tokenAbi.abi).at(this._rcnContractAddress);
      this._rcnEngine = this.web3.web3.eth.contract(engineAbi.abi).at(this._rcnEngineAddress);
      this._rcnExtension = this.web3.web3reader.eth.contract(extensionAbi.abi).at(this._rcnExtensionAddress);
    }

    public async getUserBalanceRCNWei(): Promise<number> {
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
    public async getUserBalanceRCN(): Promise<number> {
        return new Promise((resolve, reject) => {
          this.getUserBalanceRCNWei().then((balance) => {
            resolve(this.web3.web3reader.fromWei(balance));
          });
        }) as Promise<number>;
    }

    public async isEngineApproved(): Promise<boolean> {
        const account = await this.web3.getAccount();
        return new Promise((resolve, reject) => {
          const pending = this.txService.getLastPendingApprove(this._rcnContractAddress, this._rcnEngineAddress);
          if (pending !== undefined) {
            console.log('Pending engine approved found', pending);
            resolve(pending);
          } else {
            const _web3 = this.web3.web3reader;
            this._rcnContract.allowance.call(account, this._rcnEngineAddress, function (err, result) {
              if (err != null) {
                reject(err);
              }

              resolve(_web3.fromWei(result) >= _web3.toWei(1000000000));
            });
          }
        }) as Promise<boolean>;
    }

    public async approveEngine(): Promise<string> {
        const account = await this.web3.getAccount();
        const txService = this.txService;
        const rcnAddress = this._rcnContractAddress;
        const engineAddress = this._rcnEngineAddress;
        return new Promise((resolve, reject) => {
          const _web3 = this.web3.web3;
          this._rcnContract.approve(this._rcnEngineAddress, _web3.toWei(10 ** 32), { from: account }, function (err, result) {
            if (err != null) {
              reject(err);
            } else {
              txService.registerApproveTx(result, rcnAddress, engineAddress, true);
              resolve(result);
            }
          });
        }) as Promise<string>;
    }

    public async dissaproveEngine(): Promise<string> {
      const account = await this.web3.getAccount();
      const txService = this.txService;
      const rcnAddress = this._rcnContractAddress;
      const engineAddress = this._rcnEngineAddress;
      return new Promise((resolve, reject) => {
        const _web3 = this.web3.web3;
        this._rcnContract.approve(this._rcnEngineAddress, 0, { from: account }, function (err, result) {
          if (err != null) {
            reject(err);
          } else {
            txService.registerApproveTx(result, rcnAddress, engineAddress, false);
            resolve(result);
          }
        });
      }) as Promise<string>;
    }

    public async estimateRequiredAmount(loan: Loan): Promise<number> {
      let oracleData;
      if (loan.oracle !== undefined) {
        oracleData = await this.getOracleData(loan);
      }

      // TODO: Calculate and add cost of the cosigner

      return new Promise((resolve) => {
        if (loan.oracle !== undefined) {
          const oracle = this.web3.web3reader.eth.contract(oracleAbi.abi).at(loan.oracle);
          oracle.getRate(loan.currency, oracleData, (err, result) => {
            const rate = result[0];
            const decimals = result[1];
            console.log('Oracle rate obtained', rate, decimals);
            const required = (rate * loan.rawAmount * 10 ** (18 - decimals) / 10 ** 18) * 1.02;
            console.log('Estimated required rcn is', required);
            resolve(required);
          });
        } else {
          console.log('Loan has no oracle, the required is the raw amount', loan.rawAmount);
          resolve(loan.rawAmount);
        }
      }) as Promise<number>;
    }
    public async cancelLoan(loan: Loan): Promise<string> {
      return await promisify(c => this._rcnEngine.destroy(loan.id, c)) as string;
    }
    public async lendLoan(loan: Loan): Promise<string> {
        const account = await this.web3.getAccount();
        const oracleData = await this.getOracleData(loan);

        const cosigner = this.cosignerService.getCosigner(loan);
        let cosignerAddr = '0x0';
        let cosignerData = '0x0';
        if (cosigner !== undefined) {
          const cosignerOffer = await cosigner.offer(loan);
          cosignerAddr = cosignerOffer.contract;
          cosignerData = cosignerOffer.lendData;
        }

        return new Promise((resolve, reject) => {
          this._rcnEngine.lend(loan.id, oracleData, cosignerAddr, cosignerData, { from: account }, function(err, result) {
            if (err != null) {
              reject(err);
            }
            resolve(result);
          });
        }) as Promise<string>;
    }
    public async payLoan(loan: Loan, amount: number): Promise<string> {
      const pAccount = this.web3.getAccount();
      const pOracleData = this.getOracleData(loan);
      const account = await pAccount;
      const oracleData = await pOracleData;
      return await promisify(c => this._rcnEngine.pay(loan.id, amount, account, oracleData, c)) as string;
    }
    public async transferLoan(loan: Loan, to: string): Promise<string> {
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
    public async withdrawFunds(loans: number[]): Promise<string> {
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
    public async getOracleData(loan: Loan): Promise<string> {
      return new Promise((resolve) => {
        if (loan.oracle === Utils.address_0) {
          console.log('Loan has no oracle');
          resolve('0x');
        } else {
          const oracle = this.web3.web3reader.eth.contract(oracleAbi.abi).at(loan.oracle);
          oracle.url.call((err, url) => {
            if (url === '') {
              console.log('Oracle does not require data');
              resolve('0x');
            } else {
              console.log('Oracle requires data from url', url);
              this.http.get(url).subscribe((resp: any) => {
                console.log('Searching currency', loan.currencyRaw);
                let data;
                resp.forEach(e => {
                  if (e.currency === loan.currencyRaw) {
                    console.log('Oracle data found', e.data);
                    data = e.data;
                    resolve(data);
                    return;
                  }
                });
                if (data === undefined) {
                  console.log('Oracle did not provide data', resp);
                  resolve('0x');
                }
              });
            }
          });
        }
      }) as Promise<string>;
    }
    public async requestLoan(
      amount: number,
      duration: number,
      firstPayment: number,
      annualInterest: number,
      metadata: string
    ): Promise<string> {
      const account = await this.web3.getAccount();
      const currencyCode = '0x0000000000000000000000000000000000000000000000000000000000000000';
      return await promisify(c => this._rcnEngine.createLoan(
        Utils.address_0,
        account,
        currencyCode,
        amount,
        annualInterest,
        annualInterest / 2,
        duration,
        firstPayment,
        Math.floor(Date.now() / 1000) + (31 * 24 * 60 * 60), // 31 days
        metadata,
        c
      )) as string;
    }
    public async requestPawnLoan(
      _amount: number,
      _duration: number,
      _firstPayment: number,
      _interestRate: number,
      metadata: string,
      erc721Tokens: AssetItem[]
    ): Promise<string> {
      const pInterestRate = (_interestRate / 2).toFixed(0);
      const interestRate = _interestRate.toFixed(0);
      const amount = _amount.toFixed(0);
      const duration = _duration.toFixed(0);
      const firstPayment = _firstPayment.toFixed(0);
      const expirationRequest = Math.floor(Date.now() / 1000) + (31 * 24 * 60 * 60); // 31 days;

      // Sign the loan request
      const borrower = await this.web3.getAccount();
      metadata += ' #required-cosigner:' + environment.contracts.pawnManager;

      // Retrieve the loan signature
      const loanIdentifier = await promisify(c => this._rcnEngine.buildIdentifier(
        0x0,                  // Contract of the oracle
        borrower,             // Borrower of the loan (caller of this method)
        environment.contracts.pawnManager,  // Creator of the loan, the pawn creator
        0x0,                  // Currency of the loan, RCN
        amount,        // Request amount
        interestRate,        // Interest rate, 20% anual
        pInterestRate,        // Punnitory interest rate, 30% anual
        duration,        // Duration of the loan, 6 months
        firstPayment,        // Borrower can pay the loan at 5 months
        expirationRequest,        // Pawn request expires in 1 month
        metadata,          // Metadata
        c
      )) as string;

      const sgn = (await this.web3.sign(loanIdentifier)).slice(2);
      const r = `0x${sgn.slice(0, 64)}`;
      const s = `0x${sgn.slice(64, 128)}`;
      const v = parseInt(sgn.slice(128, 130), 16);

      console.log(loanIdentifier, r, s, v, sgn);

      const contractsErc721 = [];
      const idsErc721 = [];

      erc721Tokens.forEach(token => {
        contractsErc721.push(token.asset.contract);
        idsErc721.push(token.id);
      });

      const pawnContract = this.web3.web3.eth.contract(pawnAbi).at(environment.contracts.pawnManager);
      return await promisify(c => pawnContract.requestPawn(
        Utils.address_0, // Oracle
        '0x0000000000000000000000000000000000000000000000000000000000000000', // Currency
        [ // Loan parameters
          amount,
          interestRate,
          pInterestRate,
          duration,
          firstPayment,
          expirationRequest
        ],
        metadata,
        v,
        r,
        s,
        [],
        [],
        contractsErc721,
        idsErc721,
        c
      )) as string;
    }
    public async getLoan(id: number): Promise<Loan> {
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
    public async getActiveLoans(): Promise<Loan[]> {
      return new Promise((resolve, reject) => {
        // Filter ongoing loans
        const filters = [
          '0xc247ba1b89af5f2654184f0c5a8e8f1ea48c55e3'
        ];

        const params = ['0x0', '0x0', this.addressToBytes32(environment.contracts.decentraland.mortgageCreator)];
        this._rcnExtension.queryLoans.call(this._rcnEngineAddress, 0, 0, filters, params, (err, result) => {
          if (err != null) {
            reject(err);
          }
          resolve(this.parseLoansBytes(result));
        });
      }) as Promise<Loan[]>;
    }
    public async getOpenLoans(): Promise<Loan[]> {
        return new Promise((resolve, reject) => {
          // Filter open loans, non expired loand and valid mortgage
          const filters = [
            '0x3e703de416a62525c8653be11d71486550618ec8', // Open loans filter
            '0xe084b7cf7f6869a96cd72962047bf65e6d55e1e1', // Non-expired filter
            '0x0bc0ac0f08235979951bb155d15f1a08dd7dcb2a', // Decentraland mortgage filter
            '0x19488cea2dd0522ebe334e70ae7561bfb787de94', // Pawn loan filter
          ];

          const params = [
            '0x0',
            '0x0',
            this.addressToBytes32(environment.contracts.decentraland.mortgageCreator),
            this.addressToBytes32(environment.contracts.pawnManager),
          ];

          this._rcnExtension.queryLoans.call(this._rcnEngineAddress, 0, 0, filters, params, (err, result) => {
            if (err != null) {
              reject(err);
            }
            resolve(LoanCurator.curateLoans(this.parseLoansBytes(result)));
          });
        }) as Promise<Loan[]>;
    }
    public getLoansOfLender(lender: string): Promise<Loan[]> {
      return new Promise((resolve, reject) => {
        // Filter [lenderIn]
        const filters = ['0xe52eac8af912b8b3196b2921f12b66c91b39e025'];
        const params = [this.addressToBytes32(lender)];
        this._rcnExtension.queryLoans.call(this._rcnEngineAddress, 0, 0, filters, params, (err, result) => {
          if (err != null) {
            reject(err);
          }
          resolve(LoanCurator.curateLoans(this.parseLoansBytes(result)));
        });
      }) as Promise<Loan[]>;
    }
    public async getLoansOfBorrower(borrower: string): Promise<Loan[]> {
      // Filter [isBorrower]
      const filters = ['0x65a7c81b32cafa705fca74514de60809006f2c0d'];
      const params = [this.addressToBytes32(borrower)];
      const result = await promisify(c => this._rcnExtension.queryLoans.call(this._rcnEngineAddress, 0, 0, filters, params, c));
      return this.parseLoansBytes(result);
    }
    public readPendingWithdraws(loans: Loan[]): [BigNumber, number[]] {
      const pendingLoans = [];
      let total = new BigNumber(0);

      loans.forEach(loan => {
        if (loan.lenderBalance > 0) {
          total = total.add(new BigNumber(loan.lenderBalance));
          pendingLoans.push(loan.id);
        }
      });

      return [total, pendingLoans];
    }
    public async getPendingWithdraws(): Promise<[number, number[]]> {
      const account = await this.web3.getAccount();
      return new Promise((resolve, reject) => {
        this.getLoansOfLender(account).then((loans: Loan[]) => {
          resolve(this.readPendingWithdraws(loans));
        });
      }) as Promise<[number, number[]]>;
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
