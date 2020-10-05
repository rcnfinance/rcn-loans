import { getBuild } from './build';

// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.
export enum Agent {
  MortgageCreator,
  MortgageManager,
  RipioArsCreator,
  RipioUsdCreator
}

declare let require: any;

const p = require('../../package.json') as any;

const RCN_TOKEN = '0xf970b8e36e23f7fc3fd752eea86f8be8d83375a6';
const INFURA_ID = 'acf3c538f57040839369e7c1b023c3c6';
const RCN_API = 'https://diaspore-rnode.rcn.loans';
const RIPIO_COSIGNER = '0xfA7c953a07BCb4420253bFfBf586bDD64c37B670';

export const environment = {
  version: p.version,
  versionName: p.version_name,
  versionEmoji: '👻',
  build: getBuild(),
  production: true,
  url: 'https://mainnet.rcn.loans/',
  envName: 'main',
  identity: 'https://20mq9e6amd.execute-api.us-east-2.amazonaws.com/alpha/',
  buyLink: 'https://www.bancor.network/communities/5a92b438583f4a0001f75f42/about',
  versionVerbose: p.version + '@' + getBuild() + ' - ' + p.version_name,
  sentry: 'https://7082f6389c9b4d5ab9d7b2cde371da2a@sentry.io/1261533',
  gaTracking: 'UA-158285508-1',
  apiCountry : 'https://ipcountry-api.rcn.loans',
  rcnApi: {
    v4: `${ RCN_API }/v4/`,
    v5: `${ RCN_API }/v5/`
  },
  network: {
    id: 1,
    name: 'Main',
    explorer: {
      address: 'https://etherscan.io/address/${address}',
      tx: 'https://etherscan.io/tx/${tx}'
    },
    provider: {
      id: INFURA_ID,
      url: `https://mainnet.infura.io/v3/${ INFURA_ID }`
    }
  },
  contracts: {
    rcnToken: RCN_TOKEN,
    oracleFactory: '0x1101c52fc25dc6d2691cec4b06569cef3c83933c',
    diaspore: {
      debtEngine: '0x80db22675dad70e44b64029510778583187faddb',
      loanManager: '0xb55b0f33d6a2a03a275ca85d58e9357e1a141187'
    },
    collateral: {
      collateral: '0xc582d9df09036ef4ba787efda0eb9e9fb2618363',
      wethManager: '' // TODO: Add
    },
    converter: {
      converterRamp: '0x28827e6218b4b83197363945448b8869d604b2ed',
      ethAddress: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
      uniswapConverter: '0x6a7f86c7c9dccba843287407c9db6615972c0a7d'
    },
    models: {
      installments: '0xb2c86bcda2b845e7c61eb5443bc9bb57d48e4bb6'
    },
    decentraland: {
      mortgageCreator: '0x90263Ea5C57Dc6603CA7202920735A6E31235bB9',
      mortgageManager: '0x9ABf1295086aFA0E49C60e95c437aa400c5333B8'
    },
    chainlink: {
      EACAggregatorProxy: {
        ethUsd: '0x5f4ec3df9cbd43714fe2740f5e3616155c5b8419'
      }
    }
  },
  blacklist: [],
  filters: {
    openLoans: '0xb18aa197fdb7d20c695dac42da71eb55883fb253',
    nonExpired: '0x56a65418a09aa5cd0cb79d437cb1d318037817d7',
    validMortgage: '0x7c9ee6f211093351612345fce308cbf86e562b69',
    lenderIn: '0x5ef16f3412e7c01e5c9803caae1322b28596d0bd',
    ongoing: '0x3b80f3028af6ab654b6b0188e651667ade313e1b'
  },
  dir: {
    '0xfbd5e54062619ef2b0323ad9ff874b39fd5a8d2c': Agent.RipioArsCreator,
    '0x520aefcaea7754e86c2a1c9367948d732607c47f': Agent.RipioUsdCreator
  },
  cosigners: {
    [Agent.RipioArsCreator]: RIPIO_COSIGNER,
    [Agent.RipioUsdCreator]: RIPIO_COSIGNER
  },
  filterCurrencies: [
    'RCN',
    'DAI',
    'MANA',
    'ARS',
    'USD'
  ],
  usableCurrencies: [
    {
      symbol: 'RCN',
      img: 'assets/rcn.png',
      address: RCN_TOKEN
    },
    {
      symbol: 'ETH',
      img: 'assets/eth.png',
      address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
    },
    {
      symbol: 'DAI',
      img: 'assets/dai.png',
      address: '0x6b175474e89094c44da98b954eedeac495271d0f'
    },
    {
      symbol: 'USDC',
      img: 'assets/usdc.png',
      address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
    },
    {
      symbol: 'MANA',
      img: 'assets/mana.png',
      address: '0x0f5d2fb29fb7d3cfee444a200298f468908cc942'
    }
  ]
};
