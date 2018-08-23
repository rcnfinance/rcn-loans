import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import 'rxjs/Rx';
import { Observable } from 'rxjs/Observable';
import { Commit} from '../models/commit.model';
import { environment } from '../../environments/environment';
import { Loan } from '../models/loan.model';

@Injectable()
export class CommitsService {

  constructor(private http: Http) {}

  async getCommits(id: number): Promise<Commit[]> {
    const response = await this.http.get(environment.rcn_node.loan.replace('$id', id.toString())).toPromise();
    const data = response.json();
    return data.content.commits;
  }
}
