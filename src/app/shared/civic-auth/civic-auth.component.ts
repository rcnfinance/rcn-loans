import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { CivicService } from '../../services/civic.service';
import { MatDialogRef } from '@angular/material';
import { Web3Service } from '../../services/web3.service';

@Component({
  selector: 'app-civic-auth',
  templateUrl: './civic-auth.component.html',
  styleUrls: ['./civic-auth.component.scss']
})
export class CivicAuthComponent implements OnInit {

  constructor(
    private civicService: CivicService,
    public dialogRef: MatDialogRef<any>,
    private web3Service: Web3Service
  ) { }

  ngOnInit() {
    this.web3Service.getAccount().then((account) => {
      console.log('Start auth with account', account);
      this.civicService.signupCivic().then((token) => {
        console.log('Retrieved civic token', token);
        if (token !== undefined) {
          this.web3Service.web3.eth.sign(account, this.web3Service.web3.sha3('\x19Ethereum Signed Message:\n30' + token), (error, sig) => {
            console.log('Signed token', sig);
            this.civicService.register(token, sig).then((r) => {
              console.log('Signup done');
              this.dialogRef.close(true);
            });
          });
        } else {
          this.dialogRef.close(false);
        }
      });
    });
  }
}
