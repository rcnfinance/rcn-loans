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

  constructor(private http: Http) { }

  async getRequests(): Promise<Loan[]> {
    const response = await this.http.get(environment.rcn_node_api.url.concat('loans')).toPromise();
    const data = response.json();
    const loansArray = this.completeLoanModels(data.content);
    const loansRequests = loansArray.filter(loan => loan._status === 0);
    console.log(loansRequests);
    return loansRequests;
  }

  completeLoanModels(loanArray: any[]): Loan[] {

    const loans: Loan[] = [];
    const engine = environment.contracts.diaspore.loanManager;

    for (const loan of loanArray) {
      console.log(loan);

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
        Network.Diaspore, parseInt(loan.descriptor.first_obligation, 10), parseInt(loan.descriptor.total_obligation, 10),
        parseInt(loan.descriptor.duration, 10), parseInt(loan.descriptor.interest_rate, 10),
        LoanUtils.decodeInterest(parseInt(loan.descriptor.punitive_interest_rate, 10)),
        parseInt(loan.descriptor.frequency, 10), parseInt(loan.descriptor.installments, 10));

      let debt: Debt;
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

      const newLoan = new Loan(
        Network.Diaspore,
        loan.id,
        engine,
        parseInt(loan.amount, 10),
        oracle,
        descriptor,
        loan.borrower,
        loan.creator,
        parseInt(loan.status, 10),
        parseInt(loan.expiration, 10),
        loan.cosigner,
        debt
      );

      loans.push(newLoan);

    }
    return loans;
  }
}
