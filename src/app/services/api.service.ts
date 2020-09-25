import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { ApiResponse } from './../interfaces/api-response';
import { LoanApiDiaspore } from './../interfaces/loan-api-diaspore';
import { CollateralApi } from './../interfaces/collateral-api';
import { Loan, Status } from '../models/loan.model';
import { Collateral } from '../models/collateral.model';
import { LoanUtils } from '../utils/loan-utils';
// App services
import { Web3Service } from './web3.service';
import { EventsService } from '../services/events.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  installmentModelAddress = '0x2B1d585520634b4c7aAbD54D73D34333FfFe5c53';
  multicallConfig = {
    rpcUrl: environment.network.provider.url,
    multicallAddress: environment.contracts.multicall
  };

  constructor(
    private http: HttpClient,
    private web3Service: Web3Service,
    private eventsService: EventsService
  ) { }

  /**
   * Get all loans request that are open, not canceled or expired.
   * @param sortKey Loan Sort Key
   * @param sortValue Loan Sort Value
   * @return Loans array
   */
  async getRequests(sort?: string): Promise<Loan[]> {
    const now: number = (await this.web3Service.web3.eth.getBlock('latest')).timestamp;
    const apiUrl: string = this.getApiUrl('v5');
    let allRequestLoans: Loan[] = [];
    let apiCalls = 0;
    let page = 0;

    const requestFilters = () => `open=true&canceled=false&approved=true&status=0&page=${ page }&expiration__gt=${ now }`;
    const requestSort = () => sort ? `order_by=${ sort }` : '';

    try {
      const data: ApiResponse =
        (await this.http.get(apiUrl.concat(`loans?${ requestFilters() }&${ requestSort() }`)).toPromise() as ApiResponse);

      if (page === 0) {
        apiCalls = Math.ceil(data.meta.resource_count / data.meta.page_size);
      }

      const filterStatus = [Status.Destroyed, Status.Expired];
      const loansRequests = await this.getAllCompleteLoans(data.content as LoanApiDiaspore[]);
      const filteredLoans = this.excludeLoansWithStatus(
        filterStatus,
        null,
        loansRequests
      );

      allRequestLoans = allRequestLoans.concat(filteredLoans);
      page++;
    } catch (err) {
      this.eventsService.trackError(err);
    }

    const urls = [];
    for (page; page < apiCalls; page++) {
      const url = apiUrl.concat(`loans?${ requestFilters() }&${ requestSort() }`);
      urls.push(url);
    }
    const responses = await this.getAllUrls(urls);

    for (const response of responses) {
      const filterStatus = [Status.Destroyed, Status.Expired];
      const loansRequests = await this.getAllCompleteLoans(response.content);
      const notExpiredResquestLoans = this.excludeLoansWithStatus(
        filterStatus,
        null,
        loansRequests
      );

      allRequestLoans = allRequestLoans.concat(notExpiredResquestLoans);
    }

    return allRequestLoans;
  }

  /**
   * Get all loan collaterals
   * @return Collateral array
   */
  async getCollateral(): Promise<Collateral[]> {
    const apiUrl: string = this.getApiUrl();
    let apiCollaterals: CollateralApi[] = [];
    let collaterals: Collateral[] = [];
    let apiCalls = 0;
    let page = 0;

    try {
      const data: any = await this.http.get(apiUrl.concat(
        `collaterals?page=${ page }`
      )).toPromise();

      if (page === 0) {
        apiCalls = Math.ceil(data.meta.resource_count / data.meta.page_size);
      }

      apiCollaterals = apiCollaterals.concat(data.content);
      collaterals = this.getAllCompleteCollaterals(apiCollaterals);
      page++;
    } catch (err) {
      this.eventsService.trackError(err);
    }

    const urls = [];
    for (page; page < apiCalls; page++) {
      const url = apiUrl.concat(`collaterals?page=${ page }`);
      urls.push(url);
    }
    const responses = await this.getAllUrls(urls);
    const allApiCollaterals = await this.getAllApiCollaterals(responses);
    collaterals = this.getAllCompleteCollaterals(apiCollaterals).concat(allApiCollaterals);

    return collaterals;
  }

  /**
   * Get all loans lent by the account that is logged in
   * @param address Lender or borrower address
   * @param loansType Selected network
   * @param sort Order by
   * @return Loans array
   */
  async getLoansOfLenderOrBorrower(
    address: string,
    loansType: 'lender' | 'borrower',
    sort: string
  ): Promise<Loan[]> {
    const web3 = this.web3Service.web3;
    const apiUrl: string = this.getApiUrl('v5');

    const requestFilters = (apiPage: number) =>
      `page=${ apiPage }&${ loansType === 'lender' ? 'owner' : loansType }=${ address }`;
    const requestSort = () => sort ? `order_by=${ sort }` : '';

    let allLoansOfAddress: Loan[] = [];
    let apiCalls = 0;
    let page = 0;

    try {
      address = web3.utils.toChecksumAddress(address);
      const url = apiUrl.concat(`loans?${ requestFilters(page) }&${ requestSort() }`);
      const data: any = await this.http.get(url).toPromise();

      if (page === 0) {
        apiCalls = Math.ceil(data.meta.resource_count / data.meta.page_size);
      }

      const activeLoans = await this.getAllCompleteLoans(data.content);
      allLoansOfAddress = allLoansOfAddress.concat(activeLoans);
      page++;
    } catch (err) {
      this.eventsService.trackError(err);
    }

    const urls = [];
    for (page; page < apiCalls; page++) {
      const eachUrl = apiUrl.concat(`loans?${ requestFilters(page) }&${ requestSort() }`);
      urls.push(eachUrl);
    }
    const responses = await this.getAllUrls(urls);
    const allApiLoans = await this.getAllApiLoans(responses);

    for (const apiLoans of allApiLoans) {
      allLoansOfAddress = allLoansOfAddress.concat(apiLoans);
    }

    const filterStatus = [Status.Expired, Status.Destroyed];
    allLoansOfAddress = this.excludeLoansWithStatus(filterStatus, null, allLoansOfAddress);

    return allLoansOfAddress;
  }

  /**
   * Gets all loans that were lent and there status is ongoing. Meaning that they are not canceled or finished.
   * @return Loans array
   */
  async getActiveLoans(): Promise<Loan[]> {
    const apiUrl: string = this.getApiUrl();
    let allActiveLoans: Loan[] = [];
    let apiCalls = 0;
    let page = 0;

    try {
      const data: any = await this.http.get(apiUrl.concat(`loans?open=false&canceled=false&approved=true&page=${ page }`)).toPromise();
      if (page === 0) {
        apiCalls = Math.ceil(data.meta.resource_count / data.meta.page_size);
      }

      const activeLoans = await this.getAllCompleteLoans(data.content as LoanApiDiaspore[]);

      allActiveLoans = allActiveLoans.concat(activeLoans);
      page++;
    } catch (err) {
      this.eventsService.trackError(err);
    }

    const urls = [];
    for (page; page < apiCalls; page++) {
      const url = apiUrl.concat(`loans?open=false&canceled=false&approved=true&page=${ page }`);
      urls.push(url);
    }

    const responses = await this.getAllUrls(urls);
    const allApiLoans = await this.getAllApiLoans(responses);

    for (const apiLoans of allApiLoans) {
      allActiveLoans = allActiveLoans.concat(apiLoans);
    }

    return allActiveLoans;
  }

  /**
   * Gets all loans that were lent and there status is ongoing. Meaning that they are not canceled or finished.
   * @param page Page
   * @param pageSize Items per page
   * @param sort Order by
   * @return Loans array
   */
  async getPaginatedActiveLoans(page = 0, pageSize = 20, sort?: string): Promise<Loan[]> {
    const apiUrl: string = this.getApiUrl('v5');
    let allActiveLoans: Loan[] = [];
    let apiCalls = 0;

    const requestFilters = () => `open=false&canceled=false&approved=true&page_size=${ pageSize }&page=${ page }`;
    const requestSort = () => sort ? `order_by=${ sort }` : '';

    try {
      const data: any = await this.http.get(
        apiUrl.concat(`loans?${ requestFilters() }&${ requestSort() }`)
      ).toPromise();
      apiCalls = Math.ceil(data.meta.resource_count / data.meta.page_size);

      if (page > apiCalls) {
        return [];
      }

      const activeLoans = await this.getAllCompleteLoans(data.content);
      allActiveLoans = allActiveLoans.concat(activeLoans);

      return allActiveLoans;
    } catch (err) {
      this.eventsService.trackError(err);
    }
  }

  /**
   * Gets loan by ID
   * @param id Loan ID
   * @return Loan
   */
  async getLoan(id: string): Promise<Loan> {
    const apiUrl: string = this.getApiUrl('v5');
    const data: any = await this.http.get(apiUrl.concat(`loans/${ id }`)).toPromise();
    const apiLoan: any = data.content;
    const loan = await this.completeLoanModels(apiLoan);
    try {
      return loan;
    } catch {
      console.info('loan does not exist');
    }
  }

  /**
   * Check if the api is synchronized
   * @return Promise boolean
   */
  async isSynchronized(): Promise<boolean> {
    const apiUrl: string = this.getApiUrl('v5');
    const { meta }: any = await this.http.get(apiUrl.concat(`loans?page_size=1`)).toPromise();
    const apiBlock = meta.lastBlockPulled;
    const web3: any = this.web3Service.web3;
    const currentBlock = (await web3.eth.getBlock('latest')).number;

    const ALLOWABLE_BLOCK_DIFFERENCE = 6;
    const blockDiff = currentBlock - apiBlock;

    const isSynchronized: boolean = blockDiff <= ALLOWABLE_BLOCK_DIFFERENCE;
    return isSynchronized;
  }

  /** Get collateral.
   * @param loanId Loan ID
   * @return Collateral
   */
  async getCollateralByLoan(loanId: string) {
    const apiUrl: string = this.getApiUrl();
    const data: any = await this.http.get(apiUrl.concat(`collaterals?debt_id=${ loanId }`)).toPromise();

    try {
      const collaterals: Collateral[] = this.getAllCompleteCollaterals(data.content as CollateralApi[]);
      return collaterals;
    } catch (err) {
      return [];
    }
  }

  /**
   * Each and call urls
   * @param urls URL array
   * @return URL call response
   */
  private async getAllUrls(urls: any[]) {
    // TODO: use http client module
    try {
      const data = await Promise.all(
        urls.map(
          url =>
            fetch(url).then(
              (response) => response.json()
            )));

      return (data);
    } catch (err) {
      this.eventsService.trackError(err);
      throw (err);
    }
  }

  /**
   * Parse loans data obtained from API and set loan models
   * @param apiLoans Loans data obtained from API
   * @return Loans array
   */
  private async getAllCompleteLoans(apiLoans: any[]) {
    try {
      const loans = await Promise.all(
        apiLoans.map(
          loan => this.completeLoanModels(loan)
        )
      );
      return (loans);

    } catch (err) {
      this.eventsService.trackError(err);
      throw (err);
    }
  }

  /**
   * Create collateral models
   * @param apiCollaterals Raw collaterals
   */
  private getAllCompleteCollaterals(apiCollaterals: CollateralApi[]): Collateral[] {
    const collaterals: Collateral[] = [];

    apiCollaterals.map((apiCollateral: CollateralApi) => {
      const { id, debt_id, oracle, token, amount, liquidation_ratio, balance_ratio, status } = apiCollateral;
      const collateral: Collateral = new Collateral(
        id as any,
        debt_id,
        oracle,
        token,
        amount,
        liquidation_ratio,
        balance_ratio,
        Number(status)
      );

      collaterals.push(collateral);
    });

    return collaterals;
  }

  /**
   * Handle api loan response loading models
   * @param responses Api responses
   * @return Loans array
   */
  private async getAllApiLoans(responses: any[]) {
    try {
      const activeLoans = await Promise.all(
        responses.map(
          response => this.getAllCompleteLoans(response.content as LoanApiDiaspore[])
        )
      );
      return (activeLoans);
    } catch (err) {
      this.eventsService.trackError(err);
      throw (err);
    }
  }

  /**
   * Handle api collateral response loading models
   * @param responses Api responses
   * @return Collaterals array
   */
  private async getAllApiCollaterals(responses: any[]): Promise<Collateral[]> {
    try {
      const apiCollaterals = await Promise.all(
        responses.map(
          response => this.getAllCompleteCollaterals(
            response.content as CollateralApi[]
          )
        )
      );
      const flatCollaterals: Collateral[] = [].concat.apply([], apiCollaterals);
      return (flatCollaterals);
    } catch (err) {
      this.eventsService.trackError(err);
      throw (err);
    }
  }

  /**
   * Get loans with the model prepared for the dapp.
   * @param loan Loan data obtained from API
   * @return Loan
   */
  private async completeLoanModels(loan: any): Promise<Loan> {
    let debtInfo: any;
    let config: any;

    if (!loan.open && !loan.canceled && loan.status) {
      debtInfo = await this.getModelDebtInfo(loan.id);
      config = await this.getModelConfig(loan.id);
    }

    return LoanUtils.createDiasporeLoan(
      loan as LoanApiDiaspore,
      debtInfo,
      config
    );
  }

  /**
   * Get diaspore loans model debt info if exists
   * @param loanId Loan ID
   * @return Model debt info obtained from API
   */
  private async getModelDebtInfo(loanId: string) {
    const diasporeApi = this.getApiUrl();
    const { content }: any = await this.http.get(diasporeApi.concat(`model_debt_info/${ loanId }`)).toPromise();
    return content;
  }

  /**
   * Get diaspore loans model configs
   * @param loanId Loan ID
   * @return Config obtained from API
   */
  private async getModelConfig(loanId: string) {
    const diasporeApi = this.getApiUrl();
    const { content }: any = await this.http.get(diasporeApi.concat(`configs/${ loanId }`)).toPromise();
    return content.data;
  }

  /**
   * Return the api url according to the chosen network
   * @param diasporeVersion API version
   * @return Api url
   */
  private getApiUrl(diasporeVersion?: 'v4' | 'v5') {
    return environment.rcnApi.diaspore[diasporeVersion || 'v4'];
  }

  /**
   * Exclude loans with the selected status
   * @param filterStatus Status array to remove
   * @param apiLoans Loans data obtained from API
   * @param loans Loans array
   * @return Loans data obtained from API or Loans array excluding selected states
   */
  private excludeLoansWithStatus(
    filterStatus: Status[],
    apiLoans?: any[],
    loans?: Loan[]
  ): Loan[] | any[] {
    if (apiLoans) {
      apiLoans.map(response => {
        response.content = response.content.filter(
          ({ status }) => {
            if (!filterStatus.includes(Number(status))) {
              return true;
            }
          }
        );
      });
      return apiLoans as any[];
    }

    if (loans) {
      return loans.filter(({ status }) => {
        if (!filterStatus.includes(status)) {
          return true;
        }
      }) as Loan[];
    }
  }
}
