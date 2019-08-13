import { Component, Output, EventEmitter } from '@angular/core';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-collateral-add-form',
  templateUrl: './collateral-add-form.component.html',
  styleUrls: ['./collateral-add-form.component.scss']
})
export class CollateralAddFormComponent {
  @Output() submitAdd = new EventEmitter<any>();

  constructor() {}

  onSubmit(event: any, form: NgForm) {
    event.preventDefault();
    const to = form.value;
    this.submitAdd.emit(to);
  }
}
