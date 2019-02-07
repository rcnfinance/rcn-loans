import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { MatSlideToggle, MatSlideToggleChange } from '@angular/material';
import { BreakpointObserver } from '@angular/cdk/layout';
// App Models
import { Loan } from 'app/models/loan.model';
import { Utils } from 'app/utils/utils';

@Component({
  selector: 'app-currency-selection',
  templateUrl: './currency-selection.component.html',
  styleUrls: ['./currency-selection.component.scss']
})
export class CurrencySelectionComponent implements OnInit {
  @Input() loan: Loan;
  @ViewChild('rcnSlideToggle') rcnSlideToggle: MatSlideToggle;
  @ViewChild('ethSlideToggle') ethSlideToggle: MatSlideToggle;
  selectedCurrency = 'rcn';
  rcnAvailable = true;
  ethAvailable = true;
  get isDesktop() { return this.breakpointObserver.isMatched('(min-width: 992px)'); }

  constructor(
    public breakpointObserver: BreakpointObserver
  ) { }

  formatAmount(amount: number): string {
    return Utils.formatAmount(amount);
  }

  selectCurrency(selection: string) { // Toggle the current Slide Toggle on div (click)
    this.selectedCurrency = selection;

    switch (selection) {
      case 'rcn':
        if (this.rcnAvailable = true) {
          this.rcnSlideToggle.checked = true;
          this.ethSlideToggle.checked = false;
        }
        break;
      case 'eth':
        if (this.ethAvailable = true) {
          this.rcnSlideToggle.checked = false;
          this.ethSlideToggle.checked = true;
        }
        break;
      default:
        break;
    }
  }

  toggle(event: MatSlideToggleChange) { // Toggle the current Slide Toggle on something (change)
    switch (event.source.id) {
      case 'mat-slide-toggle-1':
        this.rcnSlideToggle.checked = true;
        this.ethSlideToggle.checked = false;
        break;
      case 'mat-slide-toggle-2':
        this.rcnSlideToggle.checked = false;
        this.ethSlideToggle.checked = true;
        break;
      default:
        break;
    }
  }

  ngOnInit() {}

}
