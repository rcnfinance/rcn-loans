import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-pay-form',
  templateUrl: './pay-form.component.html',
  styleUrls: ['./pay-form.component.scss']
})
export class PayFormComponent implements OnInit {
  @Output() submitTransfer = new EventEmitter<any>();

  constructor() {}

 onSubmit(event: any, form: NgForm) {
    event.preventDefault();
    const to = form.value;
    this.submitTransfer.emit(to);
  }

  ngOnInit() {
  }
}
