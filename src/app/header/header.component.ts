import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, Input, HostListener } from '@angular/core';
// App Component
import { MaterialModule } from './../material/material.module';
import { SharedModule } from './../shared/shared.module';
import { DialogApproveContractComponent } from '../dialogs/dialog-approve-contract/dialog-approve-contract.component';
import { MatDialog, MatSnackBar, MatDialogRef } from '@angular/material';
import { Router } from '@angular/router';
// App Service
import { Web3Service, Type } from '../services/web3.service';
import { ContentWrapperComponent } from '../content-wrapper/content-wrapper.component';

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

  @Input() sideBar: ContentWrapperComponent;

  @HostListener('click')
  click() {
    this.sideBar.toggle();
  }

  constructor(
    public dialog: MatDialog,
    private web3Service: Web3Service,
    private router: Router,
  ) {}
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
    if (this.hasAccount) {
      const dialogRef: MatDialogRef<DialogApproveContractComponent> = this.dialog.open(DialogApproveContractComponent, {
        width: '800px'
      });
      dialogRef.componentInstance.autoClose = false;
      dialogRef.afterClosed().subscribe(result => {
        console.log(`Dialog result: ${result}`);
      });
    } else {
      if (this.web3Service.web3Type === Type.Injected) {
        window.open('https://metamask.io/', '_blank');
      } else {
        alert(
          'Couldn\'t get any accounts! Make sure your Ethereum client is unlocked and configured correctly.'
        );
      }
    }
  }
  ngAfterViewInit(): any {}
  ngOnInit() {
    this.web3Service.getAccount().then((account) => {
      this.account = account;
    });
  }
  get hasAccount(): boolean {
    return this.account !== undefined;
  }
}


