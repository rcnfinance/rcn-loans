import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Route } from '@angular/compiler/src/core';
import { Loan } from '../../../models/loan.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-detail-identity',
  templateUrl: './detail-identity.component.html',
  styleUrls: ['./detail-identity.component.scss']
})
export class DetailIdentityComponent implements OnInit {
  @Input() loan: Loan;
  identity: any;
  constructor(
    private route: ActivatedRoute
  ) { }

  hasIdentity(): any {
    if (this.identity === undefined) {console.log(this.identity); return undefined; } else {
      console.log(this.identity);
      return true;
    }
  }

  ngOnInit() {
    this.route.parent.params.subscribe(params => {
      const id = +params['id']; // (+) converts string 'id' to a number
      console.log(id);
   });
  }

  get borrowerLinkExplorer(): string {
    return environment.network.explorer.address.replace('${address}', this.loan.borrower);
  }
}
