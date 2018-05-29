import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
// App Component
import { MaterialModule } from './../material/material.module';
import { SharedModule } from './../shared/shared.module';
import { DialogApproveContractComponent } from '../dialogs/dialog-approve-contract/dialog-approve-contract.component';
import { MatDialog, MatSnackBar, MatDialogRef } from '@angular/material';
import { Web3Service } from '../services/web3.service';
import { Router } from '@angular/router';

// App Component

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, AfterViewInit {
  account: string;
  makeRotate = false;
  profile: boolean;
  constructor(
    public dialog: MatDialog,
    private web3: Web3Service,
    private router: Router,
  ) {
    console.log(this.profile);
  }
  @ViewChild('tref', {read: ElementRef}) tref: ElementRef;

  handleProfile() {
    this.profile = !this.profile;
    if (this.profile) {
      this.router.navigate(['/profile/']).then(nav => {
        console.log(nav); // true if navigation is successful
      }, err => {
        console.log(err); // when there's an error
      });
    } else {
      this.router.navigate(['/requests/']).then(nav => {
        console.log(nav); // true if navigation is successful
      }, err => {
        console.log(err); // when there's an error
      });
    }
  }
  openDialog() {
    const dialogRef: MatDialogRef<DialogApproveContractComponent> = this.dialog.open(DialogApproveContractComponent, {
      width: '800px'
    });
    dialogRef.componentInstance.autoClose = false;
    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialog result: ${result}');
      this.makeRotate = false;
    });
  }
  ngAfterViewInit(): any {}
  ngOnInit() {
    this.web3.getAccount().then((account) => {
      this.account = account;
    });
  }
}


