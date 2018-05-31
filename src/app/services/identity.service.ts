import { Injectable } from '@angular/core';
import { Loan } from '../models/loan.model';
import { Identity } from '../models/identity.model';
import { environment } from '../../environments/environment';
import { companyIdentities } from '../constants/CompanyIdentities';

@Injectable()
export class IdentityService {
  constructor() { }
  public getIdentity(loan: Loan): Promise<Identity> {
    return new Promise((resolve) => {
      resolve(companyIdentities[environment.dir[loan.borrower]]);
    }) as Promise<Identity>;
  }
}
