import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Commit } from '../models/commit.model';
import { environment } from '../../environments/environment';

@Injectable()
export class CommitsService {

  url = environment.rcn_node_api.url;

  constructor(private http: Http) {}

  async getCommits(id: string): Promise<Commit[]> {
    const response = await this.http.get(this.url.concat(`loans/${id}`)).toPromise();
    const data = response.json();
    return data.content.commits;
  }
}
