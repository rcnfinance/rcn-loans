import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material';
import { BehaviorSubject } from 'rxjs';

// App Component
import { DialogApproveContractComponent } from '../dialogs/dialog-approve-contract/dialog-approve-contract.component';
import { DialogClientAccountComponent } from '../dialogs/dialog-client-account/dialog-client-account.component';
// App Service
import { Web3Service } from '../services/web3.service';
import { SidebarService } from '../services/sidebar.service';
import { ContractsService } from '../services/contracts.service';
import { TitleService } from '../services/title.service';

import { Utils } from '../utils/utils';
import { TxService, Tx } from '../tx.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, AfterViewInit {
  account: string;
  makeRotate = false;
  profile: boolean;
  title: string;

  _rcnBalance: number;
  _rcnAvailable: number;
  loansWithBalance: number[]; // Balance bar
  ongoingWithdraw: Tx;

  isOpen$: BehaviorSubject<boolean>;
  navToggle: boolean; // Navbar toggled

  constructor(
    public dialog: MatDialog,
    private web3Service: Web3Service,
    private router: Router,
    private sidebarService: SidebarService,
    private contractService: ContractsService,
    private txService: TxService,
    public titleService: TitleService
  ) {}

  // Toggle Navbar
  sidebarToggle() {
    this.sidebarService.toggleService(this.navToggle = !this.navToggle);
  }

  handleProfile() {
    this.profile = !this.profile;
    if (this.profile) {
      this.router.navigate(['/profile/']);
    } else {
      this.router.navigate(['/requests/']);
    }
  }

  // Open Approve Dialog
  openDialogApprove() {
    this.dialog.open(DialogApproveContractComponent, {});
  }
  // Open Client Dialog
  openDialogClient() {
    this.dialog.open(DialogClientAccountComponent, {});
  }
  // Open Approve Dialog
  async openDialog() {
    if (this.hasAccount) {
      const dialogRef: MatDialogRef<DialogApproveContractComponent> = this.dialog.open(DialogApproveContractComponent, {});
      this.makeRotate = true;
      dialogRef.componentInstance.autoClose = false;
      dialogRef.afterClosed().subscribe(() => {
        this.makeRotate = false;
      });
    } else if (await this.web3Service.requestLogin()) {
      return;
    } else {
      this.openDialogClient();
    }
  }

  get hasAccount(): boolean {
    return this.account !== undefined;
  }

  get withdrawAvailable(): boolean {
    return this.loansWithBalance !== undefined &&
      this.loansWithBalance.length !== 0 &&
      this.ongoingWithdraw === undefined;
  }

  get rcnBalance(): string {
    return this._rcnBalance ? Utils.formatAmount(this._rcnBalance) : '...';
  }

  get rcnAvailable(): string {
    return this._rcnAvailable ? Utils.formatAmount(this._rcnAvailable) : '...';
  }

  get displayTotal(): boolean {
    return this.ongoingWithdraw !== undefined && !this.withdrawAvailable;
  }

  get rcnTotal(): string {
    if (!this._rcnAvailable || !this._rcnBalance) {
      return '...';
    }

    return Utils.formatAmount(this._rcnAvailable + this._rcnBalance);
  }

  loadRcnBalance() {
    this.contractService.getUserBalanceRCN().then((balance: number) => {
      this._rcnBalance = balance;
    });
  }

  // Withdraw button
  loadWithdrawBalance() {
    this.contractService.getPendingWithdraws().then((result: [number, number[]]) => {
      this._rcnAvailable = result[0] / 10 ** 18;
      this.loansWithBalance = result[1];
      this.loadOngoingWithdraw();
    });
  }

  loadOngoingWithdraw() {
    this.ongoingWithdraw = this.txService.getLastWithdraw(
      environment.contracts.basaltEngine,
      this.loansWithBalance
    );
    this.ongoingWithdraw = this.txService.getLastWithdraw(environment.contracts.basaltEngine, this.loansWithBalance);
    if (this.ongoingWithdraw) {
      this._rcnBalance += this._rcnAvailable;
    }
  }

  async clickWithdraw() {
    if (this.withdrawAvailable) {
      const tx = await this.contractService.withdrawFunds(this.loansWithBalance);
      this.txService.registerWithdrawTx(tx, environment.contracts.basaltEngine, this.loansWithBalance);
      this.loadWithdrawBalance();
    }
  }

  async loadLogin() {
    if (!this.hasAccount) {
      this.account = await this.web3Service.getAccount();
      this.loadRcnBalance();
      this.loadWithdrawBalance();
    }
  }

  ngOnInit() {
    this.sidebarService.currentToggle.subscribe(navToggle => this.navToggle = navToggle);
    this.titleService.currentTitle.subscribe(title => this.title = title);
    this.web3Service.loginEvent.subscribe(() => this.loadLogin());
    this.loadLogin();
  }

  ngAfterViewInit(): any {}
}
