import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Commit } from '../models/commit.model';
import { environment } from '../../environments/environment';
import { Network } from '../models/loan.model';

@Injectable()
export class CommitsService {

  constructor(private http: HttpClient) { }

  async getCommits(id: string, network: number): Promise<Commit[]> {
    let commits: any;
    let commitsLoanManager;
    let commitsDebtEngine: any;

    if (network === Network.Basalt) {

      const urlBasaltCommits = environment.rcn_node.loan.replace('$id', id.toString());
      const data: any = await this.http.get(urlBasaltCommits).toPromise();
      commits = data.content.commits;

    } else {
      const urlLoanManagerCommits = environment.rcn_node_api.url.concat(`loans/${id}`);

      try {
        const responseLoanManager: any = await this.http.get(urlLoanManagerCommits).toPromise();
        commitsLoanManager = responseLoanManager.content.commits;
      } catch (err) {
        commitsLoanManager = [];
        console.info('ERROR', err);
      }

      const urlDebtEngineCommits = environment.rcn_node_api.url.concat(`debts/${id}`);
      try {
        const responseDebtEngine: any = await this.http.get(urlDebtEngineCommits).toPromise();
        commitsDebtEngine = responseDebtEngine.content.commits;
      } catch (err) {
        commitsDebtEngine = [];
        console.info('ERROR', err);
      }

      const diasporeCommits = commitsLoanManager.concat(commitsDebtEngine);

      commits = diasporeCommits;

    }

    return commits;
  }
}
