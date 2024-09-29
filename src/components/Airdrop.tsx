import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Github, Linkedin, Mail, Twitter, Copy } from "lucide-react"
import { useEffect, useState } from "react"
import { WalletMultiButton, WalletDisconnectButton } from "@solana/wallet-adapter-react-ui"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { PublicKey } from "@solana/web3.js"
import { useToast } from "@/hooks/use-toast"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import bs58 from 'bs58';
import { ed25519 } from '@noble/curves/ed25519';

export default function Airdrop() {
    const [publicAddress, setPublicAddress] = useState("")
    const [airdropAmount, setAirdropAmount] = useState("")
    const [balance, setBalance] = useState(0)
    const wallet = useWallet()
    const { connection } = useConnection()
    const { toast } = useToast()

    const [isWalletConnected, setIsWalletConnected] = useState(false) 
    const [validInput, setValidInput] = useState(false)

    useEffect(() => {
        setIsWalletConnected(wallet.connected)
        wallet.connected ? setPublicAddress(wallet.publicKey?.toString() || publicAddress) : setPublicAddress("")
        wallet.connected ? setAirdropAmount(airdropAmount) : setAirdropAmount("")
        const getWalletBalance = async () => {
            if (!validInput){
                const pubKey = wallet.publicKey || new PublicKey(publicAddress)
                const balance = await connection.getBalance(pubKey)
                setBalance(balance / 1_000_000_000)
            }
        }
        getWalletBalance()
        return () => {
            setPublicAddress("")
            setIsWalletConnected(false)
            setBalance(0)
        }
    }, [wallet])

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
        if (!validInput){
            const result = await authenticateWallet()
            if (!result){
                return
            }
        }
        const pubKey = wallet.publicKey || new PublicKey(publicAddress)
        if(!pubKey){
            toast({
                title: "Invalid Public Address",
                description: "Please enter a valid public address",
            })
            return
        }
        if(!airdropAmount || parseInt(airdropAmount) == 0){
            toast({
                title: "Invalid Amount",
                description: "Please enter a valid airdrop amount",
            })
            return
        }
        try {
            await connection.requestAirdrop(pubKey, parseInt(airdropAmount)*1_000_000_000)
            toast({
                title: "Airdrop Successful",
                description: `${airdropAmount} SOL sent to ${pubKey.toBase58()}`,
            })
        } catch (error) {
            console.error(error)
        }
    }

    const getBalance = async () => {
        if(!wallet.connected && !publicAddress){
            toast({
                title: "No Valid Wallet",
                description: "Please connect your wallet or enter a valid public address",
            })
            return
        }
        const pubKey = wallet.publicKey || new PublicKey(publicAddress)
        if(!pubKey){
            toast({
                title: "Invalid Public Address",
                description: "Please enter a valid public address",
            })
            return
        }
        try {
            const balance = await connection.getBalance(pubKey)
            setBalance(balance / 1_000_000_000)
            setIsWalletConnected(true)
            setValidInput(true)
        } catch (error) {
            console.error(error)
        }
    }

    const authenticateWallet = async () => {
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
        const encodedMessage = new TextEncoder().encode("authenticate wallet ownership");
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

    const removeWallet = () => {
        setPublicAddress("")
        setIsWalletConnected(false)
        setValidInput(false)
        toast({
            title: "Wallet Removed",
            description: "Wallet removed successfully",
        })
    }

    return (
        <>
            <div className="h-screen flex flex-col bg-black text-white">
                <main className="flex-grow container mx-auto px-6 py-12 content-center">
                    <div className="max-w-2xl mx-auto">
                    <h1 className="text-5xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">Solana Faucet</h1>
                    <p className="text-center mb-6 text-gray-300 text-xl">
                        Wanna try out projects on Solana?<br />
                        Get sol airdrops on devnet you can make them real.
                    </p>
                    {/* <p className="text-center text-blue-500 font-semibold mb-8 text-xl">
                        This tool does *NOT* give real $SOL/Solana Tokens.
                    </p> */}
                    {isWalletConnected || validInput ? (
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
                            </div>
                            </AccordionContent>
                        </AccordionItem>
                        </Accordion>
                    ): null}
                    {!isWalletConnected && (
                        <div className="flex items-center">
                            <Input
                            type="text"
                            placeholder="Public Address"
                            value={publicAddress}
                            onChange={(e) => setPublicAddress(e.target.value)}
                            className="mb-6 me-6 bg-black border-white focus:!border-[#FFFFFF] focus:!ring-[#FFFFFF] focus:!ring-opacity-50 text-white placeholder-gray-500 text-lg py-6"
                            />
                            <Button onClick={getBalance} className="w-2/6 font-semibold mb-6 bg-black text-white hover:bg-white hover:text-black border border-[#FFFFFF] text-xl py-6 px-4 me-2">
                                Get Balance
                            </Button>
                        </div>
                    )}
                    
                   
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
                    {validInput ? (
                        <Button onClick={removeWallet} className="w-full font-semibold mb-6 bg-white text-black hover:bg-black hover:text-white border border-[#FFFFFF] text-xl py-6 px-4 me-2">
                            Remove Wallet
                        </Button>
                    ) : 
                    (<div className="flex justify-center">
                        <WalletMultiButton/>
                        <div className="me-2"> {/* couldn't figure out how to style these adapter buttons */}</div>
                        <WalletDisconnectButton/>
                    </div>)}
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