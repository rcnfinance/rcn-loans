import { Component, OnInit } from '@angular/core';
// App Component
import { MatDialog } from '@angular/material';
import { Web3Service } from '../../services/web3.service';
import { Utils } from '../../utils/utils';
import { ContractsService } from '../../services/contracts.service';

@Component({
  selector: 'app-dialog-approve-contract',
  templateUrl: './dialog-approve-contract.component.html',
  styleUrls: ['./dialog-approve-contract.component.scss']
})
export class DialogApproveContractComponent implements OnInit {
  lender: string;
  isApproved: boolean;
  constructor(
    private web3Service: Web3Service,
    private contracts: ContractsService,
    public dialog: MatDialog
  ) { }
  loadLender() {
    this.web3Service.getAccount().then((resolve: string) => {
      this.lender = resolve;
    });
  }
  loadApproved() {
    this.contracts.isEngineApproved().then((approved) => {
      this.isApproved = approved;
    });
  }
  clickCheck() {
    if (this.isApproved) {
      this.contracts.dissaproveEngine().then(() => {
        this.loadApproved();
      });
    } else {
      this.contracts.approveEngine().then(() => {
        this.loadApproved();
      });
    }
  }
  ngOnInit() {
    this.loadLender();
    this.loadApproved();
  }
}
