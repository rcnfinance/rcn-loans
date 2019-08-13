import { Component, Output, EventEmitter } from '@angular/core';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-collateral-withdraw-form',
  templateUrl: './collateral-withdraw-form.component.html',
  styleUrls: ['./collateral-withdraw-form.component.scss']
})
export class CollateralWithdrawFormComponent {
  @Output() submitAdd = new EventEmitter<any>();

  constructor() {}

  onSubmit(event: any, form: NgForm) {
    event.preventDefault();
    const to = form.value;
    this.submitAdd.emit(to);
  }
}
