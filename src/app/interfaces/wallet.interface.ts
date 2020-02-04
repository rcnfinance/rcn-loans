export enum WalletType {
  WalletLink = 1,
  Metamask,
  WalletConnect
}

export interface WalletConnection {
  network: number;
  wallet: WalletType;
}

export const WalletLogo = {
  [WalletType.WalletLink]: './assets/logo-coinbase.png',
  [WalletType.Metamask]: './assets/logo-metamask.svg',
  [WalletType.WalletConnect]: './assets/logo-walletconnect.svg'
};
