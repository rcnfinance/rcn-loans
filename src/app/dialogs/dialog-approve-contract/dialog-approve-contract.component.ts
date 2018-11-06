import { Component, OnInit } from '@angular/core';
// App Component
import { MatDialog, MatDialogRef } from '@angular/material';
import { Web3Service } from '../../services/web3.service';
import { ContractsService } from '../../services/contracts.service';
import { EventsService, Category } from '../../services/events.service';
import { environment } from '../../../environments/environment';

class Contract {
  isApproved: boolean;
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
  account: string;
  contracts: Contract[] = [
    new Contract('Diaspore Loan manager', environment.contracts.diaspore.loanManager),
    new Contract('Diaspore Debt mananger', environment.contracts.diaspore.debtEngine),
    new Contract('Basalt engine', environment.contracts.basaltEngine)
  ];

  constructor(
    private web3Service: Web3Service,
    private contractsService: ContractsService,
    private eventsService: EventsService,
    public dialog: MatDialog,
    private dialogRef: MatDialogRef<DialogApproveContractComponent>
  ) { }

  async loadAccount() {
    this.account = await this.web3Service.getAccount();
  }
  async loadApproved(): Promise<any> {
    const promises = [];
    this.contracts.forEach(c => {
      promises.push(
        new Promise(async () => {
          c.isApproved = await this.contractsService.isApproved(c.address);
          console.info(c.name, c.address, 'Approved', c.isApproved);
        })
      );
    });
    await Promise.all(promises);
  }

  isEnabled(contract: Contract): boolean {
    return contract.isApproved !== undefined;
  }

  async clickCheck(contract: Contract, event: any) {
    let action;
    let actionCode;

    try {
      if (!event.checked) {
        actionCode = 'disapprove' + contract.name;
        action = this.contractsService.disapprove(contract.address);
      } else {
        actionCode = 'approve-' + contract.name;
        action = this.contractsService.approve(contract.address);
      }

      this.eventsService.trackEvent(
        'click-' + actionCode + '-basalt-rcn',
        Category.Account,
        environment.contracts.basaltEngine
      );

      await action;

      this.eventsService.trackEvent(
        actionCode + '-rcn',
        Category.Account,
        environment.contracts.basaltEngine
      );

      if (this.onlyAddress) {
        this.dialogRef.close(event.checked);
      }
    } catch (e) {
      console.info('Approve rejected');
      event.source.checked = !event.checked;
      return;
    } finally {
      await this.loadApproved();
    }
  }

  ngOnInit() {
    this.loadAccount();
    this.loadApproved();
  }
}
