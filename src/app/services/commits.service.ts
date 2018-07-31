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
import { Commit } from '../models/commit.model';

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
        return data;
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
        const commits = response.json().commits
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
