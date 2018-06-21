import { Injectable } from '@angular/core';
import { Loan, Status } from './../models/loan.model';
import { cosignerOptions } from '../../environments/cosigners';
import { CosignerProvider } from '../providers/cosigner-provider';
import { HttpClient } from '@angular/common/http';
import { Utils } from '../utils/utils';
import { Web3Service } from './web3.service';

@Injectable()
export class CosignerService {
  loadedOption = {};
  constructor(
    private http: HttpClient,
    private web3: Web3Service
  ) { }
  getCosigner(loan: Loan): CosignerProvider {
    if (loan.status === Status.Request) {
      // Return a cosigner option
      const cosignerOption = cosignerOptions.find(cp => cp.isValid(loan));

      if (cosignerOption !== undefined) {
        cosignerOption.injectHttp(this.http);
        cosignerOption.injectWeb3(this.web3);
      }

      return cosignerOption;
    } else {
      const cosigner = cosignerOptions.find(cp => cp.isCurrent(loan));

      if (loan.statusFlag !== Status.Request && loan.cosigner !== Utils.address_0 && cosigner === undefined) {
        // TODO: Return unknown cosigner
      }

      if (cosigner !== undefined) {
        cosigner.injectHttp(this.http);
        cosigner.injectWeb3(this.web3);
      }

      return cosigner;
    }
  }
}
