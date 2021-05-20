import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'environments/environment';
import { Engine } from 'app/models/loan.model';
import { LoanContentApi } from 'app/interfaces/loan-api-diaspore';
import { PohApi } from 'app/interfaces/poh-api';
import { ApiResponse } from 'app/interfaces/api-response';
import { ChainService } from 'app/services/chain.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(
    private http: HttpClient,
    private chainService: ChainService
  ) { }

  /**
   * Get all loans request that are open, not canceled or expired.
   * @param engine API Engine
   * @param page Page
   * @param pageSize Items per page
   * @param sort Order by
   * @param filters Filter by
   * @return Loans array
   */
  getRequests(
    engine: Engine,
    page = 1,
    pageSize = 20,
    sort?: object,
    filters?: object
  ): Observable<ApiResponse> {
    const { config } = this.chainService;
    const apiBase: string = config.api[engine]['v6'];
    const uri = `requests?page_size=${pageSize}&page=${page}`;
    const payload = JSON.stringify({ sort, filters });
    return this.http
        .post<ApiResponse>(apiBase.concat(uri), payload)
        .pipe(this.injectEngineMultiple(engine));
  }

  /**
   * Get borrowed loans of an address.
   * @param engine API Engine
   * @param account Borrower address
   * @param page Page
   * @param pageSize Items per page
   * @param sort Sort by
   * @return Loans array
   */
  getBorrowed(
    engine: Engine,
    account: string,
    page = 1,
    pageSize = 20,
    sort?: object
  ): Observable<ApiResponse> {
    const { config } = this.chainService;
    const apiBase: string = config.api[engine]['v6'];
    const uri = `borrowed/${account}?page_size=${pageSize}&page=${page}`;
    const payload = JSON.stringify({ sort });
    return this.http
        .post<ApiResponse>(apiBase.concat(uri), payload)
        .pipe(this.injectEngineMultiple(engine));
  }

  /**
   * Get lent loans of an address.
   * @param engine API Engine
   * @param account Lender address
   * @param page Page
   * @param pageSize Items per page
   * @param sort Sort by
   * @return Loans array
   */
  getLent(
    engine: Engine,
    account: string,
    page = 1,
    pageSize = 200,
    sort?: object
  ): Observable<ApiResponse> {
    const { config } = this.chainService;
    const apiBase: string = config.api[engine]['v6'];
    const uri = `lent/${account}?page_size=${pageSize}&page=${page}`;
    const payload = JSON.stringify({ sort });
    return this.http
        .post<ApiResponse>(apiBase.concat(uri), payload)
        .pipe(this.injectEngineMultiple(engine));
  }

  /**
   * Get all active loans
   * @param engine API Engine
   * @param page Page
   * @param pageSize Items per page
   * @param sort Order by
   * @param filters Filter by
   * @return Loans array
   */
  getAcvivity(
    engine: Engine,
    page = 1,
    pageSize = 20,
    sort?: object,
    filters?: object
  ): Observable<ApiResponse> {
    const { config } = this.chainService;
    const apiBase: string = config.api[engine]['v6'];
    const uri = `activity?page_size=${pageSize}&page=${page}`;
    const payload = JSON.stringify({ sort, filters });
    return this.http
        .post<ApiResponse>(apiBase.concat(uri), payload)
        .pipe(this.injectEngineMultiple(engine));
  }

  /**
   * Get loan by ID
   * @param engine API Engine
   * @param id Loan ID
   * @return Loan
   */
  getLoanById(engine: Engine, id: string): Observable<ApiResponse> {
    const { config } = this.chainService;
    const apiBase: string = config.api[engine]['v6'];
    const uri = `loans/${id}`;
    return this.http
        .post<ApiResponse>(apiBase.concat(uri), null)
        .pipe(this.injectEngine(engine));
  }

  /**
   * Get histories by loan IDs
   * @param engine API Engine
   * @param id Loan ID
   * @return Histories array
   */
  getHistories(engine: Engine, id: string): Observable<ApiResponse> {
    const { config } = this.chainService;
    const apiBase: string = config.api[engine]['v6'];
    const uri = `histories_by_id/${id}`;
    return this.http.post<ApiResponse>(apiBase.concat(uri), null);
  }

  /**
   * Check if the api is synchronized
   * @param engine API Engine
   * @return Last and current block
   */
  getApiStatus(engine: Engine): Observable<{last_block: number, current_block: number}> {
    const { config } = this.chainService;
    const apiBase: string = config.api[engine]['v6'];
    const uri = 'status';
    return this.http.post<{last_block: number, current_block: number}>(apiBase.concat(uri), null);
  }

  /**
   * Check if the api is synchronized
   * @param engine API Engine
   * @return Last and current block
   */
  getAddressPoh(address: string): Observable<PohApi> {
    const { host: apiBase } = environment.api.poh;
    const uri = `profile/${address}`;
    return this.http.post<PohApi>(apiBase.concat(uri), null);
  }

  /**
   * Inject engine for a single loan to use in the LoanContentApi
   * @param loanContent API Loan Content
   * @param engine API Engine
   * @return Loan Content with engine
   */
  private injectEngine(engine: Engine) {
    return map((loanContent: ApiResponse) => {
      loanContent.content.engine = engine;
      return loanContent;
    });
  }

  /**
   * Inject engine for multiple loans to use in the LoanContentApi
   * @param loanContent API Loan Content
   * @param engine API Engine
   * @return Loan Content with engine
   */
  private injectEngineMultiple(engine: Engine) {
    return map((loanContent: ApiResponse) => {
      loanContent.content.map((data: LoanContentApi) => {
        data.engine = engine;
        return data;
      });
      return loanContent;
    });
  }
}
