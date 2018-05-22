import { Component, OnInit } from '@angular/core';
// App Component
import { MatDialog, MatDialogRef } from '@angular/material';
import { Web3Service } from '../../services/web3.service';
import { Utils } from '../../utils/utils';
import { ContractsService } from '../../services/contracts.service';

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
    if (this.isApproved) {
      action = this.contracts.dissaproveEngine();
    } else {
      action = this.contracts.approveEngine();
    }

    action.then(() => {
      this.loadApproved().then(() => {
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
