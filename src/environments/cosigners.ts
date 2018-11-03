import { DecentralandCosignerProvider } from './../app/providers/cosigners/decentraland-cosigner-provider';
import { environment } from './environment';
import { CosignerProvider } from '../app/providers/cosigner-provider';

export const cosignerOptions: CosignerProvider[] = [
  new DecentralandCosignerProvider(
        environment.contracts.basaltEngine,
        '0x9ABf1295086aFA0E49C60e95c437aa400c5333B8',
        '0x90263Ea5C57Dc6603CA7202920735A6E31235bB9',
        '0x8e5660b4Ab70168b5a6fEeA0e0315cb49c8Cd539',
        'https://api.decentraland.org/v1/'
    ),
  new DecentralandCosignerProvider(
        environment.contracts.basaltEngine,
        '0x31ebb4ffd5e34acfc87ea21a0c56157188f3f0e1',
        '0x0e4c24f71c8679b8af8e5a22aac3816e2b23f1cc',
        '0x5424912699dabaa5f2998750c1c66e73d67ad219',
        'https://api.decentraland.org/v1/'
    )
];
