import { Buffer } from "buffer"
window.Buffer = Buffer

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

import { Github, Linkedin, Mail, Twitter, Copy } from "lucide-react"

import { useEffect, useState } from "react"

import { WalletMultiButton, WalletDisconnectButton } from "@solana/wallet-adapter-react-ui"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { ed25519 } from '@noble/curves/ed25519';
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, Connection } from "@solana/web3.js";

export default function Airdrop() {
    const [publicAddress, setPublicAddress] = useState("")
    const [airdropAmount, setAirdropAmount] = useState("")
    const [amount, setAmount] = useState(0)
    const [to, setTo] = useState("")
    const [balance, setBalance] = useState(0)
    const [isWalletConnected, setIsWalletConnected] = useState(false) 
    const [tokens, setTokens] = useState([{token_mint: "", token_amount: 0}])

    const wallet = useWallet()
    const { connection } = useConnection()
    const { toast } = useToast()
    const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');

    useEffect(() => {
        setIsWalletConnected(wallet.connected)
        if (wallet.publicKey) wallet.connected ? setPublicAddress(wallet.publicKey?.toString()) : setPublicAddress("")
        wallet.connected ? setAirdropAmount(airdropAmount) : setAirdropAmount("")
        const getWalletBalance = async () => {
            if(wallet.publicKey){
                const balance = await connection.getBalance(wallet.publicKey)
                setBalance(balance / LAMPORTS_PER_SOL)
            }
        }
        const getWalletTokens = async () => {
            const solanaConnection = new Connection("https://api.devnet.solana.com");
            let data;
            if (wallet.publicKey){
                data = await solanaConnection.getParsedTokenAccountsByOwner(wallet.publicKey, {programId: TOKEN_PROGRAM_ID});
            }
            if (data){
                if (Array.isArray(data.value)){
                    const mappedTokens = data.value.map((item) => ({
                        token_mint: item.account.data.parsed.info.mint,
                        token_amount: parseInt(item.account.data.parsed.info.tokenAmount.amount)/LAMPORTS_PER_SOL,
                      }));
                    setTokens(mappedTokens)
                    return
                }
            }
        }
        getWalletBalance()
        getWalletTokens()
        return () => {
            setPublicAddress("")
            setIsWalletConnected(false)
            setBalance(0)
        }
    }, [wallet])

    // const sendSolanaToken = async () => {
    //     Send any token to any wallet 
    //     Coming soon..
    //     The problem token address passed is an empty string 
    //     react updates state after a while
    //     checked using console.log(), log happened after a few seconds
    //     encountered issue before with checking fetched token data
    // }

    // const getTokenInfo = async () => {
    //     Token Name & Image in Wallet Info
    //     Coming soon...
    // }

    const copyPublicKey = () => {
        navigator.clipboard.writeText(publicAddress)
        // You might want to add a toast notification here
      }

    const handleAirdrop = async () => {
        if(!wallet.connected && !publicAddress){
            toast({
                title: "No Valid Wallet",
                description: "Please connect your wallet or enter a valid public address",
            })
            return
        }
        const pubKey = wallet.publicKey ? wallet.publicKey : new PublicKey(publicAddress)
        if(!pubKey){
            toast({
                title: "Invalid Public Address",
                description: "Please enter a valid public address",
            })
            return
        }
        if(!airdropAmount || parseFloat(airdropAmount) == 0){
            toast({
                title: "Invalid Amount",
                description: "Please enter a valid airdrop amount",
            })
            return
        }
        try {
            const publicConnection = new Connection("https://api.devnet.solana.com", "confirmed");
            if (wallet.connected) await authenticateWallet("authenticate wallet ownership")
            const airdropSignature = await connection.requestAirdrop(pubKey, parseFloat(airdropAmount)*LAMPORTS_PER_SOL)
            const maxRetries = 10;
            let retries = 0;
            let signatureStatus = null;
            while (retries < maxRetries) {
                const { value: status } = await publicConnection.getSignatureStatus(airdropSignature);
                signatureStatus = status;
                if (signatureStatus) {
                    break;
                }
                await new Promise((resolve) => setTimeout(resolve, 1000));
                retries++;
            }
            if (signatureStatus?.confirmationStatus === 'confirmed' || signatureStatus?.confirmationStatus === 'finalized') {
                toast({
                    title: "Airdrop Successful",
                    description: `${airdropAmount} SOL sent to ${pubKey.toBase58()}`,
                })
                return
            } else if (signatureStatus?.err) {
                toast({
                    title: "Something went wrong",
                    description: `${signatureStatus.err}`,
                })
                return
            } else {
                toast({
                    title: "Something went wrong",
                    description: `Couldn't complete airdrop, try again later`,
                })
                return
            }
        } catch (error) {
            console.error(error)
        }
    }

    const authenticateWallet = async (message: string) => {
        if (!wallet.publicKey){
            toast({
                title: "No Wallet Connected",
                description: "Please connect your wallet",
            })
            return false
        }
        if (!wallet.signMessage){
            toast({
                title: "Couldn't sign message",
                description: "Wallet doesn't support message signing",
            })
            return false
        }
        const encodedMessage = new TextEncoder().encode(message);
        try {
            const signature = await wallet.signMessage(encodedMessage);
            const result = await ed25519.verify(signature, encodedMessage, wallet.publicKey.toBytes())
            if (!result){
                toast({
                    title: "Authentication Failed",
                    description: "Couldn't verify signature",
                })
                return false
            }
            toast({
                title: "Authentication Successful",
                description: "Wallet ownership verified",
            })
            return true
        } catch (error) {
            toast({
                title: "Authentication Failed",
                description: "Couldn't verify signature",
            })
        }
    }

    const sendSolana = async () => {
        if(!wallet.connected){
            toast({
                title: "No Valid Wallet",
                description: "Please connect your wallet or enter a valid public address",
            })
            return
        }
        try {
            const transaction = new Transaction();
            if (wallet.publicKey) {
                transaction.add(SystemProgram.transfer({
                    fromPubkey: wallet.publicKey,
                    toPubkey: new PublicKey(to),
                    lamports: amount * LAMPORTS_PER_SOL,
                }));
            }
            const transferSignature = await wallet.sendTransaction(transaction, connection);
            const maxRetries = 10;
            let retries = 0;
            let signatureStatus = null;
            while (retries < maxRetries) {
                const { value: status } = await connection.getSignatureStatus(transferSignature);
                signatureStatus = status;
                if (signatureStatus) {
                    break;
                }
                await new Promise((resolve) => setTimeout(resolve, 1000));
                retries++;
            }
            if (signatureStatus?.confirmationStatus === 'confirmed' || signatureStatus?.confirmationStatus === 'finalized') {
                toast({
                    title: "Transfer Successful",
                    description: `${amount} SOL sent to ${to}`,
                })
                return
            } else if (signatureStatus?.err) {
                toast({
                    title: "Something went wrong",
                    description: `${signatureStatus.err}`,
                })
                return
            } else {
                toast({
                    title: "Something went wrong",
                    description: `Couldn't complete transfer, try again later`,
                })
                return
            }
            } catch (error) {
            console.error(error)
            toast({
                title: "Failed to send SOL",
                description: "Something went wrong. Try again later.",
            })
        }
    }

    return (
        <>
            <div className="min-h-screen flex flex-col bg-black text-white">
                <main className="flex-grow container mx-auto px-6 py-12 content-center">
                    <div className="max-w-2xl mx-auto">
                    <h1 className="text-5xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">Solana Faucet</h1>
                    <p className="text-center mb-6 text-gray-300 text-xl">
                        Wanna try out projects on Solana?<br />
                        Get sol airdrops on devnet you can make them real.
                    </p>
                    {isWalletConnected && (
                        <Accordion type="single" collapsible className="mb-6">
                        <AccordionItem value="wallet-info">
                            <AccordionTrigger className="text-white hover:text-white hover:no-underline">
                            Wallet Info
                            </AccordionTrigger>
                            <AccordionContent>
                            <div className="text-white space-y-2">
                                <p>Balance: {balance.toFixed(2)} SOL</p>
                                <div className="flex items-center space-x-2">
                                    <p className="truncate">Public Key: {publicAddress}</p>
                                    <Button
                                        onClick={copyPublicKey}
                                        variant="ghost"
                                        size="icon"
                                        className="text-white hover:text-white hover:bg-white hover:bg-opacity-20"
                                    >
                                        <Copy size={20} />
                                    </Button>
                                </div>
                                <div className="w-full h-px bg-white my-4"></div>
                                <p>Tokens:</p>
                                {
                                    tokens.map((token, index) => (
                                        <div key={index} className="flex items-center space-x-2">
                                            <p className="truncate">{index+1}.</p>
                                            <p className="truncate">Mint: {token.token_mint}</p>
                                            <p className="truncate">Amount: {token.token_amount}</p>
                                        </div>
                                    ))
                                }
                            </div>
                            </AccordionContent>
                        </AccordionItem>
                        </Accordion>)}
                    {!isWalletConnected && (
                        <Input
                        type="text"
                        placeholder="Public Address"
                        value={publicAddress}
                        onChange={(e) => setPublicAddress(e.target.value)}
                        className="mb-6 me-6 bg-black border-white focus:!border-[#FFFFFF] focus:!ring-[#FFFFFF] focus:!ring-opacity-50 text-white placeholder-gray-500 text-lg py-6"
                        />)}
                    <Input
                        type="number"
                        placeholder="Airdrop Amount"
                        value={airdropAmount}
                        onChange={(e) => setAirdropAmount(e.target.value)}
                        className="mb-6 bg-black border-white focus:!border-[#FFFFFF] focus:!ring-[#FFFFFF] focus:!ring-opacity-50 text-white placeholder-gray-500 text-lg py-6"
                    />
                    <Button onClick={handleAirdrop} className="w-full font-semibold mb-6 bg-black text-white hover:bg-white hover:text-black border border-[#FFFFFF] text-xl py-6 px-4 me-2">
                        Airdrop
                    </Button>
                    {isWalletConnected && (
                        <div>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button className="w-full font-semibold mb-6 bg-black text-white hover:bg-white hover:text-black border border-[#FFFFFF] text-xl py-6 px-4 me-2">
                                        Send SOL
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px] bg-black text-white">
                                    <DialogHeader>
                                    <DialogTitle>Share some free SOL with a freind</DialogTitle>
                                    <DialogDescription>
                                        Enter a public address and the amount of SOL you want to send
                                    </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="receiver" className="text-right">
                                            Receiver Address
                                            </Label>
                                            <Input
                                            id="receiver"
                                            placeholder="Public Address"
                                            className="col-span-3"
                                            onChange={(e) => setTo(e.target.value)}
                                            />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="amount" className="text-right">
                                            SOL Amount
                                            </Label>
                                            <Input
                                            id="amount"
                                            placeholder="SOL Amount"
                                            className="col-span-3"
                                            onChange={(e) => setAmount(parseInt(e.target.value))}
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                    <Button onClick={sendSolana} type="submit" className="bg-white text-black">Send</Button>
                                    </DialogFooter>
                                </DialogContent>
                                </Dialog>
                        </div>
                    )}
                    <div className="flex justify-center">
                        <WalletMultiButton/>
                        <div className="me-2"> {/* couldn't figure out how to style these adapter buttons */}</div>
                        <WalletDisconnectButton/>
                    </div>
                    </div>
                </main>
                
                <footer className="mt-auto py-4 px-12 bg-black">
                    <div className="container mx-auto px-4 flex justify-between items-center">
                    <p className="text-md bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
                        Designed and developed by Arav Bhivgade
                    </p>
                    <div className="flex space-x-4">
                        <a href="https://x.com/arav190720" target="_blank" className="text-pink-500 transform transition-all duration-300 hover:scale-105">
                        <Twitter size={20} />
                        </a>
                        <a href="https://www.linkedin.com/in/aravbhivgade" target="_blank" className="text-pink-500 transform transition-all duration-300 hover:scale-105">
                        <Linkedin size={20} />
                        </a>
                        <a href="https://github.com/bhivgadearav" target="_blank" className="text-pink-500 transform transition-all duration-300 hover:scale-105">
                        <Github size={20} />
                        </a>
                        <a href="mailto:bhivgadearav0@gmail.com" target="_blank" className="text-pink-500 transform transition-all duration-300 hover:scale-105">
                        <Mail size={20} />
                        </a>
                    </div>
                    </div>
                </footer>
                </div>
        </>
    )
}