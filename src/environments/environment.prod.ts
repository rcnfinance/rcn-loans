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

const RCN_TOKEN = '0xf970b8e36e23f7fc3fd752eea86f8be8d83375a6';

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
  rcn_node: {
    loan: 'https://rnode.rcn.loans/v1/commits?id_loan=$id'
  },
  rcn_node_api: {
    url: 'https://diaspore-rnode.rcn.loans/v4/'
  },
  rcn_oracle: {
    url: 'https://oracle.ripio.com/rate/'
  },
  network: {
    id: '1',
    name: 'Main',
    explorer: {
      address: 'https://etherscan.io/address/${address}',
      tx: 'https://etherscan.io/tx/${tx}'
    },
    provider: 'https://mainnet.infura.io/v3/acf3c538f57040839369e7c1b023c3c6'
  },
  contracts: {
    rcnToken: RCN_TOKEN,
    basaltEngine: '0xba5a17f8ad40dc2c955d95c0547f3e6318bd72e7',
    engineExtension: '0x3143f397685daa5f48f77c5d3ea4cbe61f294d88',
    oracle: '0xd8320c70f5d5b355e1365acdf1f7c6fe4d0d92cf', // FIXME: Ropsten oracle
    oracleFactory: '0xe8e49d772b106e2acfc7f821cbd77b97a728aaac', // FIXME: Ropsten oracle factory
    diaspore: {
      debtEngine: '0x80db22675dad70e44b64029510778583187faddb',
      loanManager: '0xb55b0f33d6a2a03a275ca85d58e9357e1a141187',
      viewRequets: '0x7edb5117f91514579e3c8d39eed71e6be278632a',
      collateral: '0x7c5bb57001eb5bebeb0359e584dc5f29675061f2', // FIXME: Ropsten collateral
      filters: {
        debtCreator: '0x998a67ce5827cb372fe07942561006c7a76cf06f',
        isLender: '0x22a87c89dd8d8d0abe94062eba672f088e808d49',
        isBorrower: '0x11dad1b4b85b4ca7d03847231554571f5e7db726',
        isStatus: '0x43c6c2ae47a31e5850b820f09520310ec0481600',
        notExpired: '0xada8797ece7e2bda72140a26d13185a788a636cb'
      }
    },
    converter: {
      converterRamp: '0x56783153d0a8ccb009dcb79df5337835ed1a9d6c',
      tokenConverter: '0x3b81db7c9fe71a2c6d78f9ae2fe4df4c92272622',
      ethAddress: '0x00eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
      uniswapProxy: '0x0c295fe65e94cd4eaffe906ad1c77d9e35923b05',
      params: {
        marginSpend: 5000,
        maxSpend: 0,
        rebuyThreshold: 40000000000000000000,
        aditionalSlippage: '2'
      }
    },
    decentraland: {
      mortgageCreator: '0x90263Ea5C57Dc6603CA7202920735A6E31235bB9',
      mortgageManager: '0x9ABf1295086aFA0E49C60e95c437aa400c5333B8',
      landMarket: '0xb3bca6f5052c7e24726b44da7403b56a8a1b98f8'
    }
  },
  blacklist: [],
  filters: {
    openLoans: '0xb18aa197fdb7d20c695dac42da71eb55883fb253',
    nonExpired: '0x56a65418a09aa5cd0cb79d437cb1d318037817d7',
    validMortgage: '0x7c9ee6f211093351612345fce308cbf86e562b69',
    lenderIn: '0x5ef16f3412e7c01e5c9803caae1322b28596d0bd',
    ongoing: '0x3b80f3028af6ab654b6b0188e651667ade313e1b',
    stub: '0xc7fb7d6fb0c787d5454cbd1b8140ec9624519668'
  },
  dir: {
    '0x263231ed9b51084816a44e18d16c0f6d0727491f': Agent.RipioCreator,
    '0xfeac8e490fe7f0760a10225e7dccda1e22ad8daa': Agent.WenanceCreator // FIXME - Ropsten address
  },
  usableCurrencies: [
    {
      symbol: 'RCN',
      img: 'assets/rcn.png',
      address: RCN_TOKEN
    },
    {
      symbol: 'DAI',
      img: 'assets/dai.png',
      address: '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359'
    },
    {
      symbol: 'ETH',
      img: 'assets/eth.png',
      address: '0x00eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee' // FIXME
    }
  ]
};
