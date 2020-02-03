export enum WalletType {
  WalletLink = 1,
  Metamask,
  WalletConnect
}

export interface WalletConnection {
  network: number;
  wallet: WalletType;
}
