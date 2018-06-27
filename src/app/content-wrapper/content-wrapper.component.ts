import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
// App Component
import { DialogApproveContractComponent } from '../dialogs/dialog-approve-contract/dialog-approve-contract.component';
import { DialogClientAccountComponent } from '../dialogs/dialog-client-account/dialog-client-account.component';
// App Service
import { environment } from '../../environments/environment';
import { SidebarService } from '../services/sidebar.service';
import { Web3Service, Type } from '../services/web3.service';
import { ContractsService } from '../services/contracts.service';
import BigNumber from 'bignumber.js';

@Component({
  selector: 'app-content-wrapper',
  templateUrl: './content-wrapper.component.html',
  styleUrls: ['./content-wrapper.component.scss']
})
export class ContentWrapperComponent implements OnInit {
  winHeight: any = window.innerHeight;
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
  extensionToggled = false; // Balance extension toggled
  navmobileToggled = false; // Nav Mobile toggled

  constructor(
    private sidebarService: SidebarService, // Navbar Service
    private web3Service: Web3Service,
    private contractService: ContractsService,
    public dialog: MatDialog,
  ) {}

  // Toggle Navbar
  sidebarToggle() {
    this.sidebarService.toggleService(this.navToggle = !this.navToggle);
  }
  // Open Balance Extension
  extensionToggle() {
    this.sidebarService.extensionService(this.extensionToggled = !this.extensionToggled);
  }
  // Toggle Sidebar Class
  onClose() {
    this.sidebarService.toggleService(this.navToggle = false);
  }
  onOpen() {
    this.sidebarService.toggleService(this.navToggle = true);
    this.sidebarService.extensionService(this.extensionToggled = false);
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
  loadLender() {
    this.web3Service.getAccount().then((resolve: string) => {
      this.lender = resolve;
    });
  }
  loadRcnBalance() {
    this.contractService.getUserBalanceRCN().then((balance: number) => {
      this.rcnBalance = balance;
    });
  }
  loadWithdrawBalance() {
    this.contractService.getPendingWithdraws().then((result: [number, number[]]) => {
      console.log(result);
      this.weiAvailable = result[0];
      this.loansWithBalance = result[1];
    });
  }

// Approve Loan Engine
  loadApproved(): Promise<any> {
    return this.contractService.isEngineApproved().then((approved) => {
      this.isApproved = approved;
    });
  }
  get isEnabled(): boolean {
    return this.isApproved !== undefined;
  }
  clickCheck() {
    let action;
    if (this.isApproved) {
      action = this.contractService.dissaproveEngine();
    } else {
      action = this.contractService.approveEngine();
    }
    action.then(() => {
      this.loadApproved().then(() => {
      });
    });
  }

  ngOnInit(): void {
     // Navbar toggled
    this.sidebarService.currentToggle.subscribe(navToggle => this.navToggle = navToggle);
    this.sidebarService.currentExtension.subscribe(extensionToggled => this.extensionToggled = extensionToggled);
    this.sidebarService.currentNavmobile.subscribe(navmobileToggled => this.navmobileToggled = navmobileToggled);

    this.loadApproved();

    this.loadLender();
    this.loadRcnBalance();
    this.loadWithdrawBalance();
    this.web3Service.getAccount().then((account) => {
      this.account = account;
    });
  }
}
