import { Engine } from 'app/models/loan.model';
import { WalletType } from 'app/interfaces/wallet.interface';

const USDC_TOKEN = '0x2791bca1f2de4661ed88a30c99a7a9449aa84174';

export const chain = {
  network: {
    id: 137,
    name: 'Matic',
    currency: 'MATIC',
    ui: {
      name: 'Matic',
      fullname: 'Matic Mainnet (Polygon)',
      image: 'assets/polygon.svg',
      website: 'https://docs.matic.today/docs/getting-started'
    },
    explorer: {
      address: 'https://polygonscan.com/address/${address}',
      tx: 'https://polygonscan.com/tx/${address}'
    },
    provider: {
      id: null,
      url: `https://rpc-mainnet.matic.network`
    }
  },
  api: {
    [Engine.UsdcEngine]: {
      v6: `https://matic-mainnet.rcn.loans/`
    }
  },
  contracts: {
    [Engine.UsdcEngine]: {
      token: USDC_TOKEN,
      oracleFactory: '0xb6d018d483fa11f98c1d67d33ac07b7979841f37',
      diaspore: {
        debtEngine: '0x94bf06aa46680c7fe266fc2ec120971e05e190d1',
        loanManager: '0xfdb4850a9925489f7f60f23218d10f41c5692b64'
      },
      collateral: {
        collateral: '0xf914a3f94ec3fea637c19c76a59062b38b014db5',
        wethManager: '' // FIXME: add contract address
      },
      converter: {
        converterRamp: '0x90642c78cf0e7b4839cc00738466a770fd0104f9',
        uniswapConverter: '0x054efaa3beca78fb102684ce942434241c1f3ac6'
      },
      models: {
        installments: '0x89fffd110f6ab7079183159b499b744c6f252119'
      }
    },
    chainCurrencyAddress: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
    chainlink: {
      EACAggregatorProxy: {
        chainCurrencyToUsd: '0xab594600376ec9fd91f8e885dadf0ce036862de0'
      },
      chainlinkAdapterV3: '0xb44407224ae1e43cb0f419e74dd54825da27902a'
    }
  },
  dir: {},
  currencies: {
    chainlinkPairs: {
      'ETH': ['ETH', 'USD', 'USDC'],
      // 'MATIC': ['MATIC', 'USD'], // FIXME: doesn't work
      'ARS': ['USDC', 'USD', 'BTC', 'ARS'],
      'BTC': ['BTC', 'USD', 'USDC']
    },
    filterCurrencies: [
      'ARS',
      'USD'
    ],
    usableCurrencies: [
      {
        symbol: 'MATIC',
        img: 'assets/polygon.svg',
        address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
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
      },
      {
        symbol: 'ETH',
        img: 'assets/eth.svg',
        address: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619'
      }
    ],
    currencyDecimals: {
      'USDC': 6
    },
    createLoanCurrencies: ['USDC', 'ETH', 'ARS'],
    createCollateralCurrencies: ['USDC', 'ETH']
  },
  usableWallets: [
    WalletType.Metamask
  ],
  usableEngines: [
    Engine.UsdcEngine
  ]
};
