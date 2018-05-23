import { Component, OnInit } from '@angular/core';
import { Web3Service } from '../../services/web3.service';
// App Component
import { MaterialModule } from './../../material/material.module';
import { SharedModule } from './../../shared/shared.module';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  lender: string;
  constructor(
    private web3Service: Web3Service
  ) { }

  loadLender() {
    this.web3Service.getAccount().then((resolve: string) => {
      this.lender = resolve;
    });
  }

  ngOnInit() {
    this.loadLender();
  }

}
