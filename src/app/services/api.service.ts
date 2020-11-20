import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoanContentApi } from './../interfaces/loan-api-diaspore';
import { ApiResponse } from './../interfaces/api-response';
export enum ApiEngine {
  RcnEngine = 'rcnEngine',
  UsdcEngine = 'usdcEngine'
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(private http: HttpClient) { }

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
    engine: ApiEngine,
    page = 0,
    pageSize = 20,
    sort?: object,
    filters?: object
  ): Observable<ApiResponse> {
    const apiBase: string = environment.api[engine]['v6'];
    const uri = `requests?page_size=${pageSize}&page=${page}`;
    const payload = JSON.stringify({ sort, filters });
    return this.http.post<ApiResponse>(apiBase.concat(uri), payload);
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
    engine: ApiEngine,
    account: string,
    page = 0,
    pageSize = 20,
    sort?: object
  ): Observable<ApiResponse> {
    const apiBase: string = environment.api[engine]['v6'];
    const uri = `borrowed/${account}?page_size=${pageSize}&page=${page}`;
    const payload = JSON.stringify({ sort });
    return this.http.post<ApiResponse>(apiBase.concat(uri), payload);
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
    engine: ApiEngine,
    account: string,
    page = 0,
    pageSize = 200,
    sort?: object
  ): Observable<ApiResponse> {
    const apiBase: string = environment.api[engine]['v6'];
    const uri = `lent/${account}?page_size=${pageSize}&page=${page}`;
    const payload = JSON.stringify({ sort });
    return this.http.post<ApiResponse>(apiBase.concat(uri), payload);
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
    engine: ApiEngine,
    page = 0,
    pageSize = 20,
    sort?: object,
    filters?: object
  ): Observable<ApiResponse> {
    const apiBase: string = environment.api[engine]['v6'];
    const uri = `activity?page_size=${pageSize}&page=${page}`;
    const payload = JSON.stringify({ sort, filters });
    return this.http.post<ApiResponse>(apiBase.concat(uri), payload);
  }

  /**
   * Get loan by ID
   * @param engine API Engine
   * @param id Loan ID
   * @return Loan
   */
  getLoanById(engine: ApiEngine, id: string): Observable<LoanContentApi> {
    const apiBase: string = environment.api[engine]['v6'];
    const uri = `loans/${id}`;
    return this.http.post<LoanContentApi>(apiBase.concat(uri), null);
  }

  /**
   * Check if the api is synchronized
   * @param engine API Engine
   * @return Last and current block
   */
  getApiStatus(engine: ApiEngine): Observable<{last_block: number, current_block: number}> {
    const apiBase: string = environment.api[engine]['v6'];
    const uri = 'status2';
    return this.http.get<{last_block: number, current_block: number}>(apiBase.concat(uri));
  }
}
