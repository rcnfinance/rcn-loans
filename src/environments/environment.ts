import { getBuild } from './build';

// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.
export enum Agent {
  MortgageCreator,
  MortgageManager,
  RipioCreator,
  WenanceCreator
}

declare let require: any;

const p = require('../../package.json') as any;

const RCN_TOKEN = '0x2f45b6fb2f28a73f110400386da31044b2e953d4';
const INFURA_ID = 'acf3c538f57040839369e7c1b023c3c6';

export const environment = {
  version: p.version,
  version_name: p.version_name,
  version_emoji: '👻',
  build: getBuild(),
  production: false,
  url: 'https://testnet.rcn.loans/',
  envName: 'dev',
  identity: 'https://20mq9e6amd.execute-api.us-east-2.amazonaws.com/alpha/',
  buyLink: 'https://www.bancor.network/communities/5a92b438583f4a0001f75f42/about',
  version_verbose: p.version + '@' + getBuild() + ' - ' + p.version_name,
  sentry: 'https://7082f6389c9b4d5ab9d7b2cde371da2a@sentry.io/1261533',
  gaTracking: 'UA-122615331-2',
  apiCountry: 'https://ipcountry-api.rcn.loans',
  rcn_node: {
    loan: 'https://ropsten-rnode.rcn.loans/v1/commits?id_loan=$id' // TODO: replace by rcn_node_api.basaltUrl
  },
  rcn_node_api: {
    basaltUrl: 'https://ropsten-rnode.rcn.loans/v1/',
    diasporeUrl: 'https://diaspore-ropsten-rnode.rcn.loans/v4/',
    url: 'https://diaspore-ropsten-rnode.rcn.loans/v4/' // TODO: replace by diasporeUrl
  },
  rcn_oracle: {
    url: 'https://oracle.ripio.com/rate/'
  },
  network: {
    id: 3,
    name: 'Ropsten',
    explorer: {
      address: 'https://ropsten.etherscan.io/address/${address}',
      tx: 'https://ropsten.etherscan.io/tx/${tx}'
    },
    provider: {
      id: INFURA_ID,
      url: `https://ropsten.infura.io/v3/${ INFURA_ID }`
    }
  },
  contracts: {
    rcnToken: RCN_TOKEN,
    basaltEngine: '0xbee217bfe06c6faaa2d5f2e06ebb84c5fb70d9bf',
    engineExtension: '0x3b86e29fc3e8a626735b0194aef13c6051eb6c84',
    oracleFactory: '0xf9d4771cbe3c3808f3dff633cd6be738f7f419ea',
    diaspore: {
      debtEngine: '0xb2403dca04ab49492e1e05b29f26e6c01ac5d604',
      loanManager: '0x39e67f667ed83c8a2db0b18189fe93f57081b9ae'
    },
    collateral: {
      collateral: '0x391720efbaea47130f198263f7c3abefc230d14b',
      wethManager: '0xfcbfd18d28ff0ffb311e2de179f3758531128449'
    },
    converter: {
      converterRamp: '0x935d87676a113d4709c6b208509b592931edaaf6',
      ethAddress: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
      tokenConverter: '0x79e680e613ed32f64da9e5a09ed8613c8e9ce3a7'
    },
    models: {
      installments: '0x41e9d0b6a8ce88989c2e7b3cae42ecfac44c9603'
    },
    decentraland: {
      mortgageCreator: '0x0e4c24f71c8679b8af8e5a22aac3816e2b23f1cc',
      mortgageManager: '0x31ebb4ffd5e34acfc87ea21a0c56157188f3f0e1'
    },
    multicall: '0xa457b5b859573e8eb758b6c2bfd4ae3042b422fd'
  },
  cosigners: {
    [Agent.RipioCreator]: '0x684977757434fee591220810cd31b6bbf99f4bdc'
  },
  blacklist: [
    {
      key: 'oracle',
      forbidden: [
        '0x0ac18b74b5616fdeaeff809713d07ed1486d0128',
        '0x4931d0621360187199de494a1469165079b31bfc'
      ]
    },
    {
      key: 'oracleUrl',
      forbidden: [
        'http://ec2-54-233-188-146.sa-east-1.compute.amazonaws.com/rate/'
      ]
    }
  ],
  filters: {
    openLoans: '0x3e703de416a62525c8653be11d71486550618ec8',
    nonExpired: '0xe084b7cf7f6869a96cd72962047bf65e6d55e1e1',
    validMortgage: '0x93b08a8a3cf148d62c20d3daa0b1bdf813bb7a21',
    lenderIn: '0xe52eac8af912b8b3196b2921f12b66c91b39e025',
    ongoing: '0xc247ba1b89af5f2654184f0c5a8e8f1ea48c55e3'
  },
  dir: {
    '0xdc5fdc6d0c24573c7e2ac3896ab10e376be6da86': Agent.RipioCreator,
    '0xc521961b2536e2c0ab595aae25a572bfbaf7d955': Agent.WenanceCreator
  },
  filterCurrencies: [
    'RCN',
    'DEST',
    'MANA',
    'ARS',
    'USD',
    'DEST'
  ],
  usableCurrencies: [
    {
      symbol: 'RCN',
      img: 'assets/rcn.png',
      address: RCN_TOKEN
    },
    {
      symbol: 'DEST',
      img: 'assets/dai.png',
      address: '0x6710d597fd13127a5b64eebe384366b12e66fdb6'
    },
    {
      symbol: 'ETH',
      img: 'assets/eth.png',
      address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee' // FIXME
    }
  ]
};
