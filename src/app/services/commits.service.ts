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
    let commits: Commit[];
    let commitsLoanManager: Commit[];
    let commitsDebtEngine: Commit[];

    if (network === Network.Basalt) {
      const apiBasalt: string = environment.rcnApi.basalt.v1;
      const urlBasaltCommits = `${ apiBasalt }commits?id_loan=${ id.toString() }`;
      const data: any = await this.http.get(urlBasaltCommits).toPromise();
      commits = data.content;

    } else {
      const apiDiaspore: string = environment.rcnApi.diaspore.v4;
      const urlLoanManagerCommits = `${ apiDiaspore }commits?id_loan=${ id }&page_size=100`;
      // TODO: add commits paginator

      try {
        const responseLoanManager: any = await this.http.get(urlLoanManagerCommits).toPromise();
        commitsLoanManager = responseLoanManager.content;
      } catch (err) {
        commitsLoanManager = [];
        this.eventsService.trackError(err);
      }

      const urlDebtEngineCommits = `${ apiDiaspore }debts/${ id }`;
      try {
        const responseDebtEngine: any = await this.http.get(urlDebtEngineCommits).toPromise();
        commitsDebtEngine = responseDebtEngine.content;
      } catch (err) {
        commitsDebtEngine = [];
        this.eventsService.trackError(err);
      }

      const diasporeCommits = commitsLoanManager.concat(commitsDebtEngine);
      commits = diasporeCommits;
    }

    return commits;
  }
}
