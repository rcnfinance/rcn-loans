import { Injectable } from '@angular/core';
import { 
  Http, 
  Response,
  RequestOptions,
  Headers,
  HttpModule,
  URLSearchParams,
} from '@angular/http';
import 'rxjs/Rx';
import { Observable } from 'rxjs/Observable';
import { LoanApi } from '../models/loanapi.model';
import { Commit} from '../models/commit.model';

@Injectable()
export class CommitsService {
  // configUrl = 'https://testnet.rnode.rcn.loans/v1/loans/1';
  configUrl = 'http://192.168.0.249:8000/v1/loans/1';

  constructor(private http: Http) {}

  getLoanData() {
    return this.http.get(this.configUrl)
      .map((response: Response) => {
        const data = response.json();

        console.log(data);
        const loans = (typeof data.content === 'object') ? [data.content] : data.content
          .map( loans => {
            return new LoanApi(
              loans.index,
              loans.created,
              loans.status,
              loans.oracle,
              loans.borrower,
              loans.lender,
              loans.creator,
              loans.cosigner,
              loans.amount,
              loans.interest,
              loans.punitory_interest,
              loans.interest_timestamp,
              loans.paid,
              loans.interest_rate,
              loans.interest_rate_punitory,
              loans.due_time,
              loans.dues_in,
              loans.currency,
              loans.cancelable_at,
              loans.lender_balance,
              loans.expiration_requests,
              loans.approved_transfer,
              loans.commits
            );
        })
        console.log(loans);
        return loans;

      })
      .catch(
        (error: Response) => {
          return Observable.throw('Something went wrong: We couldnt get your Loan data');
        }
      );
  }

  getCommits() {
    return this.http.get(this.configUrl)
      .map((response: Response) => {
        const data = response.json();
        const commits = data.content.commits
        .map( commit => {
          return new Commit( 
            commit.opcode,
            commit.timestamp,
            commit.order,
            commit.proof,
            commit.data
          );
        })
        console.log(commits);
        return commits;
      })
      .catch(
        (error: Response) => {
          return Observable.throw('Something went wrong: We couldnt get your Commit[] events');
        }
      );
  }
}
