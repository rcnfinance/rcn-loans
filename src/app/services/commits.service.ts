import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Commit } from '../models/commit.model';
import { environment } from '../../environments/environment';

@Injectable()
export class CommitsService {

  constructor(private http: Http) {}

  async getCommits(id: string): Promise<Commit[]> {
    const response = await this.http.get(environment.rcn_node.loan.replace('$id', id)).toPromise();
    const data = response.json();
    return data.content.commits;
  }
}
