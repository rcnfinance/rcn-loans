import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { aggregate } from '@makerdao/multicall';
import { environment } from '../../environments/environment';
import { Loan, Network, Status } from '../models/loan.model';
import { LoanUtils } from '../utils/loan-utils';
import { Web3Service } from './web3.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  installmentModelAddress = '0x2B1d585520634b4c7aAbD54D73D34333FfFe5c53';
  diasporeUrl = environment.rcn_node_api.diasporeUrl;
  basaltUrl = environment.rcn_node_api.basaltUrl;
  multicallConfig = {
    rpcUrl: environment.network.provider,
    multicallAddress: '0xA457b5B859573e8eB758B6C2BFD4aE3042B422FD'
  };

  constructor(
    private http: HttpClient,
    private web3Service: Web3Service
  ) { }

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
      lender = web3.toChecksumAddress(lender);
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
      console.info('Error', err);
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
      const activeLoans = await this.getAllCompleteLoans(data.content, network);
      allActiveLoans = allActiveLoans.concat(activeLoans);
      page++;
    } catch (err) {
      console.info('Error', err);
    }

    const urls = [];
    for (page; page < apiCalls; page++) {
      const url = apiUrl.concat(`loans?open=false&canceled=false&approved=true&page=${ page }`);
      urls.push(url);
    }

    const responses = await this.getAllUrls(urls);
    const allApiLoans = await this.getAllApiLoans(responses, network);

    for (const apiLoans of allApiLoans) {
      allActiveLoans = allActiveLoans.concat(apiLoans);
    }

    return allActiveLoans;
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
    const loan = await this.completeLoanModels(data.content, network);
    try {
      return loan;
    } catch {
      console.info('loan does not exist');
    }
  }

  async getAllUrls(urls: any[]) {
    try {
      const data = await Promise.all(
        urls.map(
          url =>
            fetch(url).then(
              (response) => response.json()
            )));

      return (data);
    } catch (error) {
      console.info(error);
      throw (error);
    }
  }

  async getAllCompleteLoans(apiLoans: any[], network: Network) {
    try {
      if (network === Network.Basalt && apiLoans.length) {
        const query = [];
        const target: string = environment.contracts.basaltEngine;

        apiLoans.map((loan: any) => {
          if (Number(loan.interest_rate) === 0) {
            query.push({
              target,
              call: [
                'getInterestRate(uint256)(uint256)',
                loan.index
              ],
              'returns': [
                [loan.index]
              ]
            });
            // TODO: add getInterestRate and getInterestRatePunitory calls
          }
        });

        if (query.length) {
          const call = await aggregate(query, this.multicallConfig);
          const interestRates = {};

          for (const id of Object.keys(call.results)) {
            const hexInterest: string = call.results[id]._hex;
            interestRates[id] = parseInt(hexInterest, 16);
          }

          apiLoans.map((loan: any) => {
            loan.interest_rate = interestRates[Number(loan.index)];
          });
        }
      }

      const loans = await Promise.all(
        apiLoans.map(
          loan => this.completeLoanModels(loan, network)
        )
      );
      return (loans);

    } catch (error) {
      console.info(error);
      throw (error);
    }
  }

  /**
   * Handle api loan response loading models
   * @param responses Api responses
   * @param network Selected network
   * @return Loans array
   */
  async getAllApiLoans(responses: any[], network: Network) {
    try {
      const activeLoans = await Promise.all(
        responses.map(
          response => this.getAllCompleteLoans(response.content, network)
        )
      );
      return (activeLoans);
    } catch (error) {
      console.info(error);
      throw (error);
    }
  }

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

      const loansRequests = await this.getAllCompleteLoans(data.content, network);
      const filteredLoans = loansRequests
        .filter(loan =>
          loan.model !== this.installmentModelAddress &&
          loan.status !== Status.Destroyed
        );

      allRequestLoans = allRequestLoans.concat(filteredLoans);
      page++;
    } catch (err) {
      console.info('Error', err);
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
      const loansRequests = await this.getAllCompleteLoans(response.content, network);
      const notExpiredResquestLoans = loansRequests.filter(loan => loan.model !== this.installmentModelAddress);
      allRequestLoans = allRequestLoans.concat(notExpiredResquestLoans);
    }

    return allRequestLoans;
  }

  /**
   * Get loans with the model prepared for the dapp.
   * @param loan Loan data obtained from API
   * @param network Selected network
   * @return Loan
   */
  async completeLoanModels(
    loan: any,
    network: Network
  ): Promise<Loan> {
    switch (network) {
      case Network.Basalt:
        return LoanUtils.createBasaltLoan(loan);

      case Network.Diaspore:
        let debtInfo: any;
        if (!loan.open && !loan.canceled && loan.status) {
          debtInfo = await this.getModelDebtInfo(loan.id);
        }
        return LoanUtils.createDiasporeLoan(loan, debtInfo);

      default:
        break;
    }
  }

  /**
   * Get model debt info if exists
   * @param loan Loan data obtained from API
   */
  async getModelDebtInfo(loanId: string) {
    const apiUrl = this.diasporeUrl;
    return await this.http.get(apiUrl.concat(`model_debt_info/${ loanId }`)).toPromise();
  }

  /**
   * Return the api url according to the chosen network
   * @param network Selected network
   * @return Api url
   */
  private getApiUrl(network: Network) {
    switch (network) {
      case Network.Basalt:
        return this.basaltUrl;

      case Network.Diaspore:
        return this.diasporeUrl;

      default:
        break;
    }
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
