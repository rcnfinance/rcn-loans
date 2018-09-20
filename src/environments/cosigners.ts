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
        '0x0bdaf0d7eb72cac0e0c8defcbe83ccc06c66a602',
        '0xb3d9444f88dc1c30f18c69ebd8ec6f1fa2706376',
        '0x80faa2b517b84a5aec1078d3600eab4c0b3aff56',
        'https://api.decentraland.org/v1/'
    )
];
