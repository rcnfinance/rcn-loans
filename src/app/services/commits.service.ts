import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Commit } from '../models/commit.model';
import { environment } from '../../environments/environment';
import { Network } from '../models/loan.model';

@Injectable()
export class CommitsService {

  constructor(private http: Http) { }

  async getCommits(id: string, network: number): Promise<Commit[]> {
    let url = '';

    if (network === Network.Basalt) {

      url = environment.rcn_node.loan.replace('$id', id.toString());

    } else {
      url = environment.rcn_node_api.url.concat(`loans/${id}`);
    }

    const response = await this.http.get(url).toPromise();

    const data = response.json();
    return data.content.commits;
  }
}
