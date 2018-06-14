import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material';
// App Component
import { DialogApproveContractComponent } from '../dialogs/dialog-approve-contract/dialog-approve-contract.component';
import { DialogClientAccountComponent } from '../dialogs/dialog-client-account/dialog-client-account.component';
// App Service
import { Web3Service, Type } from '../services/web3.service';
import { SidebarService } from '../services/sidebar.service';
import { ContractsService } from '../services/contracts.service';
import { Utils } from '../utils/utils';

// App Component

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, AfterViewInit {
  account: string;
  makeRotate = false;
  profile: boolean;
  rcnBalance = '...'; // Balance bar
  rcnAvailable = '...'; // Balance bar
  loansWithBalance: number[]; // Balance bar
  navToggle: boolean; // Navbar toggled
  extensionToggled = false; // Balance extension toggled

  constructor(
    public dialog: MatDialog,
    private web3Service: Web3Service,
    private router: Router,
    private sidebarService: SidebarService,
    private contractService: ContractsService,
  ) {}

  // Open Navbar
  sidebarToggle(){
    this.sidebarService.toggleService(this.navToggle=!this.navToggle);
  }

  // Open Balance Extension
  extensionToggle() {
    this.extensionToggled = !this.extensionToggled;
  }

  // Toggle Sidebar Service
  callSidebarService() {
    this.sidebarService.isOpen$.next(
      !this.sidebarService.isOpen$.value
    )
  }

  handleProfile() {
    this.profile = !this.profile;
    if (this.profile) {
      this.router.navigate(['/profile/']).then(nav => {
        console.log(nav); // true if navigation is successful
      }, err => {
        console.log(err); // when there's an error
      });
    } else {
      this.router.navigate(['/requests/']).then(nav => {
        console.log(nav); // true if navigation is successful
      }, err => {
        console.log(err); // when there's an error
      });
    }
  }

  // Open Approve Dialog
  openDialogApprove() {
    const dialogRef: MatDialogRef<DialogApproveContractComponent> = this.dialog.open(DialogApproveContractComponent, {});
    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }
  // Open Client Dialog
  openDialogClient() {
    const dialogRef: MatDialogRef<DialogClientAccountComponent> = this.dialog.open(DialogClientAccountComponent, {});
    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }
  // Open Approve Dialog
  openDialog() {
    if (this.hasAccount) {
      const dialogRef: MatDialogRef<DialogApproveContractComponent> = this.dialog.open(DialogApproveContractComponent, {});
      dialogRef.componentInstance.autoClose = false;
      dialogRef.afterClosed().subscribe(result => {
        console.log(`Dialog result: ${result}`);
      });
    } else {
      if (this.web3Service.web3Type === Type.Injected) {
        window.open('https://metamask.io/', '_blank');
      } else {
        this.openDialogClient();
      }
    }
  }
  ngAfterViewInit(): any {}

  loadRcnBalance() {
    this.contractService.getUserBalanceRCN().then((balance: number) => {
      this.rcnBalance = Utils.formatAmount(balance);
    });
  }

// Withdraw button
  loadWithdrawBalance() {
    this.contractService.getPendingWithdraws().then((result: [number, number[]]) => {
      console.log(result);
      this.rcnAvailable = Utils.formatAmount(result[0] / 10 ** 18);
      this.loansWithBalance = result[1];
    });
  }

  ngOnInit() {
    this.sidebarService.currentToggle.subscribe(navToggle => this.navToggle = navToggle);
    this.sidebarService.currentExtension.subscribe(extensionToggled => this.extensionToggled = extensionToggled);

    this.web3Service.getAccount().then((account) => {
      this.account = account;
      this.loadRcnBalance();
      this.loadWithdrawBalance();
    });
  }
  get hasAccount(): boolean {
    return this.account !== undefined;
  }
}


