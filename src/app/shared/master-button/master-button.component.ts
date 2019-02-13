import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
// App Model
import { Loan } from 'app/models/loan.model';
// App Services
import { MasterButtonService } from 'app/services/master-button.service';

@Component({
  selector: 'app-master-button',
  templateUrl: './master-button.component.html',
  styleUrls: ['./master-button.component.scss']
})
export class MasterButtonComponent implements OnInit {
  @Input() action: string;
  @Output() actionEvent = new EventEmitter<string>();
  buttonText: string;

  constructor(
    public masterButtonService: MasterButtonService
  ) {
    this.buttonText = this.masterButtonService.buttonText;
  }

  sendClickEvent() {
    this.actionEvent.emit(this.action);
  }

  ngOnInit() {}

}
