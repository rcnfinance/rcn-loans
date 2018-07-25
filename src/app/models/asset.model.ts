export enum AssetType {
    ERC20,
    ERC721
}

  export class AssetClass {
    constructor(
      public name: string,
      public contract: string,
      public type: AssetType
    ) {}
  }

  export class AssetItem {
    constructor(
      public asset: AssetClass,
      public id: number,
      public owner: string,
      public metadata: AssetMetadata
    ) { }

    get uuid(): string {
      return this.id.toFixed(0) + this.asset.contract;
    }
  }

  export class AssetMetadata {
    constructor(
      public name: string,
      public link: string,
      public image: string
    ) {}
  }
