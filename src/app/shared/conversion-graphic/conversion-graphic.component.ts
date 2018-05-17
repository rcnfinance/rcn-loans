import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-conversion-graphic',
  templateUrl: './conversion-graphic.component.html',
  styleUrls: ['./conversion-graphic.component.scss']
})
export class ConversionGraphicComponent implements OnInit {
  @Input() headers: string[];
  @Input() amountLeft: number;
  @Input() amountRight: number;
  constructor() { }

  ngOnInit() {
  }

}
