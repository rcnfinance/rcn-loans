import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Loan, Network, Oracle, Descriptor, Debt, Model, Status } from '../models/loan.model';
import { Utils } from '../utils/utils';
import { LoanUtils } from '../utils/loan-utils';
import { Web3Service } from './web3.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  installmentModelAddress = '0x2B1d585520634b4c7aAbD54D73D34333FfFe5c53';
  diasporeUrl = environment.rcn_node_api.diasporeUrl;
  basaltUrl = environment.rcn_node_api.basaltUrl;

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
      const data: any = await this.http.get(apiUrl.concat('loans?open=false&page=' + page + '&lender=' + lender)).toPromise();
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
      const url = apiUrl.concat('loans?open=false&page=' + page + '&lender=' + lender);
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

      const data: any = await this.http.get(apiUrl.concat('loans?open=false&page=' + page)).toPromise();
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
      const url = apiUrl.concat('loans?open=false&page=' + page);
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
    const data: any = await this.http.get(apiUrl.concat(`loans/${id}`)).toPromise();
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

  async getAllApiLoans(responses: any[], network: Network) {
    try {
      const activeLoans = await Promise.all(
        responses.map(
          response => this.getAllCompleteLoans(response.content, network)
        ));

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
   * @return Loan
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
        `loans?open=true&canceled=false&approved=true&page=${ page }&${ filterExpiration }=${ now }`
      )).toPromise();
      // FIXME: hardcoded
      if (network === Network.Basalt) { data.meta.resource_count = 700; }

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
        `loans?open=true&canceled=false&approved=true&page=${ page }&${ filterExpiration }=${ now }`
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

  async completeLoanModels(
    loan: any,
    network: Network
  ): Promise<Loan> {
    const apiUrl: string = this.getApiUrl(network);
    const engine = environment.contracts.diaspore.loanManager;

    let oracle: Oracle;
    if (loan.oracle !== Utils.address0x) {
      const currency = loan.currency ? Utils.hexToAscii(loan.currency.replace(/^[0x]+|[0]+$/g, '')) : '';
      oracle = new Oracle(
        network,
        loan.oracle,
        currency,
        loan.currency
      );
    } else {
      oracle = new Oracle(
        network,
        loan.oracle,
        'RCN',
        loan.currency
      );
    }

    let descriptor: Descriptor;
    let debt: Debt;

    switch (network) {
      case Network.Basalt:
        return LoanUtils.createBasaltLoan(loan);

      case Network.Diaspore:
        descriptor = new Descriptor(
          Network.Diaspore,
          Number(loan.descriptor.first_obligation),
          Number(loan.descriptor.total_obligation),
          Number(loan.descriptor.duration),
          Number(loan.descriptor.interest_rate),
          LoanUtils.decodeInterest(
            Number(loan.descriptor.punitive_interest_rate)
          ),
          Number(loan.descriptor.frequency),
          Number(loan.descriptor.installments)
        );

        // set debt model
        if (!loan.open && !loan.canceled && loan.status) {
          const data: any = await this.http.get(apiUrl.concat(`model_debt_info/${loan.id}`)).toPromise();
          const paid = data.paid;
          const dueTime = data.due_time;
          const estimatedObligation = data.estimated_obligation;
          const nextObligation = data.next_obligation;
          const currentObligation = data.current_obligation;
          const debtBalance = data.debt_balance;
          const owner = data.owner;
          debt = new Debt(
            Network.Diaspore,
            loan.id,
            new Model(
              Network.Diaspore,
              loan.model,
              paid,
              nextObligation,
              currentObligation,
              estimatedObligation,
              dueTime
            ),
            debtBalance,
            engine,
            owner,
            oracle
          );
        }
        const status = loan.canceled ? Status.Destroyed : Number(loan.status);

        return new Loan(
          network,
          loan.id,
          engine,
          Number(loan.amount),
          oracle,
          descriptor,
          loan.borrower,
          loan.creator,
          status,
          Number(loan.expiration),
          loan.model,
          loan.cosigner,
          debt
        );

      default:
        break;
    }
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
