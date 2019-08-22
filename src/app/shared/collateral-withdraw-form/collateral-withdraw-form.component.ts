import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-collateral-withdraw-form',
  templateUrl: './collateral-withdraw-form.component.html',
  styleUrls: ['./collateral-withdraw-form.component.scss']
})
export class CollateralWithdrawFormComponent implements OnInit {
  @Output() submitWithdraw = new EventEmitter<number>();

  form: FormGroup;

  constructor() {}

  ngOnInit() {
    this.form = new FormGroup({
      amount: new FormControl(null, [
        Validators.required,
        Validators.min(0)
      ])
    });
  }

  onSubmit(form: FormGroup) {
    const amount = form.value.amount;
    this.submitWithdraw.emit(amount);
  }
}
