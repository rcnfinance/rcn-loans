import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material';
import { BehaviorSubject } from 'rxjs';
// App Component
import { DialogApproveContractComponent } from '../dialogs/dialog-approve-contract/dialog-approve-contract.component';
import { DialogClientAccountComponent } from '../dialogs/dialog-client-account/dialog-client-account.component';
// App Service
import { Web3Service, Type } from '../services/web3.service';
import { SidebarService } from '../services/sidebar.service';
import { ContractsService } from '../services/contracts.service';
import { TitleService } from '../services/title.service';

import { Utils } from '../utils/utils';

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

  rcnBalance = '...'; // Balance bar
  rcnAvailable = '...'; // Balance bar
  loansWithBalance: number[]; // Balance bar

  isOpen$: BehaviorSubject<boolean>;
  navToggle: boolean; // Navbar toggled

  constructor(
    public dialog: MatDialog,
    private web3Service: Web3Service,
    private router: Router,
    private sidebarService: SidebarService,
    private contractService: ContractsService,
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
  openDialog() {
    if (this.hasAccount) {
      const dialogRef: MatDialogRef<DialogApproveContractComponent> = this.dialog.open(DialogApproveContractComponent, {});
      this.makeRotate = true;
      dialogRef.componentInstance.autoClose = false;
      dialogRef.afterClosed().subscribe(() => {
        this.makeRotate = false;
      });
    } else if (this.web3Service.web3Type === Type.Injected) {
      window.open('https://metamask.io/', '_blank');
    } else {
      this.openDialogClient();
    }
  }

  get hasAccount(): boolean {
    return this.account !== undefined;
  }

  loadRcnBalance() {
    this.contractService.getUserBalanceRCN().then((balance: number) => {
      this.rcnBalance = Utils.formatAmount(balance);
    });
  }

  // Withdraw button
  loadWithdrawBalance() {
    this.contractService.getPendingWithdraws().then((result: [number, number[]]) => {
      this.rcnAvailable = Utils.formatAmount(result[0] / 10 ** 18);
      this.loansWithBalance = result[1];
    });
  }

  async loadLogin(to: boolean) {
    if (to && !this.hasAccount) {
      this.account = await this.web3Service.getAccount();
      this.loadRcnBalance();
      this.loadWithdrawBalance();
    }
  }

  ngOnInit() {
    this.sidebarService.currentToggle.subscribe(navToggle => this.navToggle = navToggle);
    this.titleService.currentTitle.subscribe(title => this.title = title);
    this.loadLogin(this.web3Service.loggedIn);
    this.web3Service.loginEvent.subscribe(this.loadLogin);
  }

  ngAfterViewInit(): any {}
}
