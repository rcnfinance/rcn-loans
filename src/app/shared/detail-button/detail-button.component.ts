import { Component, OnInit } from '@angular/core';
import { MaterialModule } from './../../material/material.module';
import { Router } from '@angular/router';

@Component({
  selector: 'app-detail-button',
  templateUrl: './detail-button.component.html',
  styleUrls: ['./detail-button.component.scss']
})
export class DetailButtonComponent implements OnInit {
  constructor(private router: Router) { }
  ngOnInit() {
  }
  handleDetail() {
    console.log('You have clicked Detail Button!');
    this.router.navigate(['loan/1']);
  }

}
