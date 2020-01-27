import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material';
// App Component
import { DialogApproveContractComponent } from '../../dialogs/dialog-approve-contract/dialog-approve-contract.component';
import { DialogWalletSelectComponent } from '../../dialogs/dialog-wallet-select/dialog-wallet-select.component';
// App Service
import { Web3Service } from '../../services/web3.service';
import { SidebarService } from '../../services/sidebar.service';
import { TitleService } from '../../services/title.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  hasAccount: boolean;
  account: string;
  makeRotate = false;
  title: string;

  navToggle: boolean; // Navbar toggled

  constructor(
    private cdRef: ChangeDetectorRef,
    private web3Service: Web3Service,
    private sidebarService: SidebarService,
    public dialog: MatDialog,
    public titleService: TitleService
  ) {}

  ngOnInit() {
    this.sidebarService.currentToggle.subscribe(navToggle => this.navToggle = navToggle);
    this.titleService.currentTitle.subscribe(title => this.title = title);
    this.handleLoginEvents();
  }

  /**
   * Toggle navbar
   */
  sidebarToggle() {
    this.sidebarService.toggleService(this.navToggle = !this.navToggle);
  }

  /**
   * Listen and handle login events for account changes and logout
   */
  handleLoginEvents() {
    this.web3Service.loginEvent.subscribe(async (loggedIn) => {
      if (loggedIn) {
        this.account = await this.web3Service.getAccount();
      } else {
        this.account = undefined;
      }
      this.hasAccount = loggedIn;
      this.cdRef.detectChanges();
    });
  }

  /**
   * Open Approve Dialog
   */
  openDialogApprove() {
    this.dialog.open(DialogApproveContractComponent, {});
  }

  /**
   * Open Client Dialog or connect with the dapp
   */
  async login() {
    if (this.hasAccount) {
      this.openDialogApprove();
      return;
    }

    this.dialog.open(DialogWalletSelectComponent, {});
  }
}
