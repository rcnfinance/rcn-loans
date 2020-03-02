import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Commit } from '../interfaces/commit.interface';
import { environment } from '../../environments/environment';
import { Network } from '../models/loan.model';
// App services
import { EventsService } from './events.service';

@Injectable()
export class CommitsService {

  constructor(
    private http: HttpClient,
    private eventsService: EventsService
  ) { }

  async getCommits(id: string, network: number): Promise<Commit[]> {
    let commits: any;
    let commitsLoanManager;
    let commitsDebtEngine: any;

    if (network === Network.Basalt) {

      const urlBasaltCommits = environment.rcn_node.loan.replace('$id', id.toString());
      const data: any = await this.http.get(urlBasaltCommits).toPromise();
      commits = data.content;

    } else {
      const urlLoanManagerCommits = environment.rcn_node_api.url.concat(`commits?id_loan=${ id }&page_size=100`);
      // TODO: add commits paginator

      try {
        const responseLoanManager: any = await this.http.get(urlLoanManagerCommits).toPromise();
        commitsLoanManager = responseLoanManager.content;
      } catch (err) {
        commitsLoanManager = [];
        this.eventsService.trackError(err);
      }

      const urlDebtEngineCommits = environment.rcn_node_api.url.concat(`debts/${ id }`);
      try {
        const responseDebtEngine: any = await this.http.get(urlDebtEngineCommits).toPromise();
        commitsDebtEngine = responseDebtEngine.content;
      } catch (err) {
        commitsDebtEngine = [];
      }

      const diasporeCommits = commitsLoanManager.concat(commitsDebtEngine);

      commits = diasporeCommits;

    }

    return commits;
  }
}
