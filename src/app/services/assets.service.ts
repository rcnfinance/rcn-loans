import { Injectable } from '@angular/core';
import { Web3Service } from './web3.service';
import { AssetClass, AssetItem, AssetMetadata, AssetType } from '../models/asset.model';
import { promisify, Utils } from '../utils/utils';
import { environment } from '../../environments/environment';
import { CosignerService } from './cosigner.service';
import { decodeTokenId } from '../models/cosigners/decentraland-cosigner.model';
import { utils } from 'protractor';

declare let require: any;

const tokenAbi = require('../contracts/Token.json');
const erc721Abi = require('../contracts/ERC721.json');
const erc721LegacyAbi = require('../contracts/NanoLoanEngine.json');

enum AssetScheme { Unknown }
enum MetaSchene { Unknown }

class Manager {
  private web3Service: Web3Service;

  constructor(
    public service: AssetsService,
    public asset: AssetClass,
    public metadataOf: (asset: AssetClass, owner: string, id: number) => AssetMetadata,
    public assetsOf: (manager: Manager, owner: string) => Promise<AssetItem[]>
  ) {
    this.web3Service = service.web3Service;
  }

  build(id: number, owner: string): AssetItem {
    return new AssetItem(this.asset, id, owner, this.metadataOf(this.asset, owner, id));
  }
}

@Injectable()
export class AssetsService {
  constructor(
    public web3Service: Web3Service
  ) { }

  // tslint:disable:max-line-length
  managers = [
    new Manager(this, new AssetClass('RCN', environment.contracts.rcnToken, AssetType.ERC20), this.tokenMetadataBuilder, this.erc20AssetsOf),
    new Manager(this, new AssetClass('MANA', '0x2a8fd99c19271f4f04b1b7b9c4f7cf264b626edb', AssetType.ERC20), this.tokenMetadataBuilder, this.erc20AssetsOf),
    new Manager(this, new AssetClass('Decentraland parcel', '0x7a73483784ab79257bb11b96fd62a2c3ae4fb75b', AssetType.ERC721), this.decentralandMetadataBuilder, this.erc721AssetsOf),
    new Manager(this, new AssetClass('RCN Loan', environment.contracts.basaltEngine, AssetType.ERC721), this.rcnMetadataBuilder, this.legacyErc721AssetsOf),
    new Manager(this, new AssetClass('TEST NFT', '0x90df8a8ff585d1eb4b9a13789bcc5fd8c7e1b7b2', AssetType.ERC721), this.genericMetadataBuilder, this.erc721AssetsOf),
  ];

  tokenMetadataBuilder(asset: AssetClass, address: string, id: number): AssetMetadata {
    return new AssetMetadata(
      id + ' ' + asset.name + ' tokens',
      environment.network.explorer.token.replace('${token}', asset.contract).replace('${address}', address),
      '/assets/tokens/' + asset.name.toLowerCase() + '.png'
    );
  }

  genericMetadataBuilder(asset: AssetClass, address: string, id: number): AssetMetadata {
    return new AssetMetadata(
      asset.name + ' ' + id,
      undefined,
      undefined
    );
  }

  decentralandMetadataBuilder(asset: AssetClass, address: string, id: number): AssetMetadata {
    const xy = decodeTokenId(id.toFixed(0));
    return new AssetMetadata(
      asset.name + ' ' + xy,
      'https://market.decentraland.org/' + xy[0] + '/' + xy[1] + '/detail',
      undefined // TODO: Add map image url
    );
  }

  rcnMetadataBuilder(asset: AssetClass, address: string, id: number): AssetMetadata {
    return new AssetMetadata(
      asset.name + ' ' + id,
      '/loans/' + id,
      undefined // TODO: Add RCN loan image
    );
  }

  async erc20AssetsOf(manager: Manager, owner: string): Promise<AssetItem[]> {
    const web3 = this.web3Service.web3reader;
    const token = web3.eth.contract(tokenAbi.abi).at(manager.asset.contract);
    const balance = await promisify(c => token.balanceOf(owner, c)) as number;
    if (balance > 0) {
      return [manager.build(balance, owner)];
    } else {
      return [];
    }
  }

  async erc721AssetsOf(manager: Manager, owner: string): Promise<AssetItem[]> {
    const web3 = this.web3Service.web3reader;
    const token = web3.eth.contract(erc721Abi).at(manager.asset.contract);
    const balance = await promisify(cb => token.balanceOf(owner, cb));
    const result = [];
    const pending = [];
    for (let i = 0; i < balance; i++) { pending.push(promisify(c => token.tokenOfOwnerByIndex(owner, i, c))); }
    for (const p of pending) { result.push(manager.build(await p, owner)); }
    return result;
  }

  async legacyErc721AssetsOf(manager: Manager, owner: string): Promise<AssetItem[]> {
    const web3 = this.web3Service.web3reader;
    const token = web3.eth.contract(erc721LegacyAbi.abi).at(manager.asset.contract);
    const allTokens = await promisify(c => token.tokensOfOwner(owner, c)) as Array<number>;
    const result = [];
    allTokens.forEach(item => { if (item.toFixed(0) !== '0') { result.push(manager.build(item, owner)); } });
    return result;
  }

  async isApproved(assetItem: AssetItem, target: string): Promise<boolean> {
    const web3 = this.web3Service.web3reader;
    const contract = web3.eth.contract(erc721LegacyAbi.abi).at(assetItem.asset.contract);
    const account = await this.web3Service.getAccount();

    const tx = await promisify(c => contract.getApproved(assetItem.id, {from: account}, c));
    return tx == target;
  }

  parse(contract: string, id: number, owner: string): AssetItem {
    return this.managers.find(c => c.asset.contract === contract).build(id, owner);
  }

  async allAssetsOf(address: string): Promise<AssetItem[]> {
    let result = [];
    const pending = [];
    for (const manager of this.managers) { pending.push(manager.assetsOf(manager, address)); }
    for (const p of pending) { result = result.concat(await p); }
    return result;
  }

  async sendApprove(assetItem: AssetItem, to: string): Promise<string> {
    const web3 = this.web3Service.web3;
    const contract = web3.eth.contract(tokenAbi.abi).at(assetItem.asset.contract);
    const account = await this.web3Service.getAccount();
    const tx = await promisify(c => contract.approve(to, assetItem.id, {from: account}, c));
    return tx as string;
  }
}
