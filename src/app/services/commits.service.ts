import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import 'rxjs/Rx';
import { Observable } from 'rxjs/Observable';
import { Commit} from '../models/commit.model';

@Injectable()
export class CommitsService {
  configUrl = 'https://testnet.rnode.rcn.loans/v1/loans/';

  constructor(private http: Http) {}

  getCommits(id) { // Get() all Commits[] from API by :id
    return this.http.get(this.configUrl + id)
      .map((response: Response) => {
        const data = response.json();
        const commits$ = data.content.commits
        .map( commit => {
          return new Commit(
            commit.opcode,
            commit.timestamp,
            commit.order,
            commit.proof,
            commit.data
          );
        })
        return commits$;
      })
      .catch(
        (error: Response) => {
          return Observable.throw('Something went wrong: We couldnt get your Commit[] events');
        }
      );
  }

}
