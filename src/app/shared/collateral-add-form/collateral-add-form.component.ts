import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-collateral-add-form',
  templateUrl: './collateral-add-form.component.html',
  styleUrls: ['./collateral-add-form.component.scss']
})
export class CollateralAddFormComponent implements OnInit {
  @Output() submitAdd = new EventEmitter<any>();

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
    this.submitAdd.emit(amount);
  }
}
