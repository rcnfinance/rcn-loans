import {
  Component,
  OnInit,
  Input,
  Output
} from '@angular/core';
import { EventEmitter } from '@angular/core';
import { Loan } from './../../models/loan.model';

// App Services
import { Tx } from './../../tx.service';
import { CountriesService } from '../../services/countries.service';

@Component({
  selector: 'app-lend-button',
  templateUrl: './lend-button.component.html',
  styleUrls: ['./lend-button.component.scss']
})
export class LendButtonComponent implements OnInit {
  @Input() loan: Loan;
  @Output() actionEvent = new EventEmitter<Loan>();
  pendingTx: Tx = undefined;
  lendEnabled: Boolean;
  buttonText: string;

  constructor(
    private countriesService: CountriesService
  ) {}

  sendClickEvent() {
    this.actionEvent.emit(this.loan);
  }

  ngOnInit() {
    console.info(this.buttonText);
    this.countriesService.lendEnabled().then((lendEnabled) => {
      this.lendEnabled = lendEnabled;
    });
  }

}
