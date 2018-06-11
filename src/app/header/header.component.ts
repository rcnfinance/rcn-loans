import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material';
// App Component
import { DialogApproveContractComponent } from '../dialogs/dialog-approve-contract/dialog-approve-contract.component';
import { DialogClientAccountComponent } from '../dialogs/dialog-client-account/dialog-client-account.component';
// App Service
import { Web3Service, Type } from '../services/web3.service';
import {SidebarService} from '../services/sidebar.service';
import { ContractsService } from '../services/contracts.service';
import { Utils } from '../utils/utils';
import BigNumber from 'bignumber.js';

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
  sidebarToggled: boolean = true;

  extensionToggled = false;
  // Balance bar
  rcnBalance = '...';
  rcnAvailable = '...';
  loansWithBalance: number[];
  constructor(
    public dialog: MatDialog,
    private web3Service: Web3Service,
    private router: Router,
    private sidebarService: SidebarService,
    private contractService: ContractsService,
  ) {}

  @ViewChild('tref', {read: ElementRef}) tref: ElementRef;

  callSidebarService() {    
    this.sidebarService.isOpen$.next(
      !this.sidebarService.isOpen$.value
    )
  }
  clickEvent(){
    this.sidebarToggled = !this.sidebarToggled;
    console.log(this.sidebarToggled);
  }
  extensionToggle() {
    this.extensionToggled = !this.extensionToggled;
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
  openDialogApprove() {
    const dialogRef: MatDialogRef<DialogApproveContractComponent> = this.dialog.open(DialogApproveContractComponent, {});
    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }
  openDialogClient() {
    const dialogRef: MatDialogRef<DialogClientAccountComponent> = this.dialog.open(DialogClientAccountComponent, {});
    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }
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

  loadWithdrawBalance() {
    this.contractService.getPendingWithdraws().then((result: [number, number[]]) => {
      console.log(result);
      this.rcnAvailable = Utils.formatAmount(result[0] / 10 ** 18);
      this.loansWithBalance = result[1];
    });
  }

  ngOnInit() {
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


