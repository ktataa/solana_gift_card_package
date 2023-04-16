import React, { useMemo } from 'react';
import './App.css';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { UnsafeBurnerWalletAdapter,PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import MainScreen from './components/screens/main_screen';

function App() {
  const network = WalletAdapterNetwork.Devnet;

  // You can also provide a custom RPC endpoint.
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  const wallets = useMemo(
      () => [
          /**
           * Wallets that implement either of these standards will be available automatically.
           *
           *   - Solana Mobile Stack Mobile Wallet Adapter Protocol
           *     (https://github.com/solana-mobile/mobile-wallet-adapter)
           *   - Solana Wallet Standard
           *     (https://github.com/solana-labs/wallet-standard)
           *
           * If you wish to support a wallet that supports neither of those standards,
           * instantiate its legacy wallet adapter here. Common legacy adapters can be found
           * in the npm package `@solana/wallet-adapter-wallets`.
           */
          new UnsafeBurnerWalletAdapter(),
          new PhantomWalletAdapter()
      ],
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [network]
  );
  return (
    <div  className="App">
       <ConnectionProvider endpoint={endpoint}>
          <WalletProvider wallets={wallets} autoConnect>
          <MainScreen></MainScreen>

          </WalletProvider>
      </ConnectionProvider>
     
    </div>
  );
}

export default App;
