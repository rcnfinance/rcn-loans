import {
  Component,
  OnInit,
  OnDestroy,
  HostListener,
  ViewChild,
  ElementRef
} from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { animate, style, transition, trigger } from '@angular/animations';
import { Subscription } from 'rxjs';
import { Web3Service } from 'app/services/web3.service';
import { TitleService } from 'app/services/title.service';
import { DeviceService } from 'app/services/device.service';
import { WalletConnectService } from 'app/services/wallet-connect.service';
import { WalletType } from 'app/interfaces/wallet.interface';
import { DialogWalletSelectComponent } from 'app/dialogs/dialog-wallet-select/dialog-wallet-select.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  animations: [
    trigger('fadeInSlow', [
      transition('* => true', [
        style({ opacity: 0 }),
        animate(2000, style({ opacity: 1 }))
      ])
    ]),
    trigger('fadeInFast', [
      transition('* => true', [
        style({ opacity: 0 }),
        animate(1000, style({ opacity: 1 }))
      ])
    ]),
    trigger('fadeInRight', [
      transition('* => true', [
        style({ opacity: 0.5, transform: 'translateX(100%)' }),
        animate(1000, style({ transform: 'translateX(0%)', opacity: 1 }))
      ])
    ]),
    trigger('fadeInLeft', [
      transition('* => true', [
        style({ opacity: 0.5, transform: 'translateX(-100%)', transitionDelay: 2000 }),
        animate(1000, style({ transform: 'translateX(0%)', opacity: 1, transitionDelay: 2000 }))
      ])
    ]),
    trigger('fadeInBottom', [
      transition('* => true', [
        style({ opacity: 0.5, transform: 'translateY(-100%)' }),
        animate(1000, style({ transform: 'translateY(0%)', opacity: 1 }))
      ])
    ])
  ]
})
export class HomeComponent implements OnInit, OnDestroy {
  private account: string;
  private subscriptionAccount: Subscription;

  animationSectionIntro = true;
  animationSectionConnect = false;
  animationSectionManage = false;
  animationSectionLend = false;
  animationSectionBorrow = false;

  @ViewChild('sectionConnect', { static: false }) sectionConnect: ElementRef;
  @ViewChild('sectionManage', { static: false }) sectionManage: ElementRef;
  @ViewChild('sectionLend', { static: false }) sectionLend: ElementRef;
  @ViewChild('sectionBorrow', { static: false }) sectionBorrow: ElementRef;

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private web3Service: Web3Service,
    private titleService: TitleService,
    private walletConnectService: WalletConnectService,
    private deviceService: DeviceService
  ) {}

  @HostListener('window:scroll', ['$event'])
  checkScroll() {
    const tolerancePixels = this.deviceService.isMobile() ? 850 : 1000;
    const scrollPosition = window.pageYOffset + tolerancePixels;
    const sectionConnectPosition = this.sectionConnect.nativeElement.offsetTop;
    const sectionManagePosition = this.sectionManage.nativeElement.offsetTop;
    const sectionLendPosition = this.sectionLend.nativeElement.offsetTop;
    const sectionBorrowPosition = this.sectionBorrow.nativeElement.offsetTop;

    if (scrollPosition >= sectionConnectPosition) {
      this.animationSectionConnect = true;
    }
    if (scrollPosition >= sectionManagePosition) {
      this.animationSectionManage = true;
    }
    if (scrollPosition >= sectionLendPosition) {
      this.animationSectionLend = true;
    }
    if (scrollPosition >= sectionBorrowPosition) {
      this.animationSectionBorrow = true;
    }
  }

  ngOnInit() {
    this.titleService.changeTitle('RCN');
    this.loadAccount();
    this.listenLoginEvents();
    this.checkAnimations();
  }

  ngOnDestroy() {
    this.subscriptionAccount.unsubscribe();
  }

  async clickManage() {
    const { account } = this;
    if (account) {
      const MY_LOANS_URL = `/address/${account}`;
      return this.router.navigate([MY_LOANS_URL]);
    }

    await this.walletConnectService.connect();
  }

  clickWallet(walletType: WalletType) {
    this.dialog.open(DialogWalletSelectComponent, {
      panelClass: 'dialog-selector-wrapper',
      data: { walletType }
    });
  }

  /**
   * Listen and handle login events for account changes and logout
   */
  private listenLoginEvents() {
    this.subscriptionAccount = this.web3Service.loginEvent.subscribe(
      async () => {
        this.loadAccount();
      }
    );
  }

  /**
   * Load user account
   */
  private async loadAccount() {
    const account = await this.web3Service.getAccount();
    this.account = account;
  }

  /**
   * Check mobile screen to adjust animations
   */
  private async checkAnimations() {
    if (this.deviceService.isMobile()) {
      this.animationSectionLend = true;
    }
  }
}
