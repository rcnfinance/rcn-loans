import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatDialog } from '@angular/material';
import { DialogSelectCurrencyComponent } from '../../dialogs/dialog-select-currency/dialog-select-currency.component';
// App Models
import { Loan, Status, Network } from './../../models/loan.model';
import { Brand } from '../../models/brand.model';
import { Collateral } from '../../models/collateral.model';
// App Utils
import { Utils } from './../../utils/utils';
import { Currency } from './../../utils/currencies';
// App Services
import { ContractsService } from './../../services/contracts.service';
import { ApiService } from './../../services/api.service';
import { CosignerService } from './../../services/cosigner.service';
import { IdentityService } from '../../services/identity.service';
import { Web3Service } from '../../services/web3.service';
import { BrandingService } from './../../services/branding.service';
import { CurrenciesService } from './../../services/currencies.service';

@Component({
  selector: 'app-loan-detail',
  templateUrl: './loan-detail.component.html',
  styleUrls: ['./loan-detail.component.scss']
})
export class LoanDetailComponent implements OnInit {
  loan: Loan;
  identityName = '...';
  viewDetail = undefined;
  userAccount: string;
  brand: Brand;

  diasporeData = [];
  isDiaspore: boolean;

  loanConfigData = [];
  loanStatusData = [];
  isExpired: boolean;
  isRequest: boolean;
  isOngoing: boolean;
  isInDebt: boolean;

  canTransfer = false;
  canCancel: boolean;
  canPay: boolean;
  canLend: boolean;

  hasHistory: boolean;
  generatedByUser: boolean;

  totalDebt: string;
  pendingAmount: string;
  expectedReturn: string;
  paid: string;
  interest: string;
  duration: string;
  collateral: any;
  collateralAmount: string;
  collateralAsset: string;
  nextInstallment: {
    installment: string,
    amount: string,
    dueDate: string,
    dueTime: string
  };
  lendDate: string;
  dueDate: string;
  lender: string;
  liquidationRatio: string;
  balanceRatio: string;
  punitory: string;

  // Loan Oracle
  oracle: string;
  availableOracle: boolean;
  currency: string;

  constructor(
    private identityService: IdentityService,
    private route: ActivatedRoute,
    private apiService: ApiService,
    private cosignerService: CosignerService,
    private contractsService: ContractsService,
    private currenciesService: CurrenciesService,
    private router: Router,
    private web3Service: Web3Service,
    private spinner: NgxSpinnerService,
    private brandingService: BrandingService,
    public dialog: MatDialog
  ) { }

  ngOnInit() {
    this.spinner.show();
    this.loadAccount();
    this.route.params.subscribe(params => {
      const id = params['id']; // (+) converts string 'id' to a number
      this.contractsService.getLoan(id).then(loan => {
        this.loan = loan;
        this.hasHistory = true;
        this.brand = this.brandingService.getBrand(this.loan);
        this.oracle = this.loan.oracle ? this.loan.oracle.address : undefined;
        this.currency = this.loan.oracle ? this.loan.oracle.currency : 'RCN';
        this.availableOracle = this.loan.oracle.currency !== 'RCN';

        this.isRequest = this.loan.status === Status.Request;
        this.isOngoing = this.loan.status === Status.Ongoing;
        this.isExpired = this.loan.status === Status.Expired;

        this.checkLoanGenerator();
        this.loadDetail();
        this.loadIdentity();
        this.loadCollateral();
        this.viewDetail = this.defaultDetail();

        this.spinner.hide();
      }).catch((e: Error) => {
        console.error(e);
        console.info('Loan', this.loan.id, 'not found');
        this.router.navigate(['/404/'], { skipLocationChange: true });
      });
    });
  }

  openDetail(view: string) {
    this.viewDetail = view;
  }

  isDetail(view: string): Boolean {
    return view === this.viewDetail;
  }

  checkLoanGenerator() {
    this.generatedByUser = this.cosignerService.getCosigner(this.loan) === undefined;
  }

  openDialog() {
    // const dialogConfig = new MatDialogConfig();
    const dialogConfig = {
      data: { loan: this.loan }
    };
    this.dialog.open(DialogSelectCurrencyComponent, dialogConfig);
  }

  private async loadAccount() {
    this.web3Service.getAccount().then((account) => {
      this.userAccount = account;
      this.loadUserActions();
    });
  }

  /**
   * Load borrower identity
   */
  private async loadIdentity() {
    const identity = await this.identityService.getIdentity(this.loan);
    this.identityName = identity ? identity.short : 'Unknown';
  }

  /**
   * Load collateral data
   */
  private async loadCollateral() {
    const loanId: string = this.loan.id;
    const collaterals = await this.apiService.getCollateralByLoan(loanId);
    const web3: any = this.web3Service.web3;

    if (!collaterals.length) {
      return;
    }

    const collateral = collaterals[0];
    console.info('loan collateral', collateral);

    this.collateral = new Collateral(
      collateral.id,
      collateral.debt_id,
      collateral.oracle,
      collateral.token,
      collateral.amount,
      collateral.liquidation_ratio,
      collateral.balance_ratio,
      collateral.burn_fee,
      collateral.reward_fee
    );

    const liquidationRatio = new web3.BigNumber(collateral.liquidation_ratio).div(100);
    const balanceRatio = new web3.BigNumber(collateral.balance_ratio).div(100);

    this.liquidationRatio = `${ Utils.formatAmount(liquidationRatio) } %`;
    this.balanceRatio = `${ Utils.formatAmount(balanceRatio) } %`;

    const collateralCurrency = this.currenciesService.getCurrencyByKey('address', collateral.token);
    this.collateralAmount = Utils.formatAmount(web3.fromWei(collateral.amount));
    this.collateralAsset = collateralCurrency.symbol;
  }

  private defaultDetail(): string {
    if (this.generatedByUser) {
      return 'collateral';
    }

    return 'cosigner';
  }

  private loadDetail() {
    if (this.loan.status === Status.Request) {
      // Load config data
      const interest = this.loan.descriptor.interestRate.toFixed(2);
      const interestPunnitory = this.loan.descriptor.punitiveInterestRateRate.toFixed(2);
      const currency: Currency = this.loan.currency;
      const duration: string = Utils.formatDelta(this.loan.descriptor.duration);

      this.loanConfigData = [
        ['Currency', currency],
        ['Interest / Punitory', '~ ' + interest + ' % / ~ ' + interestPunnitory + ' %'],
        ['Duration', duration]
      ];

      // Template data
      this.interest = `~ ${ interest }%`;
      this.punitory = `~ ${ interestPunnitory }%`;
      this.duration = duration;

      this.expectedReturn = this.loan.currency.fromUnit(this.loan.descriptor.totalObligation).toFixed(2);
    } else {
      const currency = this.loan.currency;
      const lendDate: string = this.formatTimestamp(this.loan.debt.model.dueTime - this.loan.descriptor.duration);
      const dueDate: string = this.formatTimestamp(this.loan.debt.model.dueTime);
      const deadline: string = this.formatTimestamp(this.loan.debt.model.dueTime);
      const remaning: string = Utils.formatDelta(this.loan.debt.model.dueTime - (new Date().getTime() / 1000), 2);
      const interest: string = this.formatInterest(
        this.loan.status === Status.Indebt ? this.loan.descriptor.punitiveInterestRateRate : this.loan.descriptor.interestRate
      );

      // Show ongoing loan detail
      this.loanStatusData = [
        ['Lend date', lendDate], // TODO
        ['Due date', dueDate],
        ['Deadline', deadline],
        ['Remaining', remaning]
      ];

      // Template data
      this.interest = '~ ' + interest + ' %';
      this.lendDate = dueDate;
      this.dueDate = dueDate;

      // Load status data
      const basaltPaid = this.loan.network === Network.Basalt ? currency.fromUnit(this.loan.debt.model.paid) : 0;
      this.totalDebt = Utils.formatAmount(currency.fromUnit(this.loan.descriptor.totalObligation));
      this.pendingAmount = Utils.formatAmount(currency.fromUnit(this.loan.debt.model.estimatedObligation) - basaltPaid);
      this.paid = Utils.formatAmount(currency.fromUnit(this.loan.debt.model.paid));
    }

    this.isDiaspore = this.loan.network === Network.Diaspore;

    if (this.loan.network === Network.Diaspore) {
      const installments: number = this.loan.descriptor.installments;
      const installmentDuration: string = Utils.formatDelta(this.loan.descriptor.duration / this.loan.descriptor.installments);
      const installmentAmount: number = this.loan.currency.fromUnit(this.loan.descriptor.firstObligation);
      const installmentCurrency: string = this.loan.currency.symbol;
      const nextInstallment: number = this.isRequest ? 1 : null; // TODO - Next installment
      const addSuffix = (n) => ['st', 'nd', 'rd'][((n + 90) % 100 - 10) % 10 - 1] || 'th';

      this.diasporeData = [
        ['Installments', 'Duration', 'Cuota'],
        [
          installments,
          installmentDuration,
          `${ installmentAmount } ${ installmentCurrency }`
        ]
      ];

      this.nextInstallment = {
        installment: `${ nextInstallment + addSuffix(nextInstallment) } Pay`,
        amount: `${ Utils.formatAmount(installmentAmount) } ${ installmentCurrency }`,
        dueDate: installmentDuration,
        dueTime: null
      };
    }
    this.loadUserActions();
  }

  private loadUserActions() {
    if (!this.loan) {
      return;
    }

    switch (this.loan.status) {
      case Status.Request: {
        this.loanStatusRequest();
        break;
      }
      case Status.Ongoing: {
        this.loanOnGoingorIndebt();
        break;
      }
      case Status.Paid: {
        this.invalidActions();
        break;
      }
      case Status.Expired: {
        this.invalidActions();
        break;
      }
      case Status.Destroyed: {
        this.invalidActions();
        break;
      }
      case Status.Indebt: {
        this.loanOnGoingorIndebt();
        break;
      }
      default: {
        break;
      }
    }
  }

  private invalidActions() {
    this.canLend = false;
    this.canPay = false;
    this.canTransfer = false;
    this.canCancel = false;
  }

  private loanOnGoingorIndebt() {
    if (this.loan.debt !== undefined && this.userAccount) {
      const isDebtOwner = this.userAccount.toUpperCase() === this.loan.debt.owner.toUpperCase();
      this.canTransfer = isDebtOwner;
      this.canCancel = false;
      this.canPay = !isDebtOwner;
      this.canLend = false;
    }
  }

  private loanStatusRequest() {
    if (this.userAccount) {
      const isBorrower = this.loan.borrower.toUpperCase() === this.userAccount.toUpperCase();
      this.canLend = !isBorrower;
      this.canPay = false;
      this.canTransfer = false;
      this.canCancel = isBorrower;
    }
  }

  private formatInterest(interest: number): string {
    return Number(interest.toFixed(2)).toString();
  }

  private formatTimestamp(timestamp: number): string {
    return new DatePipe('en-US').transform(timestamp * 1000, 'dd.MM.yyyy');
  }
}
