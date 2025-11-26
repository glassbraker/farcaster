"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import {Connection} from "~/lib/connection"
import {useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract} from "wagmi"
import {parseEther} from "viem"
import {TEST_COIN_ADDRESS} from "~/lib/TestCoin.address.ts"
import {TestCoinAbi} from "~/lib/abis/TestCoinAbi.ts"
import {anvil} from "~/lib/config.ts"


interface Bet {
    id: string
    raceId: number
    raceName: string
    horseId: number
    horseName: string
    amount: number
    odds: number
    potentialWin: number
    timestamp: number
    status: "pending" | "won" | "lost"
}

interface WalletContextType {
    balance: number
    bets: Bet[]
    addBet: (bet: Omit<Bet, "id" | "timestamp" | "status">) => void
    updateBetStatus: (betId: string, status: "won" | "lost") => void
    addCoins: (amount: number) => void
    stats: {
        totalBets: number
        totalWins: number
        totalLosses: number
        winRate: number
        totalWon: number
        totalLost: number
    }
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: React.ReactNode }) {
    const { address } = useAccount();
    const { data: balance, refetch: refetchBalance } = useReadContract({
        address: TEST_COIN_ADDRESS,
        abi: TestCoinAbi,
        functionName: "balanceOf",
        args: [address],
        chainId: anvil.id,
    });
    const [bets, setBets] = useState<Bet[]>([]);

    // Load from localStorage on mount
    useEffect(() => {
        const savedBets = localStorage.getItem("wallet-bets");
        if (savedBets) setBets(JSON.parse(savedBets));
    }, [])

    // Save to localStorage whenever balance or bets change
    useEffect(() => {
        // No-op: balance is always read from contract
    }, [balance])

    useEffect(() => {
        localStorage.setItem("wallet-bets", JSON.stringify(bets));
    }, [bets])

    const {writeContract, data: txHash} = useWriteContract();
    const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

    const addBet = async (bet: Omit<Bet, "id" | "timestamp" | "status">) => {
        if (!address) return;
        // Transfer coins to contract (simulate bet)
        await writeContract({
            address: TEST_COIN_ADDRESS,
            abi: TestCoinAbi,
            functionName: "transfer",
            args: ["0x0000000000000000000000000000000000000000", parseEther(bet.amount.toString())], // You may want to send to a betting contract address
            chainId: anvil.id,
        });
        refetchBalance();
        const newBet: Bet = {
            ...bet,
            id: `bet-${Date.now()}-${Math.random()}`,
            timestamp: Date.now(),
            status: "pending",
        };
        setBets((prev: Bet[]) => [newBet, ...prev]);
    }

    const updateBetStatus = (betId: string, status: "won" | "lost") => {
        setBets((prev: Bet[]) =>
            prev.map((bet: Bet) => {
                if (bet.id === betId && bet.status === "pending") {
                    if (status === "won" && address) {
                        // Mint coins to user for win
                        writeContract({
                            address: TEST_COIN_ADDRESS,
                            abi: TestCoinAbi,
                            functionName: "mint",
                            args: [address, parseEther(bet.potentialWin.toString())],
                            chainId: anvil.id,
                        });
                        refetchBalance();
                    }
                    return { ...bet, status };
                }
                return bet;
            })
        );
    }

    const addCoins = (amount: number) => {
        if (!address) return;
        writeContract({
            address: TEST_COIN_ADDRESS,
            abi: TestCoinAbi,
            functionName: "mint",
            args: [address, parseEther(amount.toString())],
            chainId: anvil.id,
        });
        refetchBalance();
    }

    const stats = {
        totalBets: bets.length,
        totalWins: bets.filter((b: Bet) => b.status === "won").length,
        totalLosses: bets.filter((b: Bet) => b.status === "lost").length,
        winRate: bets.length > 0 ? (bets.filter((b: Bet) => b.status === "won").length / bets.length) * 100 : 0,
        totalWon: bets.filter((b: Bet) => b.status === "won").reduce((sum: number, b: Bet) => sum + b.potentialWin, 0),
        totalLost: bets.filter((b: Bet) => b.status === "lost").reduce((sum: number, b: Bet) => sum + b.amount, 0),
    }

    return (
        <WalletContext.Provider value={{
            balance: Number(balance),
            bets,
            addBet,
            updateBetStatus,
            addCoins,
            stats
        }}>
            {children}
        </WalletContext.Provider>
    )
}

export function useWallet() {
    const context = useContext(WalletContext)
    if (context === undefined) {
        throw new Error("useWallet must be used within a WalletProvider")
    }
    return context
}
