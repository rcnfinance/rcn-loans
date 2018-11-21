import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material';
import { BehaviorSubject } from 'rxjs';
import { BalanceComponent } from './balance/balance.component';

export { BalanceComponent };

// App Component
import { DialogApproveContractComponent } from '../dialogs/dialog-approve-contract/dialog-approve-contract.component';
import { DialogClientAccountComponent } from '../dialogs/dialog-client-account/dialog-client-account.component';
// App Service
import { Web3Service } from '../services/web3.service';
import { SidebarService } from '../services/sidebar.service';
import { TitleService } from '../services/title.service';

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

  isOpen$: BehaviorSubject<boolean>;
  navToggle: boolean; // Navbar toggled

  constructor(
    public dialog: MatDialog,
    private web3Service: Web3Service,
    private router: Router,
    private sidebarService: SidebarService,
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

  async loadLogin() {
    if (!this.hasAccount) {
      this.account = await this.web3Service.getAccount();
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
