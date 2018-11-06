import { HttpClient } from '@angular/common/http';

import { Injectable } from '@angular/core';
import { Request } from './../models/loan.model';
import { cosignerOptions } from '../../environments/cosigners';
import { CosignerProvider } from '../providers/cosigner-provider';
import { Web3Service } from './web3.service';

@Injectable()
export class CosignerService {
  loadedOption = {};
  constructor(
    private http: HttpClient,
    private web3: Web3Service
  ) { }
  getCosigner(loan: Request): CosignerProvider {
    if (loan.isRequest) {
      // Return a cosigner option
      const cosignerOption = cosignerOptions.find(cp => cp.isValid(loan));

      if (cosignerOption !== undefined) {
        cosignerOption.injectHttp(this.http);
        cosignerOption.injectWeb3(this.web3);
      }

      return cosignerOption;
    }

    const cosigner = cosignerOptions.find(cp => cp.isCurrent(loan));

    // TODO: Add unknown cosigner rpovider
    // if (!loan.isRequest && loan.cosigner !== Utils.address0x && cosigner === undefined) {
    //   return new UnknownCosignerProvider();
    // }

    if (cosigner !== undefined) {
      cosigner.injectHttp(this.http);
      cosigner.injectWeb3(this.web3);
    }

    return cosigner;
  }
}
