import { Component, OnInit, HostListener } from '@angular/core';
import { Router, NavigationEnd, Event } from '@angular/router';
import { MatDialog } from '@angular/material';
import * as BN from 'bn.js';
import { Utils } from 'app/utils/utils';
import { Loan, Engine } from 'app/models/loan.model';
import { Status } from 'app/models/collateral.model';
import { LoanContentApi } from 'app/interfaces/loan-api-diaspore';
import { LoanUtils } from 'app/utils/loan-utils';
import { DialogWrongCountryComponent } from 'app/dialogs/dialog-wrong-country/dialog-wrong-country.component';
import { DialogNeedWithdrawComponent } from 'app/dialogs/dialog-need-withdraw/dialog-need-withdraw.component';
import { environment } from 'app/../environments/environment';
import { ProxyApiService } from 'app/services/proxy-api.service';
import { SidebarService } from 'app/services/sidebar.service';
import { ApplicationAdsService } from 'app/services/application-ads.service';
import { Web3Service } from 'app/services/web3.service';
import { ContractsService } from 'app/services/contracts.service';
import { Tx, TxService } from 'app/services/tx.service';
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
  get balance(): string {
    if (this.rcnBalance === undefined) {
      return '...';
    }
    return Utils.removeTrailingZeros(String(this.rcnBalance));
  }
  get available(): string {
    if (this.rcnAvailable === undefined) {
      return '...';
    }
    return Utils.removeTrailingZeros(String(this.rcnAvailable.div(this.ethWei)));
  }
  get withdrawEnabled(): boolean {
    return this.diasporeLoansWithBalance !== undefined &&
      this.diasporeLoansWithBalance.length > 0 &&
      this.pendingRcnWithdraw === undefined;
  }
  isHome: boolean;
  winHeight: number = window.innerHeight;
  account: string;
  version: string = environment.version;
  lendEnabled: Boolean;

  private ethWei = Utils.bn(10).pow(Utils.bn(18));
  rcnBalance: BN;
  rcnAvailable: BN;
  loansWithBalance: number[];
  diasporeLoansWithBalance: number[];
  pendingRcnWithdraw: Tx;

  navToggle: boolean; // Navbar toggled
  navmobileToggled = false; // Nav Mobile toggled
  showAd: string;

  pendingWithdraw: Tx;
  needWithdraw: boolean;

  constructor(
    private router: Router,
    private proxyApiService: ProxyApiService,
    private sidebarService: SidebarService, // Navbar Service
    private applicationAdsService: ApplicationAdsService,
    private web3Service: Web3Service,
    private chainService: ChainService,
    private contractService: ContractsService,
    private txService: TxService,
    public dialog: MatDialog,
    private countriesService: CountriesService
  ) {}

  async ngOnInit() {
    // Navbar toggled
    this.sidebarService.currentToggle.subscribe(navToggle => this.navToggle = navToggle);
    this.sidebarService.currentNavmobile.subscribe(navmobileToggled => this.navmobileToggled = navmobileToggled);
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
   * Toggle Navbar
   */
  sidebarToggle() {
    this.sidebarService.toggleService(this.navToggle = !this.navToggle);
  }

  /**
   * Toggle Sidebar Class
   */
  onClose() {
    this.sidebarService.toggleService(this.navToggle = false);
  }

  /**
   * Method called when sidenav is opened
   */
  onOpen() {
    this.sidebarService.toggleService(this.navToggle = true);
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
      this.loadRcnBalance();
      this.loadWithdrawBalance();
    }
  }

  /**
   * Load all pending withdraw
   */
  private loadPendingWithdraw() {
    const { config } = this.chainService;
    this.pendingRcnWithdraw = this.txService.getLastWithdraw(
      config.contracts[Engine.RcnEngine].diaspore.debtEngine,
      this.diasporeLoansWithBalance
    );
  }

  /**
   * Load rcn balance
   */
  private async loadRcnBalance() {
    const balance: number = await this.contractService.getUserBalanceRCN();
    this.rcnBalance = Utils.bn(balance);
  }

  /**
   * Load withdraw balance adding diaspore amount
   */
  private async loadWithdrawBalance() {
    const pendingWithdraws = await this.contractService.getPendingWithdraws(Engine.RcnEngine);
    this.rcnAvailable = Utils.bn(pendingWithdraws[2] / 10 ** 18);
    this.diasporeLoansWithBalance = pendingWithdraws[3];
    this.loadPendingWithdraw();
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
