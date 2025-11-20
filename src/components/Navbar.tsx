"use client";

import { useWallet } from "~/lib/wallet-context";
import { Button } from "~/components/ui/button";
import { useEffect, useState } from "react";

export default function Navbar() {
  const { isConnected, address, connectWallet, disconnectWallet } = useWallet();

  const [hasWallet, setHasWallet] = useState(true);

  useEffect(() => {
    // Check if browser has any wallet provider installed
    const detected = typeof window !== "undefined" && window.ethereum;
    setHasWallet(!!detected);
  }, []);

  const handleConnect = () => {
    if (!hasWallet) {
      window.open("https://metamask.io/download/", "_blank");
      return;
    }
    connectWallet();
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b bg-background">
      <h1 className="text-lg font-bold">RaceX</h1>

      {isConnected ? (
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </span>
          <Button variant="outline" onClick={disconnectWallet}>
            Disconnect
          </Button>
        </div>
      ) : (
        <Button onClick={handleConnect}>
          {hasWallet ? "Connect Wallet" : "Install MetaMask"}
        </Button>
      )}
    </div>
  );
}
