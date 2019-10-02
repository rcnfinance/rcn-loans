import BigNumber from 'bignumber.js';
import { Component, OnInit, HostListener } from '@angular/core';
import { MatDialog } from '@angular/material';
// App Components
import { DialogClientAccountComponent } from '../../dialogs/dialog-client-account/dialog-client-account.component';
import { DialogWrongCountryComponent } from '../../dialogs/dialog-wrong-country/dialog-wrong-country.component';
// App Service
import { environment } from '../../../environments/environment';
import { SidebarService } from '../../services/sidebar.service';
import { Web3Service } from '../../services/web3.service';
import { ContractsService } from '../../services/contracts.service';
import { Tx, TxService } from '../../tx.service';
import { CountriesService } from '../../services/countries.service';

@Component({
  selector: 'app-content-wrapper',
  templateUrl: './content-wrapper.component.html',
  styleUrls: ['./content-wrapper.component.scss']
})
export class ContentWrapperComponent implements OnInit {
  // Get Balance
  get hasAccount(): boolean {
    return this.account !== undefined;
  }
  get balance(): string {
    if (this.rcnBalance === undefined) {
      return '...';
    }
    return this.removeTrailingZeros(this.rcnBalance.toFixed(18));
  }
  get available(): string {
    if (this.rcnAvailable === undefined) {
      return '...';
    }
    return this.removeTrailingZeros((this.rcnAvailable / this.ethWei).toFixed(18));
  }
  get withdrawEnabled(): boolean {
    return this.basaltLoansWithBalance !== undefined || this.diasporeLoansWithBalance !== undefined &&
    this.basaltLoansWithBalance.length > 0 || this.diasporeLoansWithBalance.length > 0 &&
    this.pendingBasaltWithdraw === undefined || this.pendingDiasporeWithdraw === undefined;
  }
  winHeight: number = window.innerHeight;
  events: string[] = [];
  account: string;
  version: string = environment.version;
  lender: string;
  lendEnabled: Boolean;

  private ethWei = new BigNumber(10).pow(new BigNumber(18));
  rcnBalance: BigNumber;
  rcnAvailable: BigNumber;
  loansWithBalance: number[];

  private basaltRcnAvailable: number;
  private diasporeRcnAvailable: number;

  basaltLoansWithBalance: number[];
  diasporeLoansWithBalance: number[];
  pendingBasaltWithdraw: Tx;
  pendingDiasporeWithdraw: Tx;

  autoClose: boolean;
  isApproved: boolean;

  navToggle: boolean; // Navbar toggled
  navmobileToggled = false; // Nav Mobile toggled

  pendingWithdraw: Tx;

  constructor(
    private sidebarService: SidebarService, // Navbar Service
    private web3Service: Web3Service,
    private contractService: ContractsService,
    private txService: TxService,
    public dialog: MatDialog,
    private countriesService: CountriesService
  ) {}

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.winHeight = event.target.innerHeight;
  }

  // Toggle Navbar
  sidebarToggle() {
    this.sidebarService.toggleService(this.navToggle = !this.navToggle);
  }
  // Toggle Sidebar Class
  onClose() {
    this.sidebarService.toggleService(this.navToggle = false);
  }

  // Open Client Dialog
  async openDialogClient() {
    if (await this.web3Service.requestLogin()) {
      return;
    }

    this.dialog.open(DialogClientAccountComponent, {});
  }

  onOpen() {
    this.sidebarService.toggleService(this.navToggle = true);
  }

  async clickWithdraw() {
    if (!this.withdrawEnabled) {
      window.open(environment.network.explorer.tx.replace('${tx}', this.pendingWithdraw.tx));
    } else {
      if (this.basaltLoansWithBalance.length > 0) {
        const tx = await this.contractService.withdrawFundsBasalt(this.basaltLoansWithBalance);
        this.txService.registerWithdrawTx(tx, environment.contracts.basaltEngine, this.basaltLoansWithBalance);
      }
      if (this.diasporeLoansWithBalance.length > 0) {
        const tx = await this.contractService.withdrawFundsDiaspore(this.diasporeLoansWithBalance);
        this.txService.registerWithdrawTx(tx, environment.contracts.diaspore.debtEngine, this.diasporeLoansWithBalance);
      }
      this.loadWithdrawBalance();
    }
  }

  ngOnInit() {
    // Navbar toggled
    this.sidebarService.currentToggle.subscribe(navToggle => this.navToggle = navToggle);
    this.sidebarService.currentNavmobile.subscribe(navmobileToggled => this.navmobileToggled = navmobileToggled);
    this.web3Service.loginEvent.subscribe(
      (isLogged) => {
        if (isLogged) {
          this.loadAccount();
        }
      }
    );
    this.loadAccount();
    this.canLend();
  }

  async canLend() {
    this.lendEnabled = await this.countriesService.lendEnabled();
    if (!this.lendEnabled) {
      this.dialog.open(DialogWrongCountryComponent);
      return;
    }
  }

  async loadAccount() {
    if (!this.hasAccount) {
      this.account = await this.web3Service.getAccount();
      this.loadLender();
      this.loadRcnBalance();
      this.loadWithdrawBalance();
    }
  }

  private removeTrailingZeros(value) {
    value = value.toString();
    if (value.indexOf('.') === -1) {
      return value;
    }
    while ((value.slice(-1) === '0' || value.slice(-1) === '.') && value.indexOf('.') !== -1) {
      value = value.substr(0, value.length - 1);
    }
    return value;
  }

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

  private async loadLender() {
    const lender: string = await this.web3Service.getAccount();
    this.lender = lender;
  }

  private async loadRcnBalance() {
    const balance: number = await this.contractService.getUserBalanceRCN();
    this.rcnBalance = balance;
  }

  private async loadWithdrawBalance() {
    const pendingWithdraws = await this.contractService.getPendingWithdraws();
    this.basaltRcnAvailable = pendingWithdraws[0] / 10 ** 18;
    this.diasporeRcnAvailable = pendingWithdraws[2] / 10 ** 18;
    this.rcnAvailable = this.basaltRcnAvailable + this.diasporeRcnAvailable;
    this.basaltLoansWithBalance = pendingWithdraws[1];
    this.diasporeLoansWithBalance = pendingWithdraws[3];
    this.loadPendingWithdraw();
  }
}
