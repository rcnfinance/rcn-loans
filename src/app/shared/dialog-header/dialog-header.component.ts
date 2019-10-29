import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-dialog-header',
  templateUrl: './dialog-header.component.html',
  styleUrls: ['./dialog-header.component.scss']
})
export class DialogHeaderComponent implements OnInit {
  @Input() title: string;

  constructor() { }

  ngOnInit() {
  }

}
