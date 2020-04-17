import { Component, OnInit, Input } from '@angular/core';

interface ErrorButton {
  text: string;
  url: string;
  class: string;
  target?: string;
}

@Component({
  selector: 'app-error-details',
  templateUrl: './error-details.component.html',
  styleUrls: ['./error-details.component.scss']
})
export class ErrorDetailsComponent implements OnInit {

  @Input() label: string;
  @Input() title: string;
  @Input() description: string;
  @Input() image: string;
  @Input() buttons: ErrorButton[];
  @Input() disclaimer: string;

  constructor() { }

  ngOnInit() {
  }

}
