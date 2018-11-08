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

declare let require: any;

const p = require('../../package.json') as any;

export const environment = {
  version: p.version,
  version_name: p.version_name,
  build: getBuild(),
  production: false,
  url: 'https://testnet.rcn.loans/',
  envName: 'dev',
  gaTracking: 'UA-122615331-2',
  identity: 'https://20mq9e6amd.execute-api.us-east-2.amazonaws.com/alpha/',
  buyLink: 'https://www.bancor.network/communities/5a92b438583f4a0001f75f42/about',
  version_verbose: p.version + '@' + getBuild() + ' - ' + p.version_name,
  sentry: 'https://7082f6389c9b4d5ab9d7b2cde371da2a@sentry.io/1261533',
  rcn_node: {
    loan: 'https://testnet.rnode.rcn.loans/v1/loans/$id/'
  },
  network: {
    id: '3',
    name: 'Ropsten',
    explorer: {
      address: 'https://ropsten.etherscan.io/address/${address}',
      tx: 'https://ropsten.etherscan.io/tx/${tx}'
    },
    provider: 'https://ropsten.node.rcn.loans:8545/'
  },
  contracts: {
    rcnToken: '0x2f45b6fb2f28a73f110400386da31044b2e953d4',
    basaltEngine: '0xbee217bfe06c6faaa2d5f2e06ebb84c5fb70d9bf',
    engineExtension: '0x3b86e29fc3e8a626735b0194aef13c6051eb6c84',
    diaspore: {
      debtEngine: '0x0bfaf956b4771b0627bf5a67730240dc863676cb',
      loanManager: '0x9d109a7ee22b0c04e9287e68f77bddcfdc11b6de',
      viewRequets: '0x9137287c08c23e41571f67dc5017e96e10796e48'
    },
    decentraland: {
      mortgageCreator: '0x0e4c24f71c8679b8af8e5a22aac3816e2b23f1cc',
      mortgageManager: '0x31ebb4ffd5e34acfc87ea21a0c56157188f3f0e1',
      landMarket: '0x5424912699dabaa5f2998750c1c66e73d67ad219'
    }
  },
  filters: {
    openLoans: '0x3e703de416a62525c8653be11d71486550618ec8',
    nonExpired: '0xe084b7cf7f6869a96cd72962047bf65e6d55e1e1',
    validMortgage: '0x93b08a8a3cf148d62c20d3daa0b1bdf813bb7a21',
    lenderIn: '0xe52eac8af912b8b3196b2921f12b66c91b39e025',
    ongoing: '0xc247ba1b89af5f2654184f0c5a8e8f1ea48c55e3'
  },
  dir: {
    '0xdc5fdc6d0c24573c7e2ac3896ab10e376be6da86': Agent.RipioCreator
  }
};
