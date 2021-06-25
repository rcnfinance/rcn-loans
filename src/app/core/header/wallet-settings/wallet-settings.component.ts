import { Component, OnInit, OnChanges, OnDestroy, Input, ChangeDetectorRef } from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Utils } from 'app/utils/utils';
import { DialogApproveContractComponent } from 'app/dialogs/dialog-approve-contract/dialog-approve-contract.component';
import { DialogPohComponent } from 'app/dialogs/dialog-poh/dialog-poh.component';
import { HeaderPopoverService } from 'app/services/header-popover.service';
import { PohService } from 'app/services/poh.service';
import { Web3Service } from 'app/services/web3.service';
import { ChainService } from 'app/services/chain.service';

@Component({
  selector: 'app-wallet-settings',
  templateUrl: './wallet-settings.component.html',
  styleUrls: ['./wallet-settings.component.scss'],
  animations: [
    trigger('anmNotifications', [
      state('open', style({
        opacity: 1,
        display: 'block',
        top: '43px'
      })),
      state('closed', style({
        opacity: 0,
        display: 'none',
        top: '48px'
      })),
      transition('open => closed', [
        animate('.3s')
      ]),
      transition('closed => open', [
        animate('.3s')
      ])
    ])
  ]
})
export class WalletSettingsComponent implements OnInit, OnChanges, OnDestroy {
  @Input() account: string;
  shortAddress: string;
  viewDetail: string;
  hasPoh: boolean;

  // subscriptions
  subscriptionPopover: Subscription;

  constructor(
    private cdRef: ChangeDetectorRef,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private pohService: PohService,
    private headerPopoverService: HeaderPopoverService,
    private web3Service: Web3Service,
    private chainService: ChainService
  ) { }

  ngOnInit() {
    this.subscriptionPopover =
      this.headerPopoverService.currentDetail.subscribe(detail => {
        this.viewDetail = detail;
        this.cdRef.detectChanges();
      });
  }

  async ngOnChanges(changes) {
    const web3: any = this.web3Service.web3;
    const { account } = changes;

    if (account.currentValue) {
      this.account = web3.utils.toChecksumAddress(account.currentValue);
      this.shortAddress = Utils.shortAddress(this.account);
      this.hasPoh = await this.pohService.checkIfHasPoh(this.account);
    }
  }

  ngOnDestroy() {
    if (this.subscriptionPopover) {
      this.subscriptionPopover.unsubscribe();
    }
  }

  clickCopyAddress() {
    const { account } = this;
    const shadowElement = document.createElement('textarea');
    shadowElement.value = account;
    shadowElement.setAttribute('readonly', '');
    shadowElement.style.position = 'absolute';
    shadowElement.style.left = '-9999px';
    document.body.appendChild(shadowElement);
    shadowElement.select();
    document.execCommand('copy');
    document.body.removeChild(shadowElement);

    this.snackBar.open('Address copied to clipboard!' , null, {
      duration: 4000,
      horizontalPosition: 'center'
    });
  }

  clickOpenEtherscan() {
    const { account } = this;
    const { config } = this.chainService;
    window.open(config.network.explorer.address.replace('${address}', account));
  }

  clickOpenApprovals() {
    this.dialog.open(DialogApproveContractComponent, {});
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
}
