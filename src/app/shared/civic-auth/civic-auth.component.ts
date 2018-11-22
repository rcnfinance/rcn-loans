import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';

import { CivicService } from '../../services/civic.service';
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
      console.info('Start auth with account', account);
      this.civicService.signupCivic().then((token) => {
        console.info('Retrieved civic token', token);
        if (token !== undefined) {
          this.web3Service.opsWeb3.eth.sign(
            account, this.web3Service.web3.sha3('\x19Ethereum Signed Message:\n30' + token
          ), (_error, sig) => {
            console.info('Signed token', sig);
            this.civicService.register(token, sig).then(() => {
              console.info('Signup done');
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
