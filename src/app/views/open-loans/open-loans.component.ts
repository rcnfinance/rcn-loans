import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
// App Models
import { Loan } from './../../models/loan.model';
// App Spinner
import { NgxSpinnerService } from 'ngx-spinner';
// App Components
import { DialogInsufficientFoundsComponent } from '../../dialogs/dialog-insufficient-founds/dialog-insufficient-founds.component';
// App Services
import { Utils } from './../../utils/utils';
import { TxService, Tx } from './../../tx.service';
import { ContractsService } from './../../services/contracts.service';
import { BrandingService } from './../../services/branding.service';
import { CivicService } from '../../services/civic.service';
import { Web3Service } from '../../services/web3.service';
import { AvailableLoansService } from '../../services/available-loans.service';

@Component({
  selector: 'app-open-loans',
  templateUrl: './open-loans.component.html',
  styleUrls: ['./open-loans.component.scss']
})
export class OpenLoansComponent implements OnInit{
  public loading: boolean;
  available: any;
  loans = [];
  availableLoans = true;
  pendingLend = [];

  constructor(
    private contractsService: ContractsService,
    private spinner: NgxSpinnerService,
    private availableLoansService: AvailableLoansService,
    public dialog: MatDialog,
  ) {}

  // Available Loans service
  upgradeAvaiblable() {
    this.availableLoansService.updateAvailable(this.loans.length);
  }

  loadLoans() {
    this.contractsService.getOpenLoans().then((result: Loan[]) => {
      this.loans = result;

    console.log(result);
      this.upgradeAvaiblable();
      this.spinner.hide();
      if (this.loans.length === 0) {
        this.availableLoans = false;
      }
    });
  }

  // Open Insufficient Founds Dialog
  openDialogFounds() {
    const dialogRef: MatDialogRef<DialogInsufficientFoundsComponent> = this.dialog.open(DialogInsufficientFoundsComponent, {});
    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }

  ngOnInit() {
    this.spinner.show(); // Initialize spinner
    this.loadLoans();

    // Available Loans service
    this.availableLoansService.currentAvailable.subscribe(available => this.available = available);
  }
}
