import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { environment } from '../../environments/environment';
import { Loan, Network, Oracle, Descriptor, Debt, Status, Model } from '../models/loan.model';
import { Utils } from '../utils/utils';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: Http) { }

  async getRequests(): Promise<Loan[]> {
    const response = await this.http.get(environment.rcn_node_api.url.concat('loans')).toPromise();
    const data = response.json();
    console.log(data);
    const loansArray = this.completeLoanModels(data.content);
    console.log(loansArray);
    return loansArray;
  }

  completeLoanModels(loanArray: any[]): Loan[] {

    const loans: Loan[] = [];
    const engine = environment.contracts.diaspore.loanManager;

    for (const loan of loanArray) {

      const descriptor = new Descriptor(Network.Diaspore, loan.descriptor.first_obligation,
        loan.descriptor.total_obligation, loan.descriptor.duration, loan.descriptor.interest_rate,
        loan.descriptor.punitive_interest_rate, loan.descriptor.frequency, loan.descriptor.installments);

      let debt: Debt;
      if (0 !== Status.Request) {
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
            loan.oracle
          );
      }

      const newLoan = new Loan(
        Network.Diaspore,
        loan.id,
        engine,
        loan.amount,
        loan.oracle,
        descriptor,
        loan.borrower,
        loan.creator,
        loan.status,
        loan.expiration,
        loan.cosigner,
        debt
      );

      loans.push(newLoan);

    }
    return loans;
  }
}
