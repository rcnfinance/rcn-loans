import { CosignerProvider } from '../cosigner-provider';
import { HttpClient } from '@angular/common/http';
import { Web3Service } from '../../services/web3.service';
import { Loan } from '../../models/loan.model';
import { CosignerOffer, CosignerLiability } from '../../models/cosigner.model';
import { AssetsService } from '../../services/assets.service';

export class UnknownCosignerProvider implements CosignerProvider {
    injectHttp(_http: HttpClient) {}
    injectAssets(assets: AssetsService) {}
    injectWeb3(_web3: Web3Service) {}
    title(_loan: Loan): string {
        return 'Unknown cosigner';
    }
    contract(loan: Loan): string {
        return loan.cosigner;
    }
    isValid(_loan: Loan): boolean {
        return false;
    }
    isCurrent(_loan: Loan): boolean {
        return true;
    }
    offer(_loan: Loan): Promise<CosignerOffer> {
        return undefined;
    }
    liability(loan: Loan): Promise<CosignerLiability> {
        return new Promise((resolve, _err) => {
            resolve(new CosignerLiability(
                loan.cosigner,
                undefined,
                false,
                undefined
            ));
        }) as Promise<CosignerLiability>;
    }
}
