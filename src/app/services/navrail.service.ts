import { Injectable, EventEmitter } from '@angular/core';
import { Web3Service } from 'app/services/web3.service';
import { ChainService } from 'app/services/chain.service';
import { ProxyApiService } from 'app/services/proxy-api.service';
import { LoanUtils } from 'app/utils/loan-utils';
import { LoanContentApi } from 'app/interfaces/loan-api-diaspore';
import { Loan, Status } from 'app/models/loan.model';

@Injectable({
  providedIn: 'root'
})
export class NavrailService {
  refreshNavrailEvent = new EventEmitter<boolean>();
  private bulletMyLoans: boolean;

  constructor(
    private web3Service: Web3Service,
    private chainService: ChainService,
    private proxyApiService: ProxyApiService
  ) { }

  /**
   * Show bullet on 'My loans' navrail button
   * @return Show or not
   */
  get showBulletMyLoans(): boolean {
    return this.bulletMyLoans;
  }

  /**
   * Show bullet on 'My loans' navrail button
   * @param show Show or not
   */
  set showBulletMyLoans(show: boolean) {
    this.bulletMyLoans = show;
  }

  /**
   * Emit refreshNavrailEvent
   * @fires refreshNavrailEvent
   */
  async refreshNavrail() {
    await this.checkMyLoansBullet();
    this.refreshNavrailEvent.emit(true);
  }

  /**
   * Check if 'My Loans' button requires a bullet
   */
  private async checkMyLoansBullet() {
    const address = await this.web3Service.getAccount();
    const PAGE = 1;
    const PAGE_SIZE = 100;
    const { content } = await this.proxyApiService.getBorrowed(address, PAGE, PAGE_SIZE, {});
    const { config } = this.chainService;
    const loans: Loan[] = content.map((loanData: LoanContentApi) => LoanUtils.buildLoan(loanData, config));
    const pendingCollateralLoans = loans.filter(({ status, collateral }) => status === Status.Request && !collateral);
    this.showBulletMyLoans = pendingCollateralLoans.length >= 1;
  }
}
