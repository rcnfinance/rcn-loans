import { Component, OnInit, OnChanges, Input } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ChainService } from 'app/services/chain.service';
import { CurrenciesService } from 'app/services/currencies.service';
import { Loan, Status, LoanType } from 'app/models/loan.model';
import { Brand } from 'app/models/brand.model';
import { Utils } from 'app/utils/utils';
import { DialogPohComponent } from 'app/dialogs/dialog-poh/dialog-poh.component';

@Component({
  selector: 'app-loan-overview-panel',
  templateUrl: './loan-overview-panel.component.html',
  styleUrls: ['./loan-overview-panel.component.scss']
})
export class LoanOverviewPanelComponent implements OnInit, OnChanges {
  @Input() loan: Loan;
  @Input() brand: Brand;
  @Input() loanType: LoanType;
  hasOracle: boolean;
  amountBorrow: number;
  amountRepay: number;
  interestRate: number;
  interestPunitory: number;
  duration: string;
  durationTooltip: string;
  paymentDate: string[] = [];
  paymentAverage: string;
  paymentAverageAmount: number;
  timelineTooltip: string;
  timelineIcon: string;
  timelineIconType: 'material' | 'fontawesome' | 'fontello' | 'image';

  constructor(
    private dialog: MatDialog,
    private chainService: ChainService,
    private currenciesService: CurrenciesService
  ) { }

  ngOnInit() {
    const { loan } = this;
    if (!loan) return;

    this.loadOracle();
    this.loadLoanDetail();
    this.loadInstallments();
  }

  ngOnChanges() {
    this.loadLoanDetail();
    this.loadInstallments();
  }

  /**
   * Click on 'borrower' address
   * @param address Borrower address
   */
  clickBorrower(address: string) {
    const { poh } = this.loan;
    if (poh) {
      this.dialog.open(DialogPohComponent, {
        panelClass: 'dialog-poh-wrapper',
        data: { address }
      });
      return;
    }

    this.openAddress(address);
  }

  /**
   * Open an address in etherscan
   * @param address Borrower address
   */
  openAddress(address: string) {
    const { config } = this.chainService;
    window.open(config.network.explorer.address.replace('${address}', address));
  }

  /**
   * Set loan oracle
   */
  private loadOracle() {
    const { engine, currency } = this.loan;
    const { config } = this.chainService;
    const engineToken = config.contracts[engine].token;
    const engineCurrency = this.currenciesService.getCurrencyByKey('address', engineToken);
    this.hasOracle = currency.toString() !== engineCurrency.symbol;
  }

  /**
   * Set loan interest, duration and timeline
   */
  private loadLoanDetail() {
    const { status, amount } = this.loan;
    const { punitiveInterestRate, interestRate, totalObligation } = this.loan.descriptor;
    const { currency } = this.loan;

    // set amounts
    this.amountBorrow = currency.fromUnit(amount);
    this.amountRepay = currency.fromUnit(totalObligation);

    switch (this.loan.status) {
      case Status.Expired:
      case Status.Destroyed:
      case Status.Request:
        // set interest
        const { duration } = this.loan.descriptor;
        const formattedDduration: string = Utils.formatDelta(duration);
        this.interestRate = interestRate;
        this.interestPunitory = punitiveInterestRate;

        // set duration
        this.duration = formattedDduration;
        this.durationTooltip = formattedDduration + ' Duration';

        // set timeline
        this.timelineIconType = 'material';
        this.timelineTooltip = status === Status.Request ?
          '< > Requested' :
          'Expired';
        this.timelineIcon = status === Status.Request ?
          'code' :
          'delete';
        break;

      case Status.Indebt:
      case Status.Ongoing:
      case Status.Paid:
        // set interest
        const currentInterestRate = status === Status.Indebt ? punitiveInterestRate : interestRate;
        this.interestRate = currentInterestRate;

        // set duration
        const durationDynamic = status !== Status.Paid ?
          Utils.formatDelta(this.loan.debt.model.dueTime - (new Date().getTime() / 1000)) :
          '-';
        this.duration = durationDynamic;
        this.durationTooltip = status === Status.Indebt ?
          `Overdue for ${ durationDynamic }` :
          `Next payment in ${ durationDynamic }`;

        // set timeline
        this.timelineTooltip = status === Status.Paid ?
          'Fully Paid' :
          'Outstanding';
        this.timelineIconType = status === Status.Paid ?
          'fontello' :
          'material';
        this.timelineIcon = status === Status.Paid ?
          'icon-verified-24px' :
          'trending_up';
        break;
      default:
        break;
    }
  }

  /**
   * Load loan instalments and payments status
   */
  private loadInstallments() {
    const loan: Loan = this.loan;
    const nowDate: number = Math.floor(new Date().getTime() / 1000);
    const { installments = 1, frequency } = loan.descriptor;
    const installmentDays = ['0'];

    // load installments days
    Array.from(Array(installments)).map((_: any, i: number) => {
      const installmentNumber = i + 1;
      installmentDays.push(Utils.formatDelta(frequency * installmentNumber));
    });
    this.paymentDate = installmentDays;

    // load installments average
    const startDate = [Status.Request, Status.Expired].includes(loan.status) ? nowDate : loan.config.lentTime;
    const endDate = startDate + (installments * frequency);

    const MAX_AVERAGE = 100;
    const SECONDS_IN_DAY = 24 * 60 * 60;
    const diffDays = (endDate - startDate) / SECONDS_IN_DAY;
    const diffToNowDays = (endDate - nowDate) / SECONDS_IN_DAY;
    const daysAverage = 100 - ((diffToNowDays * 100) / diffDays);
    this.paymentAverage = `${ daysAverage > MAX_AVERAGE ? MAX_AVERAGE : daysAverage }%`;
    this.paymentAverageAmount = Math.round(daysAverage > MAX_AVERAGE ? MAX_AVERAGE : daysAverage);
  }
}
