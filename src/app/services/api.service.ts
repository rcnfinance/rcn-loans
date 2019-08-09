import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Loan, Network, Oracle, Descriptor, Debt, Model } from '../models/loan.model';
import { Utils } from '../utils/utils';
import { LoanUtils } from '../utils/loan-utils';
import { Web3Service } from './web3.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  installmentModelAddress = '0x2B1d585520634b4c7aAbD54D73D34333FfFe5c53';
  url = environment.rcn_node_api.url;

  constructor(
    private http: HttpClient,
    private web3Service: Web3Service
  ) { }

  // Loads all loans lent by the account that is logged in
  async getLoansOfLender(lender: string): Promise<Loan[]> {
    const web3 = this.web3Service.web3;
    let allLoansOfLender: Loan[] = [];
    let apiCalls = 0;
    let page = 0;
    try {
      lender = web3.toChecksumAddress(lender);
      const data: any = await this.http.get(this.url.concat('loans?open=false&page=' + page + '&lender=' + lender)).toPromise();
      if (page === 0) {
        apiCalls = Math.ceil(data.meta.resource_count / data.meta.page_size);
      }
      const activeLoans = await this.getAllCompleteLoans(data.content);
      allLoansOfLender = allLoansOfLender.concat(activeLoans);
      page++;
    } catch (err) {
      console.info('Error', err);
    }

    const urls = [];
    for (page; page < apiCalls; page++) {
      const url = this.url.concat('loans?open=false&page=' + page + '&lender=' + lender);
      urls.push(url);
    }
    const responses = await this.getAllUrls(urls);

    const allApiLoans = await this.getAllApiLoans(responses);

    for (const apiLoans of allApiLoans) {
      allLoansOfLender = allLoansOfLender.concat(apiLoans);
    }

    return allLoansOfLender;
  }

  // Gets all loans that were lent and there status is ongoing. Meaning that they are not canceled or finished.
  async getActiveLoans(): Promise<Loan[]> {
    let allActiveLoans: Loan[] = [];
    let apiCalls = 0;
    let page = 0;
    try {

      const data: any = await this.http.get(this.url.concat('loans?open=false&page=' + page)).toPromise();
      if (page === 0) {
        apiCalls = Math.ceil(data.meta.resource_count / data.meta.page_size);
      }
      const activeLoans = await this.getAllCompleteLoans(data.content);
      allActiveLoans = allActiveLoans.concat(activeLoans);
      page++;

    } catch (err) {
      console.info('Error', err);
    }

    const urls = [];
    for (page; page < apiCalls; page++) {
      const url = this.url.concat('loans?open=false&page=' + page);
      urls.push(url);
    }
    const responses = await this.getAllUrls(urls);

    const allApiLoans = await this.getAllApiLoans(responses);

    for (const apiLoans of allApiLoans) {
      allActiveLoans = allActiveLoans.concat(apiLoans);
    }

    return allActiveLoans;
  }

  async getLoan(id: string): Promise<Loan> {
    const data: any = await this.http.get(this.url.concat(`loans/${id}`)).toPromise();
    const loan = await this.completeLoanModels(data.content);
    try {
      return loan;
    } catch {
      console.info('loan does not exist');
    }
  }

  async getAllUrls(urls: any[]) {
    try {
      const data = await Promise.all(
        urls.map(
          url =>
            fetch(url).then(
              (response) => response.json()
            )));

      return (data);

    } catch (error) {
      console.info(error);
      throw (error);
    }
  }

  async getAllCompleteLoans(apiLoans: any[]) {
    try {
      const loans = await Promise.all(
        apiLoans.map(
          loan =>
            this.completeLoanModels(loan)));

      return (loans);

    } catch (error) {
      console.info(error);
      throw (error);
    }
  }

  async getAllApiLoans(responses: any[]) {
    try {
      const activeLoans = await Promise.all(
        responses.map(
          response => this.getAllCompleteLoans(response.content)
        ));

      return (activeLoans);

    } catch (error) {
      console.info(error);
      throw (error);
    }
  }

  /**
   * Get all loans request that are open, not canceled or expired.
   * @param now Block timestamp
   * @return Loans array
   */
  async getRequests(now: number): Promise<Loan[]> {
    let allRequestLoans: Loan[] = [];
    let apiCalls = 0;
    let page = 0;

    try {
      const uri = `loans?open=true&approved=true&page=${ page }&expiration__gt=${ now }`;
      const data: any = await this.http.get(this.url.concat(uri)).toPromise();

      if (page === 0) {
        apiCalls = Math.ceil(data.meta.resource_count / data.meta.page_size);
      }

      const loansRequests = await this.getAllCompleteLoans(data.content);
      const notExpiredResquestLoans = loansRequests.filter(loan => loan.model !== this.installmentModelAddress);
      allRequestLoans = allRequestLoans.concat(notExpiredResquestLoans);
      page++;
    } catch (err) {
      console.info('Error', err);
    }

    const urls = [];
    for (page; page < apiCalls; page++) {
      const uri = `loans?open=true&approved=true&page=${ page }&expiration__gt=${ now }`;
      const url = this.url.concat(uri);
      urls.push(url);
    }

    const responses = await this.getAllUrls(urls);
    for (const response of responses) {
      const loansRequests = await this.getAllCompleteLoans(response.content);
      const notExpiredResquestLoans = loansRequests.filter(loan => loan.model !== this.installmentModelAddress);
      allRequestLoans = allRequestLoans.concat(notExpiredResquestLoans);
    }

    return allRequestLoans;
  }

  async completeLoanModels(loan: any): Promise<Loan> {

    const engine = environment.contracts.diaspore.loanManager;

    let oracle: Oracle;
    if (loan.oracle !== Utils.address0x) {
      const currency = loan.currency ? Utils.hexToAscii(loan.currency.replace(/^[0x]+|[0]+$/g, '')) : '';
      oracle = new Oracle(
        Network.Diaspore,
        loan.oracle,
        currency,
        loan.currency
      );
    } else {
      oracle = new Oracle(
        Network.Diaspore,
        loan.oracle,
        'RCN',
        loan.currency
      );
    }

    const descriptor = new Descriptor(
      Network.Diaspore, Number(loan.descriptor.first_obligation), Number(loan.descriptor.total_obligation),
      Number(loan.descriptor.duration), Number(loan.descriptor.interest_rate),
      LoanUtils.decodeInterest(Number(loan.descriptor.punitive_interest_rate)),
      Number(loan.descriptor.frequency), Number(loan.descriptor.installments));

    let debt: Debt;
    if (!loan.open && !loan.canceled && loan.status) {
      const data: any = await this.http.get(this.url.concat(`model_debt_info/${loan.id}`)).toPromise();
      const paid = data.paid;
      const dueTime = data.due_time;
      const estimatedObligation = data.estimated_obligation;
      const nextObligation = data.next_obligation;
      const currentObligation = data.current_obligation;
      const debtBalance = data.debt_balance;
      const owner = data.owner;
      debt = new Debt(
        Network.Diaspore,
        loan.id,
        new Model(
          Network.Diaspore,
          loan.model,
          paid,
          nextObligation,
          currentObligation,
          estimatedObligation,
          dueTime
        ),
        debtBalance,
        engine,
        owner,
        oracle
      );
    }

    const newLoan = new Loan(
      Network.Diaspore,
      loan.id,
      engine,
      Number(loan.amount),
      oracle,
      descriptor,
      loan.borrower,
      loan.creator,
      Number(loan.status),
      Number(loan.expiration),
      loan.model,
      loan.cosigner,
      debt
    );

    return newLoan;
  }

  /**
   * Get collateral.
   * @param loanId Loan ID
   * @return Collateral
   */
  async getCollateralByLoan(loanId: string) {
    const uri = `collaterals?debt_id=${ loanId }`;
    const data: any = await this.http.get(this.url.concat(uri)).toPromise();

    try {
      return data.content;
    } catch {
      throw Error('Error obtaining loan collateral');
    }
  }
}
