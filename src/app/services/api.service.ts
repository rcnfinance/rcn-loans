import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { environment } from '../../environments/environment';
import { Loan, Network, Oracle, Descriptor, Debt, Status, Model } from '../models/loan.model';
import { Utils } from '../utils/utils';
import { LoanUtils } from '../utils/loan-utils';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  url = environment.rcn_node_api.url;

  constructor(private http: Http) { }

  async getLoan(id: string): Promise<Loan> {
    const response = await this.http.get(this.url.concat(`loans/${id}`)).toPromise();
    const data = response.json();
    const loanArray = [data.content];
    const loan = this.completeLoanModels(loanArray);
    return loan[0];
  }

  async getRequests(): Promise<Loan[]> {
    const response = await this.http.get(this.url.concat('loans')).toPromise();
    const data = response.json();
    const loansArray = this.completeLoanModels(data.content);
    const loansRequests = loansArray.filter(loan => loan._status === 0);
    return loansRequests;
  }

  completeLoanModels(loanArray: any[]): Loan[] {

    const loans: Loan[] = [];
    const engine = environment.contracts.diaspore.loanManager;

    for (const loan of loanArray) {

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
      if (Number(loan.status) !== Status.Request) {
        const paid = 0;
        const dueTime = 0;
        const estimatedObligation = 0;
        const nextObligation = 0;
        const currentObligation = 0;
        const debtBalance = 0;
        const owner = '0';
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
