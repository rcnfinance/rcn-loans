import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
// App Components
import { DialogClientAccountComponent } from '../dialogs/dialog-client-account/dialog-client-account.component';
// App Service
import { environment } from '../../environments/environment';
import { SidebarService } from '../services/sidebar.service';
import { Web3Service, Type } from '../services/web3.service';
import { ContractsService } from '../services/contracts.service';
import BigNumber from 'bignumber.js';
import { Tx, TxService } from '../tx.service';

@Component({
  selector: 'app-content-wrapper',
  templateUrl: './content-wrapper.component.html',
  styleUrls: ['./content-wrapper.component.scss']
})
export class ContentWrapperComponent implements OnInit {
  winHeight: any = window.innerHeight - 56;
  events: string[] = [];
  account: string;
  version: string = environment.version;
  lender: string;

  private ethWei = new BigNumber(10).pow(new BigNumber(18));
  rcnBalance: BigNumber;
  weiAvailable: BigNumber;
  loansWithBalance: number[];

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
  ) {}

  // Toggle Navbar
  sidebarToggle() {
    this.sidebarService.toggleService(this.navToggle = !this.navToggle);
  }
  // Toggle Sidebar Class
  onClose() {
    this.sidebarService.toggleService(this.navToggle = false);
  }

  // Open Client Dialog
  openDialogClient() {
    const dialogRef: MatDialogRef<DialogClientAccountComponent> = this.dialog.open(DialogClientAccountComponent, {});
  }

  onOpen() {
    this.sidebarService.toggleService(this.navToggle = true);
  }
  async clickWithdraw() {
    if (!this.withdrawEnabled) {
      window.open(environment.network.explorer.tx.replace('${tx}', this.pendingWithdraw.tx));
    } else {
      const tx = await this.contractService.withdrawFunds(this.loansWithBalance);
      this.txService.registerWithdrawTx(tx, environment.contracts.basaltEngine, this.loansWithBalance);
      this.loadPendingWithdraw();
    }
  }
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
    if (this.weiAvailable === undefined) {
      return '...';
    }
    return this.removeTrailingZeros((this.weiAvailable / this.ethWei).toFixed(18));
  }
  get withdrawEnabled(): boolean {
    return this.loansWithBalance !== undefined
      && this.loansWithBalance.length !== 0
      && this.pendingWithdraw === undefined;
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
    this.pendingWithdraw = this.txService.getLastWithdraw(environment.contracts.basaltEngine, this.loansWithBalance);
  }
  private loadLender() {
    this.web3Service.getAccount().then((resolve: string) => {
      this.lender = resolve;
    });
  }
  private loadRcnBalance() {
    this.contractService.getUserBalanceRCN().then((balance: number) => {
      this.rcnBalance = balance;
    });
  }
  private loadWithdrawBalance() {
    this.contractService.getPendingWithdraws().then((result: [number, number[]]) => {
      this.weiAvailable = result[0];
      this.loansWithBalance = result[1];
      this.loadPendingWithdraw();
    });
  }
  ngOnInit() {
     // Navbar toggled
    this.sidebarService.currentToggle.subscribe(navToggle => this.navToggle = navToggle);
    this.sidebarService.currentNavmobile.subscribe(navmobileToggled => this.navmobileToggled = navmobileToggled);

    this.loadLender();
    this.loadRcnBalance();
    this.loadWithdrawBalance();
    this.web3Service.getAccount().then((account) => {
      this.account = account;
    });
  }
}
