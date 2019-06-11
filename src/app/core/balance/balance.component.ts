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

  loansWithBalance: number[]; // Balance bar
  ongoingWithdraw: Tx;

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
      this.loansWithBalance !== undefined &&
      this.loansWithBalance.length > 0 &&
      this.ongoingWithdraw === undefined;

    if (this.ongoingWithdraw !== undefined) {
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
    const r = await this.contractService.getPendingWithdraws();
    this.rcnAvailable = r[0] / 10 ** 18;
    this.loansWithBalance = r[1];
    this.loadOngoingWithdraw();
    this.updateDisplay();
  }

  async loadRcnBalance() {
    this.rcnBalance = (await this.contractService.getUserBalanceRCN() as any).toNumber();
    this.updateDisplay();
  }

  loadOngoingWithdraw() {
    this.ongoingWithdraw = this.txService.getLastWithdraw(
      environment.contracts.basaltEngine,
      this.loansWithBalance
    );
  }

  async clickWithdraw() {
    if (this.canWithdraw) {
      const tx = await this.contractService.withdrawFunds(this.loansWithBalance);
      this.txService.registerWithdrawTx(tx, environment.contracts.basaltEngine, this.loansWithBalance, this.account);
      this.loadWithdrawBalance();
    }
  }
}
