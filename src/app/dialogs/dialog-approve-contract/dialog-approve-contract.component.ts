import { Component, OnInit } from '@angular/core';
// App Component
import { MatDialog } from '@angular/material';
import { Web3Service } from '../../services/web3.service';
import { Utils } from '../../utils/utils';

@Component({
  selector: 'app-dialog-approve-contract',
  templateUrl: './dialog-approve-contract.component.html',
  styleUrls: ['./dialog-approve-contract.component.scss']
})
export class DialogApproveContractComponent implements OnInit {
  lender: string;
  constructor(
    private web3Service: Web3Service,
    public dialog: MatDialog
  ) { }

  loadLender() {
    this.web3Service.getAccount().then((resolve: string) => {
      this.lender = resolve;
    });
  }
  ngOnInit() {
    this.loadLender();
  }

}
