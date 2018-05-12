export enum Agent {
  MortgageCreator,
  RipioCreator
}

export const environment = {
  production: true,
  url: 'https://rcn.loans/',
  envName: 'prod',
  contracts: {
    rcnToken: "0xf970b8e36e23f7fc3fd752eea86f8be8d83375a6",
    basaltEngine: "0xba5a172c797c894737760aaa9e9d1558a72ace60",
    engineExtension: "0x9d4a440d0c905dfc28546e87a85eedce3ec499ee"
  },
  dir: {
    "0x263231ed9b51084816a44e18d16c0f6d0727491f": Agent.RipioCreator
  }
};