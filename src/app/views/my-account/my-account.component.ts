import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Subscription } from 'rxjs';
import { environment } from 'environments/environment';
import { DialogPohComponent } from 'app/dialogs/dialog-poh/dialog-poh.component';
import { PohService } from 'app/services/poh.service';
import { Web3Service } from 'app/services/web3.service';
import { TitleService } from 'app/services/title.service';
import { Engine } from 'app/models/loan.model';
import { Utils } from 'app/utils/utils';

enum ViewDetails {
  Tools = 'tools',
  Approvals = 'approvals',
  Info = 'info'
}

@Component({
  selector: 'app-my-account',
  templateUrl: './my-account.component.html',
  styleUrls: ['./my-account.component.scss']
})
export class MyAccountComponent implements OnInit, OnDestroy {
  viewDetail: ViewDetails;
  account: string;
  shortAccount: string;
  defaultEngine: Engine;
  version: string = environment.version;
  hasPoh: boolean;
  private subscriptionAccount: Subscription;

  constructor(
    private cdRef: ChangeDetectorRef,
    private dialog: MatDialog,
    private titleService: TitleService,
    private pohService: PohService,
    private web3Service: Web3Service
  ) { }

  ngOnInit() {
    this.viewDetail = ViewDetails.Tools;
    this.defaultEngine = Engine.UsdcEngine;
    this.loadAccount();
    this.listenLoginEvents();
    this.titleService.changeTitle('My Account');
  }

  ngOnDestroy() {
    if (this.subscriptionAccount) {
      this.subscriptionAccount.unsubscribe();
    }
  }

  /**
   * Click on tab
   * @param view Tab
   */
  openDetail(view: string) {
    this.viewDetail = view as ViewDetails;
  }

  /**
   * Check if the passed tab is active
   * @param view Tab
   */
  isDetail(view: string): boolean {
    return view as ViewDetails === this.viewDetail;
  }

  /**
   * Open dialog PoH
   */
  clickOpenPoh() {
    const { account: address } = this;
    this.dialog.open(DialogPohComponent, {
      data: { address }
    });
  }

  /**
   * Load connected account
   */
  private async loadAccount() {
    try {
      const { web3 } = this.web3Service;
      const account = await this.web3Service.getAccount();
      this.account = web3.utils.toChecksumAddress(account);
      this.shortAccount = Utils.shortAddress(this.account);
      this.hasPoh = await this.pohService.checkIfHasPoh(this.account);
    } catch {
      this.account = null;
      this.shortAccount = null;
    }
    this.cdRef.detectChanges();
  }

  /**
   * Listen change account event
   */
  private listenLoginEvents() {
    this.subscriptionAccount =
      this.web3Service.loginEvent.subscribe(async () => {
        await this.loadAccount();
      });
  }
}
