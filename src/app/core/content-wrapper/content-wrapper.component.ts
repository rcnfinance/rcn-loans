import { Component, OnInit, HostListener } from '@angular/core';
import { Router, NavigationEnd, Event } from '@angular/router';
import { MatDialog } from '@angular/material';
import { Loan } from 'app/models/loan.model';
import { Status } from 'app/models/collateral.model';
import { LoanContentApi } from 'app/interfaces/loan-api-diaspore';
import { LoanUtils } from 'app/utils/loan-utils';
import { DialogWrongCountryComponent } from 'app/dialogs/dialog-wrong-country/dialog-wrong-country.component';
import { DialogNeedWithdrawComponent } from 'app/dialogs/dialog-need-withdraw/dialog-need-withdraw.component';
import { ProxyApiService } from 'app/services/proxy-api.service';
import { ApplicationAdsService } from 'app/services/application-ads.service';
import { Web3Service } from 'app/services/web3.service';
import { ChainService } from 'app/services/chain.service';
import { CountriesService } from 'app/services/countries.service';

@Component({
  selector: 'app-content-wrapper',
  templateUrl: './content-wrapper.component.html',
  styleUrls: ['./content-wrapper.component.scss']
})
export class ContentWrapperComponent implements OnInit {
  get hasAccount(): boolean {
    return this.account !== undefined;
  }
  isHome: boolean;
  winHeight: number = window.innerHeight;
  account: string;
  lendEnabled: Boolean;
  showAd: string;
  needWithdraw: boolean;

  constructor(
    public dialog: MatDialog,
    private router: Router,
    private proxyApiService: ProxyApiService,
    private applicationAdsService: ApplicationAdsService,
    private web3Service: Web3Service,
    private chainService: ChainService,
    private countriesService: CountriesService
  ) {}

  async ngOnInit() {
    // Navbar toggled
    this.applicationAdsService.currentAd.subscribe(showAd => this.showAd = showAd);
    this.web3Service.loginEvent.subscribe(
      async (isLogged: boolean) => {
        if (isLogged) {
          await this.loadAccount();
          this.checkPendingWithdraw();
        }
      }
    );
    await this.loadAccount();
    this.checkPendingWithdraw();
    this.canLend();
    this.listenRouterEvents();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.winHeight = event.target.innerHeight;
  }

  /**
   * Check if the user's country is available
   */
  async canLend() {
    this.lendEnabled = await this.countriesService.lendEnabled();
    if (!this.lendEnabled) {
      this.dialog.open(DialogWrongCountryComponent);
      return;
    }
  }

  /**
   * Load user account
   */
  async loadAccount() {
    if (!this.hasAccount) {
      this.account = await this.web3Service.getAccount();
    }
  }

  /**
   * Check if the user has pending collateral withdraws
   */
  private async checkPendingWithdraw() {
    const account: string = this.account;
    if (!account) {
      return;
    }
    if (this.needWithdraw) {
      return;
    }

    const { config } = this.chainService;
    const { content } = await this.proxyApiService.getLent(account);
    const loans: Loan[] = content.map((loanData: LoanContentApi) => LoanUtils.buildLoan(loanData, config));
    const loansToWithdraw: Loan[] =
      loans.filter(({ collateral }) => collateral && collateral.status === Status.ToWithdraw);

    if (loansToWithdraw.length) {
      this.needWithdraw = true;
      this.dialog.open(DialogNeedWithdrawComponent, {
        data: {
          loans: loansToWithdraw
        }
      });
    }
  }

  /**
   * Track all router changes
   */
  private listenRouterEvents() {
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        const { url } = event;
        this.isHome = url === '/';
      }
    });
  }
}
