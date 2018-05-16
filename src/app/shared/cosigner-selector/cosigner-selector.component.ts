import { Component, Input, OnChanges, Output, EventEmitter } from '@angular/core';

import { CosignerOption } from './../../models/cosigner.model';
import { Loan } from '../../models/loan.model';

@Component({
  selector: 'app-cosigner-selector',
  templateUrl: './cosigner-selector.component.html',
  styleUrls: ['./cosigner-selector.component.scss']
})
export class CosignerSelectorComponent {
  @Input() option: CosignerOption;
  // @Output() onSelected: EventEmitter<CosignerOption> = new EventEmitter<CosignerOption>();
  constructor() {}
  hasOptions(): Boolean {
    return this.option !== undefined;
  }
  /*
  onChanged(option): Boolean {
    this.onSelected.emit(this.options.find(o => o.id === option));
    return true;
  }
  */
}
