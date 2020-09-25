import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Commit } from '../interfaces/commit.interface';
import { environment } from '../../environments/environment';
// App services
import { EventsService } from './events.service';

@Injectable()
export class CommitsService {

  constructor(
    private http: HttpClient,
    private eventsService: EventsService
  ) { }

  async getCommits(id: string): Promise<Commit[]> {
    let commits: Commit[];
    let commitsLoanManager: Commit[];
    let commitsDebtEngine: Commit[];

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
    }

    const diasporeCommits = commitsLoanManager.concat(commitsDebtEngine);
    commits = diasporeCommits;

    return commits;
  }
}
