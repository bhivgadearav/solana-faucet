# Solana Devnet Faucet

## Introduction

This project is a Solana faucet dApp built using React and Vite, designed for the Devnet. It allows users to airdrop SOL to their connected wallet or to a provided `PublicKey`. The project uses the Solana Wallet Adapter to handle wallet connections and verify ownership before performing an airdrop.

## Features

- Airdrop SOL on the Solana Devnet.
- Connect a wallet using the Solana Wallet Adapter.
- Send SOL to another wallet
- Verify wallet ownership before performing the SOL transfer.
- Airdrop to a connected wallet or a specific public key.
- Verify wallet ownership before performing the airdrop.

## Tech Stack

### Frontend
- **React**: A JavaScript library for building user interfaces.
- **Vite**: A next-generation frontend build tool that is fast and simple to set up for modern web projects.
- **TypeScript**: Provides static typing for JavaScript, ensuring better code quality and easier debugging.
- **Tailwind CSS & ShadCN**: A utility-first CSS framework for rapidly building custom designs along with pre-built shadcn components.

### Solana-Specific Libraries
- **@solana/web3.js**: The Solana JavaScript SDK that allows interaction with the Solana blockchain. It provides functions for transactions, wallets, and accounts.
- **@solana/wallet-adapter-react**: A framework for integrating Solana wallet functionality into React apps. It supports various wallets like Phantom, Solflare, and more.
- **@solana/wallet-adapter-react-ui**: A UI package for the Solana Wallet Adapter, which provides wallet connection buttons and other helpful UI components.
- **@solana/wallet-adapter-wallets**: Provides a list of supported wallets that can be connected using the Wallet Adapter.

## How to Use

1. **Connect a Wallet:**
   - Click the "Connect Wallet" button to link your Solana wallet (Phantom, Solflare, etc.).

2. **Airdrop SOL:**
   - You can either airdrop SOL to the connected wallet or input a `PublicKey` to airdrop to that address.

3. **Transfer SOL:**
   - You can either send SOL to another wallet only when you connect your wallet.

3. **Verification:**
   - The app will verify if the connected wallet approves any of the above operation. Your wallet extension will popup and ask you to confirm the transaction.