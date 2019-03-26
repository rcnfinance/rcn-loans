import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { environment } from '../../environments/environment';
import { Loan, Network, Oracle, Descriptor, Debt, Model } from '../models/loan.model';
import { Utils } from '../utils/utils';
import { LoanUtils } from '../utils/loan-utils';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  installmentModelAddress = '0x2B1d585520634b4c7aAbD54D73D34333FfFe5c53';
  url = environment.rcn_node_api.url;

  constructor(private http: Http) { }

  // Loads all loans lent by the account that is logged in
  async getLoansOfLender(lender: string): Promise<Loan[]> {
    let allLoansOfLender: Loan[] = [];
    let apiCalls = 0;
    let page = 0;
    try {
      const response = await this.http.get(this.url.concat('loans?open=false&page=' + page + '&lender=' + lender)).toPromise();
      const data = response.json();
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

      const response = await this.http.get(this.url.concat('loans?open=false&page=' + page)).toPromise();
      const data = response.json();
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
    const response = await this.http.get(this.url.concat(`loans/${id}`)).toPromise();
    const data = response.json();
    const loanArray = [data.content];
    const loan = await this.completeLoanModels(loanArray);
    try {
      return loan[0];
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

  // Get all loans request that are open, not canceled or expired.
  async getRequests(now: number): Promise<Loan[]> {
    let allRequestLoans: Loan[] = [];
    let apiCalls = 0;
    let page = 0;
    try {

      const response = await this.http.get(this.url.concat('loans?open=true&approved=true&page=' + page
        + '&expiration__gt=' + now)).toPromise();
      const data = response.json();
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
      const url = this.url.concat('loans?open=true&approved=true&page=' + page
        + '&expiration__gt=' + now);
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
      oracle = new Oracle(
        Network.Diaspore,
        loan.oracle,
        Utils.hexToAscii(loan.currency.replace(/^[0x]+|[0]+$/g, '')),
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
      const response = await this.http.get(this.url.concat(`model_debt_info/${loan.id}`)).toPromise();
      const data = response.json();
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
}
