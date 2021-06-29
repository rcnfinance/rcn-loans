import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ChainService } from 'app/services/chain.service';
import { Web3Service } from 'app/services/web3.service';
import { DialogClientAccountComponent } from 'app/dialogs/dialog-client-account/dialog-client-account.component';

@Component({
  selector: 'app-dialog-chain-selector',
  templateUrl: './dialog-chain-selector.component.html',
  styleUrls: ['./dialog-chain-selector.component.scss']
})
export class DialogChainSelectorComponent implements OnInit {
  chains: {
    id: number;
    name: string;
    image: string;
    website: string;
    active?: boolean;
  }[];

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private web3Service: Web3Service,
    private chainService: ChainService
  ) { }

  ngOnInit() {
    const chainsData = [];
    const { chains, chain } = this.chainService;

    chains.map((chainId) => {
      const { network } = this.chainService.getChainConfigById(chainId);
      const { id } = network;
      const { name, image, website } = network.ui;
      const active = chain === id;
      chainsData.push({ id, name, image, website, active });
    });

    this.chains = chainsData;
  }

  get currentChain() {
    return this.chainService.chain;
  }

  /**
   * Requeust network change
   * @param chain Selected chain
   * @param connected Currently connected
   */
  async selectChain({ id }, connected?: boolean) {
    if (connected) {
      return;
    }

    const { network } = this.chainService.getChainConfigById(id);
    const { web3 } = this.web3Service;
    const addEthereumChain = {
      chainId: web3.utils.toHex(id),
      chainName: network.ui.name,
      nativeCurrency: {
        name: network.currency,
        symbol: network.currency,
        decimals: 18
      },
      rpcUrls: [network.provider.url]
    };

    const { ethereum } = window as any;
    if (!ethereum) {
      return this.dialog.open(DialogClientAccountComponent);
    }

    try {
      await ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [addEthereumChain]
      });

      this.chains.map((chain) => {
        chain.active = id === chain.id;
        return chain;
      });
    } catch ({ code }) {
      if (code === -32602) {
        this.snackBar.open('Please use Metamask to switch back to the Ethereum network.' , null, {
          duration: 4000,
          horizontalPosition: 'center'
        });
      }
    }
  }
}
