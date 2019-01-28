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

  url = environment.rcn_node_api.url;

  constructor(private http: Http) { }

  async getLoansOfLender(lender: string): Promise<Loan[]> {
    const response = await this.http.get(this.url.concat('loans?open=false')).toPromise();
    const data = response.json();
    const activeLoans = await this.completeLoanModels(data.content);
    const loansOfLender = activeLoans.filter(loan => loan.debt.owner.toLowerCase() === lender);
    return loansOfLender;
  }

  async getActiveLoans(): Promise<Loan[]> {
    const response = await this.http.get(this.url.concat('loans?open=false')).toPromise();
    const data = response.json();
    const activeLoans = await this.completeLoanModels(data.content);
    return activeLoans;
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

  async getRequests(now: number): Promise<Loan[]> {
    const response = await this.http.get(this.url.concat('loans?open=true')).toPromise();
    const data = response.json();
    const loansRequests = await this.completeLoanModels(data.content);
    const notExpiredResquestLoans = loansRequests.filter(loan => loan.expiration > now);
    return notExpiredResquestLoans;
  }

  async completeLoanModels(loanArray: any[]): Promise<Loan[]> {

    const loans: Loan[] = [];
    const engine = environment.contracts.diaspore.loanManager;

    for (const loan of loanArray) {
      const loanCurrencyWith0x = '0x';

      let oracle: Oracle;
      if (loan.oracle !== Utils.address0x) {
        oracle = new Oracle(
        Network.Diaspore,
        loan.oracle,
        Utils.hexToAscii(loan.currency.replace(/^[0x]+|[0]+$/g, '')),
        loanCurrencyWith0x.concat(loan.currency)
      );
      } else {
        oracle = new Oracle(
          Network.Diaspore,
          loan.oracle,
          'RCN',
          loanCurrencyWith0x.concat(loan.currency)
        );
      }

      const descriptor = new Descriptor(
        Network.Diaspore, Number(loan.descriptor.first_obligation), Number(loan.descriptor.total_obligation),
        Number(loan.descriptor.duration), Number(loan.descriptor.interest_rate),
        LoanUtils.decodeInterest(Number(loan.descriptor.punitive_interest_rate)),
        Number(loan.descriptor.frequency), Number(loan.descriptor.installments));

      let debt: Debt;
      if (!loan.open && !loan.canceled) {
        const response = await this.http.get(this.url.concat(`model_debt_info/${loan.id}`)).toPromise();
        const data = response.json();
        const paid = data.paid;
        const dueTime = data.dueTime;
        const estimatedObligation = data.estimatedObligation;
        const nextObligation = data.nextObligation;
        const currentObligation = data.currentObligation;
        const debtBalance = data.debtBalance;
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
        loan.cosigner,
        debt
      );

      loans.push(newLoan);

    }
    return loans;
  }
}
