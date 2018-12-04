import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-filters-form',
  templateUrl: './filters-form.component.html',
  styleUrls: ['./filters-form.component.scss']
})
export class FiltersFormComponent implements OnInit {
  panelOpenState = false;

  form = new FormGroup({
    currency: new FormControl('', Validators.required),
    amount: new FormControl('', Validators.required)
  });

  get currency() {
    return this.form.get('currency');
  }

  get amount() {
    return this.form.get('amount');
  }

  constructor() { }

  currencyChange() {
    console.log(this.currency);
  }

  ngOnInit() {
  }

}
