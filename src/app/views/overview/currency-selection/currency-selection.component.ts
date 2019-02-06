import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';
import { MatSlideToggleChange, MatSlideToggle } from '@angular/material';
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
  @ViewChild('rcnSlideToggle') rcnSlideToggle: ElementRef<MatSlideToggle>;
  @ViewChild('ethSlideToggle') ethSlideToggle: ElementRef<MatSlideToggle>;
  selectedCurrency = 'rcn';
  ethAvailable = false;
  get isDesktop() { return this.breakpointObserver.isMatched('(min-width: 992px)'); }

  constructor(
    public breakpointObserver: BreakpointObserver
  ) { }

  formatAmount(amount: number): string {
    return Utils.formatAmount(amount);
  }

  selectCurrency(selection: string) {
    this.selectedCurrency = selection;

    switch (selection) {
      case 'rcn':
        console.info('this is' , this.rcnSlideToggle);
        console.info(this.rcnSlideToggle.checked);
        break;
      case 'eth':
        console.info('this is' , this.ethSlideToggle);
        console.info(this.rcnSlideToggle.checked);
        break;
      default:
        break;
    }
  }

  toggle(event: MatSlideToggleChange) {
    console.info('toggle', event.checked);
  }

  ngOnInit() {}

}
