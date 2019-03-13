import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Commit } from '../models/commit.model';
import { environment } from '../../environments/environment';
import { Network } from '../models/loan.model';

@Injectable()
export class CommitsService {

  constructor(private http: Http) { }

  async getCommits(id: string, network: number): Promise<Commit[]> {
    let commits: any;
    let commitsLoanManager;
    let commitsDebtEngine: any;

    if (network === Network.Basalt) {

      const urlBasaltCommits = environment.rcn_node.loan.replace('$id', id.toString());
      const response = await this.http.get(urlBasaltCommits).toPromise();
      const data = response.json();
      commits = data.content.commits;

    } else {
      const urlLoanManagerCommits = environment.rcn_node_api.url.concat(`loans/${id}`);

      try {
        const responseLoanManager = await this.http.get(urlLoanManagerCommits).toPromise();
        commitsLoanManager = responseLoanManager.json().content.commits;
      } catch (err) {
        commitsLoanManager = [];
        console.info('ERROR', err);
      }
      console.info('commits loan manager', commitsLoanManager);

      const urlDebtEngineCommits = environment.rcn_node_api.url.concat(`debts/${id}`);
      try {
        const responseDebtEngine = await this.http.get(urlDebtEngineCommits).toPromise();
        commitsDebtEngine = responseDebtEngine.json().content.commits;
      } catch (err) {
        commitsDebtEngine = [];
        console.info('ERROR', err);
      }

      console.info('commits Debt Engine', commitsDebtEngine);

      const diasporeCommits = commitsLoanManager.concat(commitsDebtEngine);

      commits = diasporeCommits;

    }

    return commits;
  }
}
