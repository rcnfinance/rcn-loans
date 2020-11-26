import { Injectable } from '@angular/core';
import { Engine } from './../models/loan.model';
import { ApiResponse } from './../interfaces/api-response';
import { LoanContentApi } from './../interfaces/loan-api-diaspore';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class ProxyApiService {

  constructor(
    private apiService: ApiService
  ) { }

  /**
   * Get all loans request that are open, not canceled or expired.
   * @param page Page
   * @param pageSize Items per page
   * @param sort Order by
   * @param filters Filter by
   * @return Loans array
   */
  async getRequests(page = 0, pageSize = 20, sort?: object, filters?: object): Promise<ApiResponse> {
    const usdcEngine = await this.apiService.getRequests(Engine.UsdcEngine, page, pageSize, sort, filters).toPromise();
    const rcnEngine = await this.apiService.getRequests(Engine.RcnEngine, page, pageSize, sort, filters).toPromise();

    const allResults: ApiResponse = {
      content: usdcEngine.content.concat(rcnEngine.content),
      meta: {
        page: usdcEngine.meta.page,
        page_size: usdcEngine.meta.page_size,
        count: usdcEngine.meta.count + rcnEngine.meta.count
      }
    };
    return allResults;
  }

  /**
   * Get borrowed loans of an address.
   * @param account Borrower address
   * @param page Page
   * @param pageSize Items per page
   * @param sort Sort by
   * @return Loans array
   */
  async getBorrowed(account: string, page = 0, pageSize = 20, sort?: object): Promise<ApiResponse> {
    const usdcEngine = await this.apiService.getBorrowed(Engine.UsdcEngine, account, page, pageSize, sort).toPromise();
    const rcnEngine = await this.apiService.getBorrowed(Engine.RcnEngine, account, page, pageSize, sort).toPromise();

    const allResults: ApiResponse = {
      content: usdcEngine.content.concat(rcnEngine.content),
      meta: {
        page: usdcEngine.meta.page,
        page_size: usdcEngine.meta.page_size,
        count: usdcEngine.meta.count + rcnEngine.meta.count
      }
    };
    return allResults;
  }

  /**
   * Get lent loans of an address.
   * @param account Lender address
   * @param page Page
   * @param pageSize Items per page
   * @param sort Sort by
   * @return Loans array
   */
  async getLent(account: string, page = 0, pageSize = 200, sort?: object): Promise<ApiResponse> {
    const usdcEngine = await this.apiService.getLent(Engine.UsdcEngine, account, page, pageSize, sort).toPromise();
    const rcnEngine = await this.apiService.getLent(Engine.RcnEngine, account, page, pageSize, sort).toPromise();

    const allResults: ApiResponse = {
      content: usdcEngine.content.concat(rcnEngine.content),
      meta: {
        page: usdcEngine.meta.page,
        page_size: usdcEngine.meta.page_size,
        count: usdcEngine.meta.count + rcnEngine.meta.count
      }
    };
    return allResults;
  }

  /**
   * Get all active loans
   * @param page Page
   * @param pageSize Items per page
   * @param sort Order by
   * @param filters Filter by
   * @return Loans array
   */
  async getAcvivity(page = 0, pageSize = 20, sort?: object, filters?: object): Promise<ApiResponse> {
    const usdcEngine = await this.apiService.getAcvivity(Engine.UsdcEngine, page, pageSize, sort, filters).toPromise();
    const rcnEngine = await this.apiService.getAcvivity(Engine.RcnEngine, page, pageSize, sort, filters).toPromise();

    const allResults: ApiResponse = {
      content: usdcEngine.content.concat(rcnEngine.content),
      meta: {
        page: usdcEngine.meta.page,
        page_size: usdcEngine.meta.page_size,
        count: usdcEngine.meta.count + rcnEngine.meta.count
      }
    };
    return allResults;
  }

  /**
   * Get loan by ID
   * @param id Loan ID
   * @return Loan
   */
  async getLoanById(id: string): Promise<ApiResponse> {
    try {
      return await this.apiService.getLoanById(Engine.UsdcEngine, id).toPromise();
    } catch {
      return await this.apiService.getLoanById(Engine.RcnEngine, id).toPromise();
    }
  }

  /**
   * Check if the api is synchronized
   * @return Last and current block
   */
  async getApiStatus(): Promise<{last_block: number, current_block: number}> {
    const usdcEngine = await this.apiService.getApiStatus(Engine.UsdcEngine).toPromise();
    const rcnEngine = await this.apiService.getApiStatus(Engine.RcnEngine).toPromise();

    if (usdcEngine.last_block < rcnEngine.last_block) {
      return usdcEngine;
    }

    return rcnEngine;
  }
}
