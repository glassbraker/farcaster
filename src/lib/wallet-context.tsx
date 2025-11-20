// wallet-context.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import type { Connector } from "wagmi";

interface Bet {
  id: string;
  raceId: number;
  raceName: string;
  horseId: number;
  horseName: string;
  amount: number;
  odds: number;
  potentialWin: number;
  timestamp: number;
  status: "pending" | "won" | "lost";
}

interface WalletContextType {
  address: string | undefined;
  isConnected: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  balance: number;
  bets: Bet[];
  addBet: (bet: Omit<Bet, "id" | "timestamp" | "status">) => void;
  updateBetStatus: (betId: string, status: "won" | "lost") => void;
  addCoins: (amount: number) => void;
  stats: {
    totalBets: number;
    totalWins: number;
    totalLosses: number;
    winRate: number;
    totalWon: number;
    totalLost: number;
  };
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  // wagmi hooks
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  // connect/disconnect wrappers
  const connectWallet = async () => {
    try {
      // prefer MetaMask, then injected, then first connector
      const preferred: Connector | undefined =
        connectors.find((c) => c.name?.toLowerCase().includes("metamask")) ??
        connectors.find((c) => c.name?.toLowerCase().includes("injected")) ??
        connectors[0];

      if (!preferred) {
        console.warn("No connector available to connect");
        return;
      }

      await connect({ connector: preferred });
    } catch (err) {
      console.error("connectWallet error:", err);
    }
  };

  const disconnectWallet = () => {
    try {
      disconnect();
    } catch (err) {
      console.error("disconnect error:", err);
    }
  };

  // existing app state
  const [balance, setBalance] = useState<number>(1000);
  const [bets, setBets] = useState<Bet[]>([]);

  useEffect(() => {
    const savedBalance = typeof window !== "undefined" ? localStorage.getItem("wallet-balance") : null;
    const savedBets = typeof window !== "undefined" ? localStorage.getItem("wallet-bets") : null;

    if (savedBalance) setBalance(Number.parseFloat(savedBalance));
    if (savedBets) {
      try {
        setBets(JSON.parse(savedBets));
      } catch {
        setBets([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("wallet-balance", balance.toString());
  }, [balance]);

  useEffect(() => {
    localStorage.setItem("wallet-bets", JSON.stringify(bets));
  }, [bets]);

  const addBet = (bet: Omit<Bet, "id" | "timestamp" | "status">) => {
    const newBet: Bet = {
      ...bet,
      id: `bet-${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      status: "pending",
    };

    setBets((prev) => [newBet, ...prev]);
    setBalance((prev) => prev - bet.amount);
  };

  const updateBetStatus = (betId: string, status: "won" | "lost") => {
    setBets((prev) =>
      prev.map((bet) => {
        if (bet.id === betId && bet.status === "pending") {
          if (status === "won") {
            setBalance((b) => b + bet.potentialWin);
          }
          return { ...bet, status };
        }
        return bet;
      })
    );
  };

  const addCoins = (amount: number) => {
    setBalance((prev) => prev + amount);
  };

  const stats = {
    totalBets: bets.length,
    totalWins: bets.filter((b) => b.status === "won").length,
    totalLosses: bets.filter((b) => b.status === "lost").length,
    winRate: bets.length > 0 ? (bets.filter((b) => b.status === "won").length / bets.length) * 100 : 0,
    totalWon: bets.filter((b) => b.status === "won").reduce((sum, b) => sum + b.potentialWin, 0),
    totalLost: bets.filter((b) => b.status === "lost").reduce((sum, b) => sum + b.amount, 0),
  };

  return (
    <WalletContext.Provider
      value={{
        address,
        isConnected,
        connectWallet,
        disconnectWallet,
        balance,
        bets,
        addBet,
        updateBetStatus,
        addCoins,
        stats,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
