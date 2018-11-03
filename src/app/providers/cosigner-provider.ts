
import { CosignerLiability, CosignerOffer } from '../models/cosigner.model';
import { Loan } from '../models/loan.model';
import { HttpClient } from '@angular/common/http';
import { Web3Service } from '../services/web3.service';

export interface CosignerProvider {
  title(loan: Loan): string;
  isValid(loan: Loan): boolean;
  isCurrent(loan: Loan): boolean;
  injectHttp(http: HttpClient);
  injectWeb3(web3: Web3Service);
  offer(loan: Loan): Promise<CosignerOffer>;
  liability(loan: Loan): Promise<CosignerLiability>;
}
