"use client";

import dynamic from "next/dynamic";
import { APP_NAME } from "~/lib/constants";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider, useAccount } from 'wagmi'
import { config } from '~/lib/config'
import { Connection } from '~/lib/connection'
import { WalletOptions } from '~/lib/wallet-options'
import { SendTransaction } from '~/lib/send-transaction'

// note: dynamic import is required for components that use the Frame SDK
const AppComponent = dynamic(() => import("~/components/App"), {
  ssr: false,
});

const queryClient = new QueryClient()

function ConnectWallet() {
  const { address } = useAccount()
  if (address) return <Connection />
  return <WalletOptions />
}

export default function App(
  { title }: { title?: string } = { title: APP_NAME }
) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <AppComponent title={title} />
        {/* <ConnectWallet /> */}
        {/* <SendTransaction /> */}
      </QueryClientProvider>
    </WagmiProvider>
  )
}
