import { Component, OnInit } from '@angular/core';
// App Component
import { MatDialog, MatDialogRef } from '@angular/material';
import { Web3Service } from '../../services/web3.service';
import { ContractsService } from '../../services/contracts.service';
import { CurrenciesService, Currency } from '../../services/currencies.service';
import { EventsService, Category } from '../../services/events.service';
import { environment } from '../../../environments/environment';

class Contract {
  isApproved = {};
  constructor(
    public name: string,
    public address: string
  ) { }
}

@Component({
  selector: 'app-dialog-approve-contract',
  templateUrl: './dialog-approve-contract.component.html',
  styleUrls: ['./dialog-approve-contract.component.scss']
})
export class DialogApproveContractComponent implements OnInit {
  onlyAddress: string;
  onlyToken: string;
  account: string;
  currencies: Currency[];
  contracts: Contract[] = [
    new Contract('Diaspore Loan manager', environment.contracts.diaspore.loanManager),
    new Contract('Diaspore Debt mananger', environment.contracts.diaspore.debtEngine),
    new Contract('Diaspore Collateral', environment.contracts.diaspore.collateral),
    new Contract('Diaspore Converter ramp', environment.contracts.converter.converterRamp),
    new Contract('Basalt engine', environment.contracts.basaltEngine)
  ];

  constructor(
    private web3Service: Web3Service,
    private contractsService: ContractsService,
    private currenciesService: CurrenciesService,
    private eventsService: EventsService,
    public dialog: MatDialog,
    private dialogRef: MatDialogRef<DialogApproveContractComponent>
  ) { }

  async ngOnInit() {
    await this.loadAccount();
    await this.loadContracts();
    this.loadApproved();
  }

  /**
   * Set account address
   */
  async loadAccount() {
    this.account = await this.web3Service.getAccount();
  }

  /**
   * Load contracts and tokens
   */
  loadContracts() {
    const currencies: Array<Currency> = this.currenciesService.getCurrencies(true);
    this.currencies = currencies.filter(currency => currency.symbol !== 'ETH');
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

  async clickCheck(contract: Contract, event: any, currency: Currency) {
    let action;
    let actionCode;

    try {
      if (!event.checked) {
        actionCode = `disapprove${ contract.name }`;
        action = this.contractsService.disapprove(contract.address, currency.address);
      } else {
        actionCode = `disapprove${ contract.name }`;
        action = this.contractsService.approve(contract.address, currency.address);
      }

      this.eventsService.trackEvent(
        `click-${ actionCode }-basalt-rcn`,
        Category.Account,
        environment.contracts.basaltEngine
      );

      await action;

      this.eventsService.trackEvent(
        `${ actionCode }-rcn`,
        Category.Account,
        environment.contracts.basaltEngine
      );

    } catch (e) {
      console.info('Approve rejected', e);
      event.source.checked = !event.checked;
      return;
    } finally {
      await this.loadApproved();
    }
  }
}
