import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Route } from '@angular/compiler/src/core';
import { Loan } from '../../../models/loan.model';
import { environment } from '../../../../environments/environment';
import { IdentityService } from '../../../services/identity.service';
import { Identity, CompanyIdentity } from '../../../models/identity.model';

@Component({
  selector: 'app-detail-identity',
  templateUrl: './detail-identity.component.html',
  styleUrls: ['./detail-identity.component.scss']
})
export class DetailIdentityComponent implements OnInit {
  @Input() loan: Loan;
  identity: Identity;
  constructor(
    private route: ActivatedRoute,
    private identityService: IdentityService
  ) { }

  get class(): string {
    if (this.identity === undefined) { return undefined; }
    switch (this.identity.constructor) {
      case CompanyIdentity:
        return 'company';
      default:
        return undefined;
    }
  }

  hasIdentity(): boolean {
    if (this.identity === undefined) { return undefined; } else {
      return true;
    }
  }

  ngOnInit() {
    this.identityService.getIdentity(this.loan).then((identity) => {
      this.identity = identity;
    });
  }

  get borrowerLinkExplorer(): string {
    return environment.network.explorer.address.replace('${address}', this.loan.borrower);
  }
}
