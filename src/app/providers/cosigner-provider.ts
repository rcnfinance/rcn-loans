import { HttpClient } from '@angular/common/http';

import { CosignerLiability, CosignerOffer } from '../models/cosigner.model';
import { Loan, Request } from '../models/loan.model';
import { Web3Service } from '../services/web3.service';

export interface CosignerProvider {
  title(loan: Loan): string;
  isValid(loan: Request): boolean;
  isCurrent(loan: Request): boolean;
  injectHttp(http: HttpClient);
  injectWeb3(web3: Web3Service);
  offer(loan: Request): Promise<CosignerOffer>;
  liability(loan: Loan): Promise<CosignerLiability>;
}
