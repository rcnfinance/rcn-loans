import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material';
import { Subscription } from 'rxjs';
// App Component
import { Web3Service } from '../../services/web3.service';
import { ContractsService } from '../../services/contracts.service';
import { EventsService, Category } from '../../services/events.service';
import { TxService, Tx, Type } from '../../services/tx.service';
import { environment } from '../../../environments/environment';

class Contract {
  isApproved = {};
  constructor(
    public name: string,
    public address: string
  ) { }
}

class TokenContracts {
  constructor(
    public address: string,
    public contracts: Contract[]
  ) { }
}

@Component({
  selector: 'app-dialog-approve-contract',
  templateUrl: './dialog-approve-contract.component.html',
  styleUrls: ['./dialog-approve-contract.component.scss']
})
export class DialogApproveContractComponent implements OnInit, OnDestroy {
  onlyAddress: string;
  onlyToken: string;
  account: string;
  currencies: any[];
  contracts: Contract[] = [
    new Contract('Diaspore Loan manager', environment.contracts.diaspore.loanManager),
    new Contract('Diaspore Debt mananger', environment.contracts.diaspore.debtEngine),
    new Contract('Diaspore Converter ramp', environment.contracts.converter.converterRamp),
    new Contract('Diaspore Collateral', environment.contracts.collateral.collateral),
    new Contract('Basalt engine', environment.contracts.basaltEngine)
  ];
  tokenContracts = {};
  pendingTx: Tx = undefined;
  txSubscription: boolean;

  // progress bar
  loading: boolean;
  startProgress: boolean;
  finishProgress: boolean;

  // subscriptions
  subscriptionAccount: Subscription;

  constructor(
    private web3Service: Web3Service,
    private contractsService: ContractsService,
    private eventsService: EventsService,
    private txService: TxService,
    private dialogRef: MatDialogRef<DialogApproveContractComponent>,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (this.data) {
      this.onlyAddress = this.data.onlyAddress;
      this.onlyToken = this.data.onlyToken;
    }
  }

  async ngOnInit() {
    await this.loadCurrencies();
    await this.loadAccount();
    this.loadApproved();
    this.handleLoginEvents();
    this.retrievePendingTx();
  }

  ngOnDestroy() {
    if (this.subscriptionAccount) {
      this.subscriptionAccount.unsubscribe();
    }
    if (this.txSubscription) {
      this.txService.unsubscribeConfirmedTx(async (tx: Tx) => this.trackApproveTx(tx));
    }
  }

  /**
   * Retrieve pending Tx
   */
  retrievePendingTx() {
    const pendingApproveTx: Tx = this.txService.getLastPendingApprove(this.onlyToken, this.onlyAddress);

    if (!pendingApproveTx) {
      this.pendingTx = undefined;
    } else {
      this.pendingTx = pendingApproveTx;
    }

    if (!this.txSubscription && this.onlyToken && this.onlyAddress) {
      this.txSubscription = true;
      this.txService.subscribeConfirmedTx(async (tx: Tx) => this.trackApproveTx(tx));
    }
  }

  /**
   * Track tx
   */
  trackApproveTx(tx: Tx) {
    if (
      tx.type === Type.approve &&
      tx.to === this.onlyToken &&
      tx.data.contract === this.onlyAddress
    ) {
      this.finishProgress = true;
    }
  }

  /**
   * Listen and handle login events for account changes and logout
   */
  handleLoginEvents() {
    this.subscriptionAccount = this.web3Service.loginEvent.subscribe(async (loggedIn: boolean) => {
      if (!loggedIn) {
        this.dialog.closeAll();
        return;
      }

      await this.loadAccount();
      this.loadApproved();
    });
  }

  /**
   * Set account address
   */
  async loadAccount() {
    this.account = await this.web3Service.getAccount();
  }

  /**
   * Load currencies
   */
  loadCurrencies() {
    const ethAddress = environment.contracts.converter.ethAddress;
    this.currencies = environment.usableCurrencies.filter(
      currency => currency.address !== ethAddress
    );

    // set contracts by token
    this.tokenContracts = this.currencies.reduce((accumulator, item) => ({
      ...accumulator,
      [item.symbol]: new TokenContracts(
        item.address,
        this.loadContracts(item.address)
      )
    }), {});
  }

  async loadApproved(): Promise<any> {
    const promises = [];

    const isContractApproved = (contract, currency) => {
      promises.push(
        new Promise(async () => {
          contract.isApproved[currency.address] = await this.contractsService.isApproved(contract.address, currency.address);
          console.info(
            contract.name,
            contract.address,
            'Approved',
            contract.isApproved[currency.address],
            'for Token',
            currency.address
          );
        })
      );
    };

    this.currencies.map(currency => {
      this.contracts.map(contract => isContractApproved(contract, currency));
    });

    await Promise.all(promises);
  }

  isEnabled(contract: Contract): boolean {
    return contract.isApproved !== undefined;
  }

  async clickCheck(contract: Contract, event: any, tokenAddress: string) {
    let action;
    let actionCode;

    try {
      if (!event.checked) {
        actionCode = `disapprove${ contract.name }`;
        action = this.contractsService.disapprove(contract.address, tokenAddress);
      } else {
        actionCode = `disapprove${ contract.name }`;
        action = this.contractsService.approve(contract.address, tokenAddress);
      }

      this.eventsService.trackEvent(
        `click-${ actionCode }-basalt-rcn`,
        Category.Account,
        environment.contracts.basaltEngine
      );

      await action;

      if (this.onlyToken && this.onlyAddress) {
        this.showProgressbar();
      }

      this.eventsService.trackEvent(
        `${ actionCode }-rcn`,
        Category.Account,
        environment.contracts.basaltEngine
      );

      this.retrievePendingTx();
    } catch (e) {
      console.info('Approve rejected', e);
      event.source.checked = !event.checked;
      return;
    } finally {
      await this.loadApproved();
    }
  }

  /**
   * Show loading progress bar
   */
  showProgressbar() {
    this.startProgress = true;
    this.loading = true;
  }

  /**
   * Hide progressbar and close dialog
   */
  hideProgressbar() {
    this.startProgress = false;
    this.finishProgress = false;
    this.loading = false;

    this.dialogRef.close(true);
  }

  /**
   * Load contracts for the specified token
   * @param token Token address
   * @return Contracts array
   */
  private loadContracts(token: string) {
    const rcnToken = environment.contracts.rcnToken;

    if (token !== rcnToken) {
      return this.contracts.filter(
        contract => {
          switch (contract.address) {
            case environment.contracts.converter.converterRamp:
            case environment.contracts.collateral.collateral:
              return true;

            default:
              return false;
          }
        }
      );
    }

    return this.contracts;
  }
}
