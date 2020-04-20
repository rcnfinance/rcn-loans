import { Component, OnInit, HostListener } from '@angular/core';
import { MatDialog } from '@angular/material';
import * as BN from 'bn.js';
import { Utils } from '../../utils/utils';
import { Loan } from './../../models/loan.model';
import { Collateral, Status } from './../../models/collateral.model';
// App Components
import { DialogWrongCountryComponent } from '../../dialogs/dialog-wrong-country/dialog-wrong-country.component';
import { DialogNeedWithdrawComponent } from '../../dialogs/dialog-need-withdraw/dialog-need-withdraw.component';
// App Service
import { environment } from '../../../environments/environment';
import { SidebarService } from '../../services/sidebar.service';
import { Web3Service } from '../../services/web3.service';
import { ApiService } from '../../services/api.service';
import { ContractsService } from '../../services/contracts.service';
import { Tx, TxService } from '../../services/tx.service';
import { CountriesService } from '../../services/countries.service';

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
    return this.basaltLoansWithBalance !== undefined || this.diasporeLoansWithBalance !== undefined &&
    this.basaltLoansWithBalance.length > 0 || this.diasporeLoansWithBalance.length > 0 &&
    this.pendingBasaltWithdraw === undefined || this.pendingDiasporeWithdraw === undefined;
  }
  winHeight: number = window.innerHeight;
  account: string;
  version: string = environment.version;
  lendEnabled: Boolean;

  private ethWei = Utils.bn(10).pow(Utils.bn(18));
  rcnBalance: BN;
  rcnAvailable: BN;
  loansWithBalance: number[];

  private basaltRcnAvailable: number;
  private diasporeRcnAvailable: number;

  basaltLoansWithBalance: number[];
  diasporeLoansWithBalance: number[];
  pendingBasaltWithdraw: Tx;
  pendingDiasporeWithdraw: Tx;

  navToggle: boolean; // Navbar toggled
  navmobileToggled = false; // Nav Mobile toggled

  pendingWithdraw: Tx;
  needWithdraw: boolean;

  constructor(
    private sidebarService: SidebarService, // Navbar Service
    private web3Service: Web3Service,
    private apiService: ApiService,
    private contractService: ContractsService,
    private txService: TxService,
    public dialog: MatDialog,
    private countriesService: CountriesService
  ) {}

  async ngOnInit() {
    // Navbar toggled
    this.sidebarService.currentToggle.subscribe(navToggle => this.navToggle = navToggle);
    this.sidebarService.currentNavmobile.subscribe(navmobileToggled => this.navmobileToggled = navmobileToggled);
    this.web3Service.loginEvent.subscribe(
      async (isLogged) => {
        if (isLogged) {
          await this.loadAccount();
          this.checkPendingWithdraw();
        }
      }
    );
    await this.loadAccount();
    this.checkPendingWithdraw();
    this.canLend();
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
   * Handle click on withdraw
   */
  async clickWithdraw() {
    if (!this.withdrawEnabled) {
      window.open(environment.network.explorer.tx.replace(
        '${tx}',
        this.pendingWithdraw.tx
      ));
    } else {
      if (this.basaltLoansWithBalance.length > 0) {
        const tx = await this.contractService.withdrawFundsBasalt(
          this.basaltLoansWithBalance
        );
        this.txService.registerWithdrawTx(
          tx,
          environment.contracts.basaltEngine,
          this.basaltLoansWithBalance
        );
      }
      if (this.diasporeLoansWithBalance.length > 0) {
        const tx = await this.contractService.withdrawFundsDiaspore(
          this.diasporeLoansWithBalance
        );
        this.txService.registerWithdrawTx(
          tx,
          environment.contracts.diaspore.debtEngine,
          this.diasporeLoansWithBalance
        );
      }
      this.loadWithdrawBalance();
    }
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
    this.pendingBasaltWithdraw = this.txService.getLastWithdraw(
      environment.contracts.basaltEngine,
      this.basaltLoansWithBalance
    );
    this.pendingDiasporeWithdraw = this.txService.getLastWithdraw(
      environment.contracts.diaspore.debtEngine,
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
   * Load withdraw balance adding basalt and diaspore amounts
   */
  private async loadWithdrawBalance() {
    const pendingWithdraws = await this.contractService.getPendingWithdraws();
    this.basaltRcnAvailable = pendingWithdraws[0] / 10 ** 18;
    this.diasporeRcnAvailable = pendingWithdraws[2] / 10 ** 18;
    this.rcnAvailable = Utils.bn(this.basaltRcnAvailable).add(Utils.bn(this.diasporeRcnAvailable));
    this.basaltLoansWithBalance = pendingWithdraws[1];
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

    const loansToWithdraw: Loan[] =
      (await this.contractService.getLoansOfBorrower(account))
      .filter(({ collateral }) => collateral && collateral.status === Status.ToWithdraw);

    if (loansToWithdraw.length) {
      this.needWithdraw = true;
      this.dialog.open(DialogNeedWithdrawComponent, {
        data: {
          loans: loansToWithdraw
        }
      });
    }
  }
}
