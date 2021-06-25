import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Web3Service } from './../../services/web3.service';

@Component({
  selector: 'app-dialog-need-withdraw',
  templateUrl: './dialog-need-withdraw.component.html',
  styleUrls: ['./dialog-need-withdraw.component.scss']
})
export class DialogNeedWithdrawComponent implements OnInit {
  address: string;

  constructor(
    public dialogRef: MatDialogRef<DialogNeedWithdrawComponent>,
    private web3Service: Web3Service
  ) {}

  async ngOnInit() {
    this.address = await this.web3Service.getAccount();
    this.dialogRef.updateSize('auto', 'auto');
  }
}
