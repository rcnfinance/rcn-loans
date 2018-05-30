import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class FormComponent implements OnInit {
  options: FormGroup;
  constructor(fb: FormBuilder) {
    this.options = fb.group({
      'color': 'primary',
      'fontSize': [16, Validators.min(10)],
    });
  }
  getFontSize() {
    return Math.max(10, this.options.value.fontSize);
  }

  ngOnInit() {
  }

}
