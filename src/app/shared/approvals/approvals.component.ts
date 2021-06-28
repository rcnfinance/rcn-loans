import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import { Utils } from 'app/utils/utils';
import { Engine } from 'app/models/loan.model';
// App Component
import { Web3Service } from 'app/services/web3.service';
import { ContractsService } from 'app/services/contracts.service';
import { CurrenciesService } from 'app/services/currencies.service';
import { EventsService, Category } from 'app/services/events.service';
import { TxLegacyService, Tx, Type } from 'app/services/tx-legacy.service';
import { ChainService } from 'app/services/chain.service';

class Operator {
  constructor(
    public name: string,
    public address: string,
    public action: string
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
  selector: 'app-approvals',
  templateUrl: './approvals.component.html',
  styleUrls: ['./approvals.component.scss']
})
export class ApprovalsComponent implements OnInit, OnDestroy {
  account: string;
  shortAccount: string;
  dialogDescription: string;
  accordionStates = {
    tokenApproves: {},
    assetApproves: {}
  };

  tokens: Contract[];
  tokenOperators: Operator[];

  tokenApproves: Object[];
  assets: Contract[];
  assetOperators: Operator[] = []; // TODO: implement WETH manager
  assetApproves: Object[];

  pendingTx: Tx = undefined;
  txSubscription: boolean;

  // subscriptions
  subscriptionAccount: Subscription;

  @Input() engine: Engine;
  @Input() onlyAddress: string;
  @Input() onlyToken: string;
  @Input() onlyAsset: string;

  @Output() closeDialog: EventEmitter<boolean>;
  @Output() startProgress: EventEmitter<boolean>;
  @Output() endProgress: EventEmitter<boolean>;
  @Output() setDialogDescription: EventEmitter<string>;

  constructor(
    private spinner: NgxSpinnerService,
    private web3Service: Web3Service,
    private contractsService: ContractsService,
    private currenciesService: CurrenciesService,
    private eventsService: EventsService,
    private txService: TxLegacyService,
    private chainService: ChainService
  ) {
    this.closeDialog = new EventEmitter();
    this.startProgress = new EventEmitter();
    this.endProgress = new EventEmitter();
    this.setDialogDescription = new EventEmitter();

    const { onlyToken, onlyAsset } = this;
    if (onlyToken) {
      this.accordionStates.tokenApproves[onlyToken.toLowerCase()] = true;
    }
    if (onlyAsset) {
      this.accordionStates.assetApproves[onlyAsset.toLowerCase()] = true;
    }
  }

  get showRcnEngine() {
    return this.chainService.isEthereum;
  }

  async ngOnInit() {
    await this.loadAccount();
    this.handleLoginEvents();

    await this.loadApprovals();
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
      const { engine } = this;
      const { config } = this.chainService;
      this.eventsService.trackEvent(
        `click-${ actionCode }`,
        Category.Account,
        config.contracts[engine].diaspore.loanManager
      );

      await action;

      if ((this.onlyToken || this.onlyAsset) && this.onlyAddress) {
        this.showProgressbar();
      }

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
    this.endProgress.emit();
  }

  /**
   * Click on RCN/USDC engine
   */
  async clickEngine(engine: Engine) {
    const { engine: currentEngine } = this;
    if (engine === currentEngine) {
      return;
    }

    this.engine = engine;
    await this.loadApprovals();

    this.restoreAccordionStates();
  }

  /**
   * Toggle accordion state
   * @param approves 'tokenApproves' or 'assetApproves'
   * @param address Token address
   */
  clickToggleAccordion(event: any, approves: string, address: string) {
    const { onlyToken, onlyAsset } = this;
    if (onlyToken || onlyAsset) {
      event.source.checked = !event.source.checked;
      return;
    }

    this.accordionStates[approves][address.toLowerCase()] = !this.accordionStates[approves][address.toLowerCase()];
  }

  /**
   * Check if accordion state is opened
   * @param approves 'tokenApproves' or 'assetApproves'
   * @param address Token address
   * @return Is approved
   */
  isAccordionActive(approves: string, address: string): boolean {
    return this.accordionStates[approves][address.toLowerCase()];
  }

  /**
   * Close all accordions
   */
  private restoreAccordionStates(): void {
    this.accordionStates.tokenApproves = {};
    this.accordionStates.assetApproves = {};
  }

  /**
   * Load all approvals and checks
   */
  private async loadApprovals() {
    this.spinner.show();

    try {
      this.loadTokenOperators();
      await this.loadTokens();
      await this.loadAssets();
      this.loadDialogDescription();
    } catch (e) {
      this.eventsService.trackError(e);
    } finally {
      this.retrievePendingTx();
      this.spinner.hide();
    }
  }

  /**
   * Listen and handle login events for account changes and logout
   */
  private handleLoginEvents() {
    this.subscriptionAccount = this.web3Service.loginEvent.subscribe(async (loggedIn: boolean) => {
      if (!loggedIn) {
        this.closeDialog.emit();
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
      this.endProgress.emit();
    }
  }

  /**
   * Show loading progress bar
   */
  private showProgressbar() {
    this.startProgress.emit();
  }

  /**
   * Load ERC20 tokens
   * @return ERC20 array
   */
  private async loadTokens() {
    const currencies = this.currenciesService.getCurrencies(true);
    const tokens: Contract[] = [];

    // set tokens
    const { config } = this.chainService;
    currencies.map(currency => {
      if (currency.address !== config.contracts.chainCurrencyAddress) {
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
    const promises: Promise<boolean>[] = [];
    const approves: any = {};

    tokens.map(token => {
      token.operators.map(
        operator => this.makeApproves(
          token.address,
          operator.address,
          ContractType.Token,
          promises,
          approves
        )
      );
    });

    await Promise.all(promises);
    this.tokenApproves = approves;

    this.tokens = tokens;
    return tokens;
  }

  /**
   * Load ERC721 assets
   * @return ERC721 array
   */
  private async loadAssets(): Promise<Contract[]> {
    return;

    // TODO: implement method
    /*
    const assets: Contract[] = [];
    assets.push(
      new Contract('Collateral', environment.contracts.collateral.collateral)
    );

    // set operators
    assets.map(asset => asset.operators = this.assetOperators);

    // set is approved
    const promises: Promise<boolean>[] = [];
    const approves: any = {};

    assets.map(asset => {
      asset.operators.map(
        operator => this.makeApproves(
          asset.address,
          operator.address,
          ContractType.Asset,
          promises,
          approves
        )
      );
    });

    await Promise.all(promises);
    this.assetApproves = approves;

    this.assets = assets;
    return assets;
    */
  }

  /**
   * Make async token approves
   * @param token Token or asset address
   * @param operator Operator address
   * @param contractType ERC20 or ERC721
   * @param promises Approve promises array
   * @param approves Approves object
   */
  private makeApproves(
    token: string,
    operator: string,
    contractType: ContractType,
    promises: Promise<any>[],
    approves: Object
  ) {
    promises.push(
      new Promise(async (resolve) => {
        const isApproved = await this.isApproved(
          token,
          operator,
          contractType
        );

        approves[token] ?
        approves[token][operator] = isApproved :
        approves[token] = { [operator]: isApproved };

        resolve(isApproved);
      })
    );
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
    const { engine } = this;
    const { config } = this.chainService;
    if (token.address !== config.contracts[engine].token) {
      return this.tokenOperators.filter(
        contract => {
          switch (contract.address) {
            case config.contracts[engine].converter.converterRamp:
            case config.contracts[engine].collateral.collateral:
              return true;

            default:
              return false;
          }
        }
      );
    }

    return this.tokenOperators.filter(
      contract => contract.address !== config.contracts[engine].collateral.wethManager
    );
  }

  /**
   * Set account address
   * @return Account address
   */
  private async loadAccount(): Promise<string> {
    const web3: any = this.web3Service.web3;
    const account = await this.web3Service.getAccount();

    this.account = web3.utils.toChecksumAddress(account);
    this.shortAccount = Utils.shortAddress(this.account);

    return this.account;
  }

  /**
   * Set dialog description for single approve or general settings
   * @return Dialog description
   */
  private loadDialogDescription() {
    if (!this.onlyToken && !this.onlyAsset) {
      this.dialogDescription = 'Please enable the features and currencies you would like to use on the Credit Marketplace.';
      this.setDialogDescription.emit(this.dialogDescription);
      return;
    }

    const contracts: Contract[] = this.tokens.concat(this.assets || []);
    const operators: Operator[] = this.tokenOperators.concat(this.assetOperators);

    const selectedOperator = this.onlyAddress;
    const selectedContract = this.onlyToken || this.onlyAsset;

    const contract = contracts.find((ct: Contract) => ct.address === selectedContract);
    const operator = operators.find((op: Operator) => op.address === selectedOperator);

    this.dialogDescription = `To continue please enable ${ contract.name } ${ operator.action } on the Credit Marketplace.`;
    this.setDialogDescription.emit(this.dialogDescription);
  }

  private loadTokenOperators() {
    const { engine } = this;
    const { config } = this.chainService;
    this.tokenOperators = [
      new Operator(
        'Diaspore Loan Manager',
        config.contracts[engine].diaspore.loanManager,
        'lending'
      ),
      new Operator(
        'Diaspore Debt Mananger',
        config.contracts[engine].diaspore.debtEngine,
        'payments'
      ),
      new Operator(
        'Diaspore Converter Ramp',
        config.contracts[engine].converter.converterRamp,
        'transactions'
      ),
      new Operator(
        'Collateral',
        config.contracts[engine].collateral.collateral,
        'collateralization'
      )
    ];
  }
}
