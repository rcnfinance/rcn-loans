import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import {MatSnackBar} from '@angular/material';

// App Component

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, AfterViewInit {
  constructor() {}

  @ViewChild('tref', {read: ElementRef}) tref: ElementRef;

  ngAfterViewInit(): any {
      console.log(this.tref.nativeElement.textContent);
  }
  ngOnInit() {
  }

}


