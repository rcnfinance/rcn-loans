import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material';
import { Subscription } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import { environment } from '../../../environments/environment';
// App Component
import { Web3Service } from '../../services/web3.service';
import { ContractsService } from '../../services/contracts.service';
import { CurrenciesService } from '../../services/currencies.service';
import { EventsService, Category } from '../../services/events.service';
import { TxService, Tx, Type } from '../../services/tx.service';

class Operator {
  isApproved: Promise<boolean>;
  constructor(
    public name: string,
    public address: string
  ) { }
}

class Contract {
  operators: Operator[] = [];
  constructor(
    public name: string,
    public address: string
  ) { }
}

enum ContractType {
  Asset = 'asset',
  Token = 'token'
}

@Component({
  selector: 'app-dialog-approve-contract',
  templateUrl: './dialog-approve-contract.component.html',
  styleUrls: ['./dialog-approve-contract.component.scss']
})
export class DialogApproveContractComponent implements OnInit, OnDestroy {
  onlyAddress: string;
  onlyToken: string;
  onlyAsset: string;
  account: string;

  tokens: Contract[];
  tokenOperators: Operator[] = [
    new Operator('Diaspore Loan manager', environment.contracts.diaspore.loanManager),
    new Operator('Diaspore Debt mananger', environment.contracts.diaspore.debtEngine),
    new Operator('Diaspore Converter ramp', environment.contracts.converter.converterRamp),
    new Operator('Diaspore Collateral', environment.contracts.collateral.collateral),
    new Operator('Basalt engine', environment.contracts.basaltEngine)
  ];
  assets: Contract[];
  assetOperators: Operator[] = [
    new Operator('Collateral WETH Manager', environment.contracts.collateral.wethManager)
  ];

  startProgress: boolean;
  finishProgress: boolean;
  loading: boolean;
  pendingTx: Tx = undefined;
  txSubscription: boolean;

  // subscriptions
  subscriptionAccount: Subscription;

  constructor(
    private spinner: NgxSpinnerService,
    private web3Service: Web3Service,
    private contractsService: ContractsService,
    private currenciesService: CurrenciesService,
    private eventsService: EventsService,
    private txService: TxService,
    private dialogRef: MatDialogRef<DialogApproveContractComponent>,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (this.data) {
      const {
        onlyAddress,
        onlyToken,
        onlyAsset
      } = this.data;

      this.onlyAddress = onlyAddress;
      this.onlyToken = onlyToken;
      this.onlyAsset = onlyAsset;
    }
  }

  async ngOnInit() {
    await this.loadAccount();
    this.handleLoginEvents();
    this.spinner.show();

    try {
      await this.loadTokens();
      await this.loadAssets();
    } catch (e) {
      console.error(e);
    } finally {
      this.retrievePendingTx();
      this.spinner.hide();
    }
  }

  ngOnDestroy() {
    if (this.subscriptionAccount) {
      this.subscriptionAccount.unsubscribe();
    }
  }

  /**
   * Click for approve or disapprove operator
   * @param operator Operator contract object
   * @param event Native click event
   * @param contract ERC20 or ERC721 contract object
   * @param type ERC20 or ERC721
   */
  async clickCheck(
    operator: Operator,
    event: any,
    contract: Contract,
    type: ContractType
  ) {
    let action: Promise<string>;
    let actionCode: string;

    switch (type) {
      case ContractType.Asset:
        if (!event.checked) {
          actionCode = `disapprove-asset-${ operator.name }`;
          action = this.contractsService.disapproveERC721(contract.address, operator.address);
        } else {
          actionCode = `approve-asset-${ operator.name }`;
          action = this.contractsService.approveERC721(contract.address, operator.address);
        }
        break;

      case ContractType.Token:
        if (!event.checked) {
          actionCode = `disapprove-token-${ operator.name }`;
          action = this.contractsService.disapprove(operator.address, contract.address);
        } else {
          actionCode = `approve-token-${ operator.name }`;
          action = this.contractsService.approve(operator.address, contract.address);
        }
        break;

      default:
        return;
    }

    try {
      this.eventsService.trackEvent(
        `click-${ actionCode }`,
        Category.Account,
        environment.contracts.diaspore.loanManager
      );

      await action;

      if ((this.onlyToken || this.onlyAsset) && this.onlyAddress) {
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
    }
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
   * Listen and handle login events for account changes and logout
   */
  private handleLoginEvents() {
    this.subscriptionAccount = this.web3Service.loginEvent.subscribe(async (loggedIn: boolean) => {
      if (!loggedIn) {
        this.dialog.closeAll();
        return;
      }

      await this.loadAccount();
      this.loadTokens();
      this.loadAssets();
    });
  }

  /**
   * Retrieve pending Tx
   */
  private retrievePendingTx() {
    const pendingApproveTx: Tx = this.txService.getLastPendingApprove(
      (this.onlyToken || this.onlyAsset), this.onlyAddress
    );

    if (!pendingApproveTx) {
      this.pendingTx = undefined;
    } else {
      this.pendingTx = pendingApproveTx;
    }

    if (
      !this.txSubscription &&
      (this.onlyToken || this.onlyAsset) &&
      this.onlyAddress
    ) {
      this.txSubscription = true;
      this.txService.subscribeConfirmedTx(async (tx: Tx) => this.trackApproveTx(tx));
    }
  }

  /**
   * Track tx
   */
  private trackApproveTx(tx: Tx) {
    const to: string = this.onlyToken || this.onlyAsset;
    if (
      tx.type === Type.approve &&
      (tx.to === to) &&
      tx.data.contract === this.onlyAddress
    ) {
      this.finishProgress = true;
    }
  }

  /**
   * Show loading progress bar
   */
  private showProgressbar() {
    this.startProgress = true;
    this.loading = true;
  }

  /**
   * Load ERC20 tokens
   * @return ERC20 array
   */
  private async loadTokens() {
    const currencies = this.currenciesService.getCurrencies(true);
    const tokens: Contract[] = [];

    // set tokens
    currencies.map(currency => {
      if (currency.address !== environment.contracts.converter.ethAddress) {
        tokens.push(
          new Contract(
            currency.symbol,
            currency.address
          )
        );
      }
    });

    // set operators
    tokens.map(token => token.operators = this.filterTokenOperators(token));

    // set isApproved
    tokens.map(token => {
      return token.operators.map(
        operator => {
          operator.isApproved = this.isApproved(
            token.address,
            operator.address,
            ContractType.Token
          );
          return operator;
        }
      );
    });

    this.tokens = tokens;
    return tokens;
  }

  /**
   * Load ERC721 assets
   * @return ERC721 array
   */
  private loadAssets(): Contract[] {
    const assets: Contract[] = [];
    assets.push(
      new Contract('Collateral', environment.contracts.collateral.collateral)
    );

    // set operators
    assets.map(asset => asset.operators = this.assetOperators);

    // set is approved
    assets.map(asset => {
      return asset.operators.map(
        operator => {
          operator.isApproved = this.isApproved(
            asset.address,
            operator.address,
            ContractType.Asset
          );
          return operator;
        }
      );
    });

    this.assets = assets;
    return assets;
  }

  /**
   * Returns if the operator is approved to operate with the chosen token
   * @param contract ERC20 or ERC721 address
   * @param operator Operator address
   * @param type ERC20 or ERC721
   * @return Boolean if is approved
   */
  private async isApproved(
    contract: string,
    operator: string,
    type: ContractType
  ): Promise<boolean> {
    switch (type) {
      case ContractType.Token:
        return await this.contractsService.isApproved(
          operator,
          contract
        );

      case ContractType.Asset:
        return await this.contractsService.isApprovedERC721(
          contract,
          operator
        );

      default:
        break;
    }
  }

  /**
   * Return operators for the specified token
   * @param token ERC20 address
   * @return Operators array
   */
  private filterTokenOperators(token: Contract): Operator[] {
    if (token.address !== environment.contracts.rcnToken) {
      return this.tokenOperators.filter(
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

    return this.tokenOperators.filter(
      contract => contract.address !== environment.contracts.collateral.wethManager
    );
  }

  /**
   * Set account address
   * @return Account address
   */
  private async loadAccount(): Promise<string> {
    const web3: any = this.web3Service.web3;
    const account = await this.web3Service.getAccount();

    this.account = web3.toChecksumAddress(account);
    return this.account;
  }

}
