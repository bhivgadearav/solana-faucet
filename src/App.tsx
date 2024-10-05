import { Buffer } from "buffer"
window.Buffer = Buffer

import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import Airdrop from './components/Airdrop';
import { Toaster } from "@/components/ui/toaster";
import '@solana/wallet-adapter-react-ui/styles.css';

function App() {
  return (
    <>
     <ConnectionProvider endpoint={"https://solana-devnet.g.alchemy.com/v2/CcKKKKkD5h1LccFP80nHoc469FjlaNrf"}>
     {/* If you are wondering why is the rpc url not in a env variable, 
     it's because it's not really sensitive and I didn't think somehow call limit would be reached
     since it's not going to be seen by much people and most poeple won't really bother looking at github code */}
        <WalletProvider wallets={[]} autoConnect>
            <WalletModalProvider>
                <Airdrop />
                <Toaster />
            </WalletModalProvider>
        </WalletProvider>
    </ConnectionProvider>
    </>
  )
}

export default App
