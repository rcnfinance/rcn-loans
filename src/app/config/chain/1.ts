import { Agent } from 'environments/environment';
import { WalletType } from 'app/interfaces/wallet.interface';

const INFURA_ID = 'acf3c538f57040839369e7c1b023c3c6';
const RCN_ENGINE = 'rcnEngine';
const RCN_TOKEN = '0xf970b8e36e23f7fc3fd752eea86f8be8d83375a6';
const USDC_ENGINE = 'usdcEngine';
const USDC_TOKEN = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';

export const chain = {
  agents: Agent,
  network: {
    id: 1,
    name: 'Main',
    currency: 'ETH',
    ui: {
      name: 'Ethereum',
      fullname: 'Ethereum Mainnet',
      image: 'assets/chain-ethereum.svg',
      website: 'https://ethereum.org/en/'
    },
    explorer: {
      address: 'https://etherscan.io/address/${address}',
      tx: 'https://etherscan.io/tx/${tx}'
    },
    provider: {
      id: INFURA_ID,
      url: `https://mainnet.infura.io/v3/${ INFURA_ID }`
    }
  },
  api: {
    [RCN_ENGINE]: {
      v6: `https://old-api-mainnet-diaspore.rcn.loans/`
    },
    [USDC_ENGINE]: {
      v6: `https://new-api-mainnet-diaspore-usdc.rcn.loans/`
    }
  },
  contracts: {
    [RCN_ENGINE]: {
      token: RCN_TOKEN,
      oracleFactory: '0x1101c52fc25dc6d2691cec4b06569cef3c83933c',
      diaspore: {
        debtEngine: '0x80db22675dad70e44b64029510778583187faddb',
        loanManager: '0xb55b0f33d6a2a03a275ca85d58e9357e1a141187'
      },
      collateral: {
        collateral: '0xc582d9df09036ef4ba787efda0eb9e9fb2618363',
        wethManager: '' // TODO: add
      },
      converter: {
        converterRamp: '0x28827e6218b4b83197363945448b8869d604b2ed',
        uniswapConverter: '0x6a7f86c7c9dccba843287407c9db6615972c0a7d'
      },
      models: {
        installments: '0xb2c86bcda2b845e7c61eb5443bc9bb57d48e4bb6'
      }
    },
    [USDC_ENGINE]: {
      token: USDC_TOKEN,
      oracleFactory: '0x2f0bf5040b82bfd8995fb902931ff9d5bfc53958',
      diaspore: {
        debtEngine: '0x95f0c89ccbf24d210a5b76eeffc3782e0718aee9',
        loanManager: '0xbde19492fb1af4525ed4320a3d141890e600aea0'
      },
      collateral: {
        collateral: '0x3459897e441d143c1406f7a035ac001cef2e3988',
        wethManager: '' // TODO: add
      },
      converter: {
        converterRamp: '0x47c93d0c9bada31aee557de5dec5ad00ade6029f',
        uniswapConverter: '0x6a7f86c7c9dccba843287407c9db6615972c0a7d'
      },
      models: {
        installments: '0x4b441133e357512e4d970a6fafcec77c3f38c590'
      }
    },
    chainCurrencyAddress: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    chainlink: {
      EACAggregatorProxy: {
        chainCurrencyToUsd: '0x5f4ec3df9cbd43714fe2740f5e3616155c5b8419'
      },
      chainlinkAdapterV3: '0x6126b98bc1d522835ea7bab4038af012d1aef98c'
    }
  },
  dir: {
    '0xfbd5e54062619ef2b0323ad9ff874b39fd5a8d2c': Agent.RipioArsCreator,
    '0x520aefcaea7754e86c2a1c9367948d732607c47f': Agent.RipioUsdCreator
  },
  chainlinkPairs: {
    'ETH': ['ETH', 'USDC'],
    'RCN': ['RCN', 'BTC', 'ETH', 'USDC'],
    'ARS': ['ARS', 'BTC', 'ETH', 'USDC'],
    'BTC': ['BTC', 'ETH', 'USDC']
  },
  filterCurrencies: [
    'RCN',
    'DAI',
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
      address: USDC_TOKEN
    },
    {
      symbol: 'ARS',
      img: 'assets/ars.png',
      address: '0x0000000000000000000000000000000000000000'
    }
  ],
  usableWallets: [
    WalletType.Metamask,
    WalletType.WalletConnect,
    WalletType.WalletLink
  ],
  createLoanCurrencies: ['RCN', 'USDC', 'ARS'],
  createCollateralCurrencies: ['RCN', 'USDC']
};
