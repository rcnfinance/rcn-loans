import { DecentralandCosignerProvider } from './../app/providers/cosigners/decentraland-cosigner-provider';
import { environment } from './environment';
import { CosignerProvider } from '../app/providers/cosigner-provider';
// import { ScrollStrategyOptions } from '@angular/cdk/overlay';

function setOptions() {
  const optionsArray: Array<CosignerProvider> = [];
  const decentralandCosigner1 = new DecentralandCosignerProvider();
  decentralandCosigner1.engine = environment.contracts.basaltEngine;
  decentralandCosigner1.manager = '0x31ebb4ffd5e34acfc87ea21a0c56157188f3f0e1';
  decentralandCosigner1.creator = '0x0e4c24f71c8679b8af8e5a22aac3816e2b23f1cc';
  decentralandCosigner1.market = '0x80faa2b517b84a5aec1078d3600eab4c0b3aff56';
  decentralandCosigner1.dataUrl = 'https://api.decentraland.zone/v1/';
  optionsArray.push(decentralandCosigner1);

  const decentralandCosigner2 = new DecentralandCosignerProvider();
  decentralandCosigner2.engine = environment.contracts.basaltEngine;
  decentralandCosigner2.manager = '0x9ABf1295086aFA0E49C60e95c437aa400c5333B8';
  decentralandCosigner2.creator = '0x90263Ea5C57Dc6603CA7202920735A6E31235bB9';
  decentralandCosigner2.market = '0x8e5660b4Ab70168b5a6fEeA0e0315cb49c8Cd539';
  decentralandCosigner2.dataUrl = 'https://api.decentraland.zone/v1/';
  optionsArray.push(decentralandCosigner2);

  const decentralandCosigner3 = new DecentralandCosignerProvider();
  decentralandCosigner3.engine = environment.contracts.basaltEngine;
  decentralandCosigner3.manager = '0x31ebb4ffd5e34acfc87ea21a0c56157188f3f0e1';
  decentralandCosigner3.creator = '0x0e4c24f71c8679b8af8e5a22aac3816e2b23f1cc';
  decentralandCosigner3.market = '0x5424912699dabaa5f2998750c1c66e73d67ad219';
  decentralandCosigner3.dataUrl = 'https://api.decentraland.zone/v1/';
  optionsArray.push(decentralandCosigner3);

  return optionsArray;

}

export const cosignerOptions: CosignerProvider[] = setOptions();
