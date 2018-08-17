import { Component, OnInit } from '@angular/core';
// App Component
import { MatDialog, MatDialogRef } from '@angular/material';
import { Web3Service } from '../../services/web3.service';
import { ContractsService } from '../../services/contracts.service';
import { EventsService, Category } from '../../services/events.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-dialog-approve-contract',
  templateUrl: './dialog-approve-contract.component.html',
  styleUrls: ['./dialog-approve-contract.component.scss']
})
export class DialogApproveContractComponent implements OnInit {
  autoClose: boolean;
  lender: string;
  isApproved: boolean;

  constructor(
    private web3Service: Web3Service,
    private contracts: ContractsService,
    private eventsService: EventsService,
    public dialog: MatDialog,
    private dialogRef: MatDialogRef<DialogApproveContractComponent>
  ) { }

  loadLender() {
    this.web3Service.getAccount().then((resolve: string) => {
      this.lender = resolve;
    });
  }
  loadApproved(): Promise<any> {
    return this.contracts.isEngineApproved().then((approved) => {
      this.isApproved = approved;
    });
  }
  get isEnabled(): boolean {
    return this.isApproved !== undefined;
  }
  clickCheck() {
    let action;
    let actionCode;

    if (this.isApproved) {
      actionCode = 'dissaprove';
      action = this.contracts.dissaproveEngine();
    } else {
      actionCode = 'approve';
      action = this.contracts.approveEngine();
    }

    this.eventsService.trackEvent(
      'click-' + actionCode + '-basalt-rcn',
      Category.Account,
      environment.contracts.basaltEngine
    );

    action.then(() => {
      this.loadApproved().then(() => {
        this.eventsService.trackEvent(
          actionCode + '-basalt-rcn',
          Category.Account,
          environment.contracts.basaltEngine
        );
        if (this.autoClose) {
          this.dialogRef.close(this.isApproved);
        }
      });
    });
  }
  ngOnInit() {
    this.loadLender();
    this.loadApproved();
  }
}
