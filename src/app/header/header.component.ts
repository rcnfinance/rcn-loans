import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
// App Component
import { MaterialModule } from './../material/material.module';
import { SharedModule } from './../shared/shared.module';
import { DialogApproveContractComponent } from '../dialogs/dialog-approve-contract/dialog-approve-contract.component';
import {MatDialog, MatSnackBar} from '@angular/material';
import { Web3Service } from '../services/web3.service';

// App Component

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, AfterViewInit {
  account: string;

  constructor(public dialog: MatDialog, private web3: Web3Service) {}
  @ViewChild('tref', {read: ElementRef}) tref: ElementRef;

  openDialog() {
    console.log(this.dialog);
    const dialogRef = this.dialog.open(DialogApproveContractComponent, {
      width: '800px'
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }
  ngAfterViewInit(): any {}
  ngOnInit() {
    this.web3.getAccount().then((account) => {
      this.account = account;
    })
  }
}


