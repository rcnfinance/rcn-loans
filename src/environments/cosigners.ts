import { DecentralandCosignerProvider } from './../app/providers/cosigners/decentraland-cosigner-provider';
import { environment } from './environment';
import { CosignerProvider } from '../app/providers/cosigner-provider';

export const cosignerOptions: CosignerProvider[] = [
    new DecentralandCosignerProvider(
        environment.contracts.basaltEngine,
        '0xea06746f1bd82412f9f243f6bee0b8194d67a67d',
        '0x2bdf545935d4264cbb7457e97d69b6b86458eb64',
        '0x80faa2b517b84a5aec1078d3600eab4c0b3aff56',
        'https://api.decentraland.zone/v1/'
    ),
    new DecentralandCosignerProvider(
        environment.contracts.basaltEngine,
        '0xea06746f1bd82412f9f243f6bee0b8194d67a67d',
        '0x59ccfc50bd19dcd4f40a25459f2075084eebc11e',
        '0x80faa2b517b84a5aec1078d3600eab4c0b3aff56',
        'https://api.decentraland.zone/v1/'
    ),
    new DecentralandCosignerProvider(
        environment.contracts.basaltEngine,
        '0x31ebb4ffd5e34acfc87ea21a0c56157188f3f0e1',
        '0x0e4c24f71c8679b8af8e5a22aac3816e2b23f1cc',
        '0x5424912699dabaa5f2998750c1c66e73d67ad219',
        'https://api.decentraland.org/v1/'
    )
];
