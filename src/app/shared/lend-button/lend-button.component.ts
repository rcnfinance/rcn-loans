import {
  Component,
  OnInit,
  Input,
  Output
} from '@angular/core';
import { EventEmitter } from '@angular/core';
// App Services
import { Loan } from './../../models/loan.model';
import { Tx } from './../../tx.service';

@Component({
  selector: 'app-lend-button',
  templateUrl: './lend-button.component.html',
  styleUrls: ['./lend-button.component.scss']
})
export class LendButtonComponent implements OnInit {
  @Input() loan: Loan;
  @Input() enableRegion: Boolean; // ...
  @Input() opPending: boolean;
  @Input() buttonText: any;
  @Output() actionEvent = new EventEmitter<string>();
  pendingTx: Tx = undefined;

  constructor() {}

  sendClickEvent() {
    this.actionEvent.emit(this.buttonText);
  }

  ngOnInit() {}

}
