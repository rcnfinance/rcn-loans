import { DecentralandCosignerProvider } from './../app/providers/cosigners/decentraland-cosigner-provider';
import { CosignerProvider } from '../app/providers/cosigner-provider';
// import { ScrollStrategyOptions } from '@angular/cdk/overlay';

interface CosignerOption {
  engine: string;
  manager: string;
  creator: string;
  market: string;
  dataUrl: string;
}

const consignerOptions: CosignerOption[] = [];

function setOptions() {
  const optionsArray: Array<CosignerProvider> = [];

  for (const co of consignerOptions) {
    const decentralandCosigner = new DecentralandCosignerProvider();
    decentralandCosigner.engine = co.engine;
    decentralandCosigner.manager = co.manager;
    decentralandCosigner.creator = co.creator;
    decentralandCosigner.market = co.market;
    decentralandCosigner.dataUrl = co.dataUrl;

    optionsArray.push(decentralandCosigner);
  }

  return optionsArray;

}

export const cosignerOptions: CosignerProvider[] = setOptions();
