import { Component, OnInit } from '@angular/core';
import { Web3Service } from '../../services/web3.service';
import { ContractsService } from '../../services/contracts.service';
import { Tx, TxService } from '../../tx.service';
import { environment } from '../../../environments/environment';
import { Utils } from '../../utils/utils';

@Component({
  selector: 'app-component-balance',
  templateUrl: './balance.component.html',
  styleUrls: ['./balance.component.scss']
})
export class BalanceComponent implements OnInit {
  private account: string;

  private rcnBalance: number;
  private rcnAvailable: number;
  private basaltRcnAvailable: number;
  private diasporeRcnAvailable: number;

  basaltLoansWithBalance: number[];
  diasporeLoansWithBalance: number[];
  ongoingBasaltWithdraw: Tx;
  ongoingDiasporeWithdraw: Tx;

  canWithdraw = false;
  displayBalance = '';
  displayAvailable = '';

  constructor(
    private web3Service: Web3Service,
    private contractService: ContractsService,
    private txService: TxService
  ) {}

  ngOnInit(): void {
    this.web3Service.loginEvent.subscribe(() => this.loadLogin());
    this.loadLogin();
  }

  updateDisplay() {
    if (this.rcnBalance) {
      this.displayBalance = Utils.formatAmount(this.rcnBalance);
    } else {
      this.displayBalance = '0';
    }

    if (this.rcnAvailable) {
      this.displayAvailable = Utils.formatAmount(this.rcnAvailable);
    } else {
      this.displayAvailable = '0';
    }

    this.canWithdraw =
      this.basaltLoansWithBalance !== undefined || this.diasporeLoansWithBalance !== undefined &&
      this.basaltLoansWithBalance.length > 0 || this.diasporeLoansWithBalance.length > 0 &&
      this.ongoingBasaltWithdraw === undefined || this.ongoingDiasporeWithdraw === undefined;

    if (this.ongoingBasaltWithdraw !== undefined || this.ongoingDiasporeWithdraw !== undefined) {
      this.displayBalance = Utils.formatAmount(
        this.rcnBalance + this.rcnAvailable
      ); }
  }

  async loadLogin() {
    if (!this.account) {
      this.account = await this.web3Service.getAccount();
      this.loadRcnBalance();
      this.loadWithdrawBalance();
    }
  }

  async loadWithdrawBalance() {
    const pendingWithdraws = await this.contractService.getPendingWithdraws();
    console.log('pending Withdraws', pendingWithdraws);
    this.basaltRcnAvailable = pendingWithdraws[0] / 10 ** 18;
    this.diasporeRcnAvailable = pendingWithdraws[2] / 10 ** 18;
    this.rcnAvailable = this.basaltRcnAvailable + this.diasporeRcnAvailable;
    this.basaltLoansWithBalance = pendingWithdraws[1];
    this.diasporeLoansWithBalance = pendingWithdraws[3];
    this.loadOngoingWithdraw();
    this.updateDisplay();
  }

  async loadRcnBalance() {
    this.rcnBalance = (await this.contractService.getUserBalanceRCN() as any).toNumber();
    this.updateDisplay();
  }

  loadOngoingWithdraw() {
    this.ongoingBasaltWithdraw = this.txService.getLastWithdraw(
      environment.contracts.basaltEngine,
      this.basaltLoansWithBalance
    );
    this.ongoingDiasporeWithdraw = this.txService.getLastWithdraw(
      environment.contracts.diaspore.debtEngine,
      this.diasporeLoansWithBalance
    );
  }

  async clickWithdraw() {
    if (this.canWithdraw) {
      console.log('withdrawing trancasction');
      if (this.basaltLoansWithBalance.length > 0) {
        const tx = await this.contractService.withdrawFundsBasalt(this.basaltLoansWithBalance);
        this.txService.registerWithdrawTx(tx, environment.contracts.basaltEngine, this.basaltLoansWithBalance);
      }
      if (this.diasporeLoansWithBalance.length > 0) {
        console.log('registering Withdraw transaction');
        const tx = await this.contractService.withdrawFundsDiaspore(this.diasporeLoansWithBalance);
        this.txService.registerWithdrawTx(tx, environment.contracts.diaspore.debtEngine, this.diasporeLoansWithBalance);
      }
      this.loadWithdrawBalance();
    }
  }
}
