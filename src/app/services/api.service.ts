import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { aggregate } from '@makerdao/multicall';
import { environment } from '../../environments/environment';
import { LoanApiDiaspore } from './../interfaces/loan-api-diaspore';
import { LoanApiBasalt } from './../interfaces/loan-api-basalt';
import { Loan, Network, Status } from '../models/loan.model';
import { LoanUtils } from '../utils/loan-utils';
import { Utils } from '../utils/utils';
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
   * @param now Timestamp
   * @param network Selected network
   * @return Loans array
   */
  async getRequests(
    now: number,
    network: Network
  ): Promise<Loan[]> {
    const apiUrl: string = this.getApiUrl(network);
    const filterExpiration: string = this.getApiFilterKey('expiration', network);
    let allRequestLoans: Loan[] = [];
    let apiCalls = 0;
    let page = 0;

    try {
      const data: any = await this.http.get(apiUrl.concat(
        `loans?open=true&canceled=false&approved=true&status=0&page=${ page }&${ filterExpiration }=${ now }`
      )).toPromise();

      if (page === 0) {
        apiCalls = Math.ceil(data.meta.resource_count / data.meta.page_size);
      }

      const filterStatus = [Status.Destroyed, Status.Expired];
      const loansRequests = await this.getAllCompleteLoans(
        data.content as LoanApiBasalt[] | LoanApiDiaspore[],
        network
      );
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
      const url = apiUrl.concat(
        `loans?open=true&canceled=false&approved=true&status=0&page=${ page }&${ filterExpiration }=${ now }`
      );
      urls.push(url);
    }
    const responses = await this.getAllUrls(urls);

    for (const response of responses) {
      const filterStatus = [Status.Destroyed, Status.Expired];
      const loansRequests = await this.getAllCompleteLoans(response.content, network);
      const notExpiredResquestLoans = this.excludeLoansWithStatus(
        filterStatus,
        null,
        loansRequests
      );

      allRequestLoans = allRequestLoans.concat(notExpiredResquestLoans);
    }

    // TODO: remove specific creator filter
    const FILTER_DCL_KEY = 'creator';
    const FILTER_DCL_VALUE = environment.contracts.decentraland.mortgageCreator;
    allRequestLoans = this.excludeLoansWithKey(FILTER_DCL_KEY, FILTER_DCL_VALUE, allRequestLoans);

    return allRequestLoans;
  }

  /**
   * Get all loans lent by the account that is logged in
   * @param lender Lender address
   * @param network Selected network
   * @return Loans array
   */
  async getLoansOfLender(
    lender: string,
    network: Network
  ): Promise<Loan[]> {
    const web3 = this.web3Service.web3;
    const apiUrl: string = this.getApiUrl(network);
    let allLoansOfLender: Loan[] = [];
    let apiCalls = 0;
    let page = 0;

    try {
      lender = web3.utils.toChecksumAddress(lender);
      const data: any = await this.http.get(
        apiUrl.concat(`loans?open=false&page=${ page }&lender=${ lender }`)
      ).toPromise();

      if (page === 0) {
        apiCalls = Math.ceil(data.meta.resource_count / data.meta.page_size);
      }

      const activeLoans = await this.getAllCompleteLoans(data.content, network);
      allLoansOfLender = allLoansOfLender.concat(activeLoans);
      page++;
    } catch (err) {
      this.eventsService.trackError(err);
    }

    const urls = [];
    for (page; page < apiCalls; page++) {
      const url = apiUrl.concat(`loans?open=false&page=${ page }&lender=${ lender }`);
      urls.push(url);
    }
    const responses = await this.getAllUrls(urls);
    const allApiLoans = await this.getAllApiLoans(responses, network);

    for (const apiLoans of allApiLoans) {
      allLoansOfLender = allLoansOfLender.concat(apiLoans);
    }

    return allLoansOfLender;
  }

  /**
   * Gets all loans that were lent and there status is ongoing. Meaning that they are not canceled or finished.
   * @param network Selected network
   * @return Loans array
   */
  async getActiveLoans(network: Network): Promise<Loan[]> {
    const apiUrl: string = this.getApiUrl(network);
    let allActiveLoans: Loan[] = [];
    let apiCalls = 0;
    let page = 0;

    try {
      const data: any = await this.http.get(apiUrl.concat(`loans?open=false&canceled=false&approved=true&page=${ page }`)).toPromise();
      if (page === 0) {
        apiCalls = Math.ceil(data.meta.resource_count / data.meta.page_size);
      }

      let activeLoans = await this.getAllCompleteLoans(
        data.content as LoanApiBasalt[] | LoanApiDiaspore[],
        network
      );
      if (network === Network.Basalt) {
        const filterStatus = [Status.Request, Status.Destroyed, Status.Expired];
        activeLoans = this.excludeLoansWithStatus(filterStatus, null, activeLoans);
      }

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

    let responses = await this.getAllUrls(urls);

    if (network === Network.Basalt) {
      const filterStatus = [Status.Request, Status.Destroyed, Status.Expired];
      responses = this.excludeLoansWithStatus(filterStatus, responses);
    }

    const allApiLoans = await this.getAllApiLoans(responses, network);

    for (const apiLoans of allApiLoans) {
      allActiveLoans = allActiveLoans.concat(apiLoans);
    }

    return allActiveLoans;
  }

  /**
   * Gets all loans that were lent and there status is ongoing. Meaning that they are not canceled or finished.
   * @param network Selected network
   * @param page Page
   * @param pageSize Items per page
   * @return Loans array
   */
  async getPaginatedActiveLoans(network: Network, page = 0, pageSize = 20): Promise<Loan[]> {
    const apiUrl: string = this.getApiUrl(network);
    let allActiveLoans: Loan[] = [];
    let apiCalls = 0;

    try {
      const data: any = await this.http.get(
        apiUrl.concat(`loans?open=false&canceled=false&approved=true&page_size=${ pageSize }&page=${ page }`)
      ).toPromise();
      apiCalls = Math.ceil(data.meta.resource_count / data.meta.page_size);

      if (page > apiCalls) {
        return [];
      }

      let activeLoans = await this.getAllCompleteLoans(data.content, network);
      if (network === Network.Basalt) {
        const filterStatus = [Status.Request, Status.Destroyed, Status.Expired];
        activeLoans = this.excludeLoansWithStatus(filterStatus, null, activeLoans);
      }

      allActiveLoans = allActiveLoans.concat(activeLoans);

      return allActiveLoans;
    } catch (err) {
      this.eventsService.trackError(err);
    }
  }

  /**
   * Gets loan by ID
   * @param network Selected network
   * @return Loan
   */
  async getLoan(
    id: string,
    network: Network
  ): Promise<Loan> {
    const apiUrl: string = this.getApiUrl(network);
    const data: any = await this.http.get(apiUrl.concat(`loans/${ id }`)).toPromise();
    let apiLoan: any = data.content;

    if (network === Network.Basalt) {
      apiLoan = (await this.getMulticallData([apiLoan]))[0];
    }

    const loan = await this.completeLoanModels(apiLoan, network);
    try {
      return loan;
    } catch {
      console.info('loan does not exist');
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
   * @param network Selected network
   * @return Loans array
   */
  private async getAllCompleteLoans(apiLoans: any[], network: Network) {
    try {
      if (network === Network.Basalt) {
        apiLoans = await this.getMulticallData(apiLoans);
      }
      const loans = await Promise.all(
        apiLoans.map(
          loan => this.completeLoanModels(loan, network)
        )
      );
      return (loans);

    } catch (err) {
      this.eventsService.trackError(err);
      throw (err);
    }
  }

  /**
   * Check basalt loans and complete information not provided by the api
   * @param apiLoans Loans data obtained from API
   * @return API Loans with information completed
   */
  private async getMulticallData(apiLoans: LoanApiBasalt[]) {
    const query = [];
    const target: string = environment.contracts.basaltEngine;
    const SEPARATOR = '--';
    const filterKeys = {
      'interest': {
        method: 'getInterest(uint256)(uint256)',
        handler: (hexValue) => parseInt(hexValue, 16)
      },
      'interest_rate': {
        method: 'getInterestRate(uint256)(uint256)',
        handler: (hexValue) => parseInt(hexValue, 16)
      },
      'punitory_interest': {
        method: 'getPunitoryInterest(uint256)(uint256)',
        handler: (hexValue) => parseInt(hexValue, 16)
      },
      'interest_timestamp': {
        method: 'getInterestTimestamp(uint256)(uint256)',
        handler: (hexValue) => parseInt(hexValue, 16)
      },
      'cosigner': {
        method: 'getCosigner(uint256)(uint256)',
        handler: (hexValue) => hexValue
      }
    };

    apiLoans.map((loan: LoanApiBasalt) => {
      Object.keys(filterKeys).map(key => {
        if (
          !loan[key] ||
          loan[key] === '0' ||
          loan[key] === Utils.address0x
        ) {
          query.push({
            target,
            call: [
              filterKeys[key].method,
              loan.index
            ],
            returns: [
              [`${ key + SEPARATOR + loan.index }`]
            ]
          });
        }
      });
    });

    if (!query.length) {
      return apiLoans;
    }

    try {
      const call = await aggregate(query, this.multicallConfig);
      const callResults = {};

      Object.keys(filterKeys).map(key => {
        callResults[key] = {};
      });
      Object.keys(call.results).map(item => {
        const splitItem: string[] = item.split(SEPARATOR);
        const itemKey: string = splitItem[0];
        const itemId: string = splitItem[1];
        const hexValue: string = call.results[item]._hex;
        if (callResults[itemKey]) {
          callResults[itemKey][itemId] = filterKeys[itemKey].handler(hexValue);
        }
      });
      apiLoans.map((loan: LoanApiBasalt) => {
        const id: number = Number(loan.index);
        Object.keys(callResults).map(key => {
          if (callResults[key][id]) {
            loan[key] = callResults[key][id];
          }
        });
      });
    } catch (err) {
      this.eventsService.trackError(err);
    } finally {
      return apiLoans;
    }
  }

  /**
   * Handle api loan response loading models
   * @param responses Api responses
   * @param network Selected network
   * @return Loans array
   */
  private async getAllApiLoans(responses: any[], network: Network) {
    try {
      const activeLoans = await Promise.all(
        responses.map(
          response => this.getAllCompleteLoans(
            response.content as LoanApiBasalt[] | LoanApiDiaspore[],
            network
          )
        )
      );
      return (activeLoans);
    } catch (err) {
      this.eventsService.trackError(err);
      throw (err);
    }
  }

  /**
   * Get loans with the model prepared for the dapp.
   * @param loan Loan data obtained from API
   * @param network Selected network
   * @return Loan
   */
  private async completeLoanModels(
    loan: any,
    network: Network
  ): Promise<Loan> {
    switch (network) {
      case Network.Basalt:
        return LoanUtils.createBasaltLoan(loan as LoanApiBasalt);

      case Network.Diaspore:
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

      default:
        break;
    }
  }

  /**
   * Get diaspore loans model debt info if exists
   * @param loan Loan data obtained from API
   * @return Model debt info obtained from API
   */
  private async getModelDebtInfo(loanId: string) {
    const diasporeApi = this.getApiUrl(Network.Diaspore);
    return await this.http.get(diasporeApi.concat(`model_debt_info/${ loanId }`)).toPromise();
  }

  /**
   * Get diaspore loans model configs
   * @param loan Loan data obtained from API
   * @return Config obtained from API
   */
  private async getModelConfig(loanId: string) {
    const diasporeApi = this.getApiUrl(Network.Diaspore);
    const { content }: any = await this.http.get(diasporeApi.concat(`configs/${ loanId }`)).toPromise();
    return content.data;
  }

  /**
   * Return the api url according to the chosen network
   * @param network Selected network
   * @param diasporeVersion API version
   * @param basaltVersion API version
   * @return Api url
   */
  private getApiUrl(
    network: Network,
    diasporeVersion?: 'v4' | 'v5',
    basaltVersion?: 'v1'
  ) {
    switch (network) {
      case Network.Diaspore:
        return environment.rcnApi.diaspore[diasporeVersion || 'v4'];

      case Network.Basalt:
        return environment.rcnApi.basalt[basaltVersion || 'v1'];

      default:
        break;
    }
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

  /**
   * Exclude loans containing the key / value
   * @param key Key to filter
   * @param value Value to filter
   * @param loans Loans array
   * @return Loans array excluding those containing the key/value
   */
  private excludeLoansWithKey(
    key: string,
    value: string,
    loans: Loan[]
  ): Loan[] | any[] {
    return loans.filter((loan: Loan) => !loan[key] || loan[key] !== value) as Loan[];
  }

  /**
   * Return the api filter key according to the chosen network
   * @param network Selected network
   * @return Api filter key
   */
  private getApiFilterKey(filter: string, network: Network) {
    const filters = {
      [Network.Diaspore]: {
        expiration: 'expiration__gt'
      },
      [Network.Basalt]: {
        expiration: 'expiration_requests__gt'
      }
    };

    return filters[network][filter];
  }

}
