import { getBuild } from './build';

// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.
export enum Agent {
  MortgageCreator,
  MortgageManager,
  RipioCreator
}

const p = require('../../package.json') as any;

declare let require: any;

export const environment = {
  version: p.version,
  version_name: p.version_name,
  build: getBuild(),
  production: false,
  url: 'https://mainnet.rcn.loans/',
  envName: 'main',
  identity: 'https://20mq9e6amd.execute-api.us-east-2.amazonaws.com/alpha/',
  buyLink: 'https://www.bancor.network/communities/5a92b438583f4a0001f75f42/about',
  version_verbose: p.version + '@' + getBuild() + ' - ' + p.version_name,
  sentry: 'https://7082f6389c9b4d5ab9d7b2cde371da2a@sentry.io/1261533',
  gaTracking: 'UA-122615331-3',
  network: {
    id: '1',
    name: 'Main',
    explorer: {
      address: 'https://etherscan.io/address/${address}',
      tx: 'https://etherscan.io/tx/${tx}'
    },
    provider: 'https://main.node.rcn.loans:8545/'
  },
  contracts: {
    rcnToken: '0xf970b8e36e23f7fc3fd752eea86f8be8d83375a6',
    basaltEngine: '0xba5a17f8ad40dc2c955d95c0547f3e6318bd72e7',
    engineExtension: '0x3143f397685daa5f48f77c5d3ea4cbe61f294d88',
    decentraland: {
      mortgageCreator: '0x0000545935d4264cbb7457e97d69b6b86458eb64',
      mortgageManager: '0x0000746f1bd82412f9f243f6bee0b8194d67a67d',
      landMarket: '0x0000a2b517b84a5aec1078d3600eab4c0b3aff56'
    }
  },
  filters: {
    openLoans: '0xb18aa197fdb7d20c695dac42da71eb55883fb253',
    nonExpired: '0x56a65418a09aa5cd0cb79d437cb1d318037817d7',
    validMortgage: '0xc7fb7d6fb0c787d5454cbd1b8140ec9624519668',
    lenderIn: '0x5ef16f3412e7c01e5c9803caae1322b28596d0bd',
    ongoing: '0x3b80f3028af6ab654b6b0188e651667ade313e1b',
    stub: '0xc7fb7d6fb0c787d5454cbd1b8140ec9624519668'
  },
  dir: {
    '0x263231ed9b51084816a44e18d16c0f6d0727491f': Agent.RipioCreator,
  }
};
