import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
// App Spinner
import { NgxSpinnerService } from 'ngx-spinner';
// App Services
import { Web3Service } from '../../services/web3.service';

@Component({
  selector: 'app-address',
  templateUrl: './address.component.html',
  styleUrls: ['./address.component.scss']
})
export class AddressComponent implements OnInit {
  address: string;
  available: any;
  loans = [];
  availableLoans = true;
  path: any;
  myAddress: boolean;

  constructor(
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private web3Service: Web3Service,
    private location: Location
  ) {}

  ngOnInit() {
    this.spinner.show();
    this.route.params.subscribe(async params => {
      const web3 = this.web3Service.web3;
      const urlAddress = web3.toChecksumAddress(params['address']);
      let account = await this.web3Service.getAccount();
      account = web3.toChecksumAddress(account);

      this.address = urlAddress;

      if (account === urlAddress) {
        this.myAddress = true;
      }
    });
  }

  get activeTab() {
    const path = this.location.path();
    if (path.includes('borrowed')) return 'borrowed';
    if (path.includes('lent')) return 'lent';
  }

}
