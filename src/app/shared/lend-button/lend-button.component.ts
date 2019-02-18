import {
  Component,
  OnInit,
  Input,
  Output
} from '@angular/core';
import { EventEmitter } from '@angular/core';
// App Services
import { ActionsTriggerService } from 'app/services/actions-trigger.service';
import { Loan } from './../../models/loan.model';
import { Tx } from './../../tx.service';
import { CountriesService } from '../../services/countries.service';

@Component({
  selector: 'app-lend-button',
  templateUrl: './lend-button.component.html',
  styleUrls: ['./lend-button.component.scss']
})
export class LendButtonComponent implements OnInit {
  @Input() loan: Loan;
  @Output() actionEvent = new EventEmitter<string>();
  @Input() enabledButton: Boolean;
  @Input() opPending: boolean;
  @Input() buttonText: any;
  pendingTx: Tx = undefined;
  lendEnabled: Boolean;

  constructor(
    private actionsTriggerService: ActionsTriggerService,
    private countriesService: CountriesService
  ) {}

  sendClickEvent() {
    this.actionEvent.emit(this.buttonText);
  }

  ngOnInit() {
    this.countriesService.lendEnabled().then((lendEnabled) => {
      this.lendEnabled = lendEnabled;
    });
  }

}
