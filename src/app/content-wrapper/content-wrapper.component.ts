import { Component, OnInit } from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import { MatDialog, MatDialogRef } from '@angular/material';
// App Component
import { DialogApproveContractComponent } from '../dialogs/dialog-approve-contract/dialog-approve-contract.component';
import { DialogClientAccountComponent } from '../dialogs/dialog-client-account/dialog-client-account.component';
import { environment } from '../../environments/environment';
// App Service
import { Web3Service, Type } from '../services/web3.service';
import {SidebarService} from '../services/sidebar.service';

@Component({
  selector: 'app-content-wrapper',
  templateUrl: './content-wrapper.component.html',
  styleUrls: ['./content-wrapper.component.scss']
})
export class ContentWrapperComponent implements OnInit {
  winHeight: any = window.innerHeight;
  events: string[] = [];
  isOpen$: BehaviorSubject<boolean>;
  account: string;
  version: string = environment.version;
  navToggle: boolean; // Navbar toggled
  extensionToggled = false; // Balance extension toggled

  // Toggle Sidebar Service
  callSidebarService() {
    this.sidebarService.isOpen$.next(
      !this.sidebarService.isOpen$.value
    )
  }
  // Toggle Sidebar Class
  onClose(){
    this.sidebarService.toggleService(this.navToggle = false);
    // this.sidebarService.toggleService(this.extensionToggled=true);
  }
  onOpen(){
    this.sidebarService.toggleService(this.navToggle = true);
    // this.sidebarService.toggleService(this.extensionToggled=false);
  }

  // Open Balance Extension
  extensionToggle() {
    this.extensionToggled = !this.extensionToggled;
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

  constructor(
    private sidebarService: SidebarService, // Navbar Service
    private web3Service: Web3Service,
    public dialog: MatDialog,
  ) {}

  get hasAccount(): boolean {
    return this.account !== undefined;
  }

  ngOnInit(): void {
     // Navbar toggled
    this.sidebarService.currentToggle.subscribe(navToggle => this.navToggle = navToggle);
    this.sidebarService.currentExtension.subscribe(extensionToggled => this.extensionToggled = extensionToggled);
    this.isOpen$ = this.sidebarService.isOpen$;
    
    this.web3Service.getAccount().then((account) => {
      this.account = account;
    });
  }
}
