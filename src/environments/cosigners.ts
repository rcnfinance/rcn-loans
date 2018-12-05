import { DecentralandCosignerProvider } from './../app/providers/cosigners/decentraland-cosigner-provider';
import { environment } from './environment';
import { CosignerProvider } from '../app/providers/cosigner-provider';
// import { ScrollStrategyOptions } from '@angular/cdk/overlay';

interface CosignerOption {
  engine: string;
  manager: string;
  creator: string;
  market: string;
  dataUrl: string;
}

const consignerOptions: CosignerOption[] = [ {
  engine: environment.contracts.basaltEngine,
  manager: '0x9ABf1295086aFA0E49C60e95c437aa400c5333B8',
  creator: '0x90263Ea5C57Dc6603CA7202920735A6E31235bB9',
  market: '0x8e5660b4Ab70168b5a6fEeA0e0315cb49c8Cd539',
  dataUrl: 'https://api.decentraland.org/v1/'
}, {
  engine: environment.contracts.basaltEngine,
  manager: '0x31ebb4ffd5e34acfc87ea21a0c56157188f3f0e1',
  creator: '0x0e4c24f71c8679b8af8e5a22aac3816e2b23f1cc',
  market: '0x5424912699dabaa5f2998750c1c66e73d67ad219',
  dataUrl: 'https://api.decentraland.zone/v1/'
}
];

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
