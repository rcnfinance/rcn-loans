import { Injectable } from '@angular/core';
import { Headers, Http, Response } from '@angular/http';
import 'rxjs/Rx';
import { Observable } from 'rxjs/Observable';
import { Commit } from '../models/commit.model';

@Injectable()
export class CommitsService {

  constructor(private http: Http) {}
  getCommits() {
    return this.http.get('https://api.mercadolibre.com/items/MLA698930172')
      .map(
        (response: Response) => {
          const commit: Commit[] = response.json();
          return commit;
        }
      )
      .catch(
        (error: Response) => {
          return Observable.throw('Something went wrong');
        }
      );
  }
}
