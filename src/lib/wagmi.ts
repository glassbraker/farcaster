

import { createConfig, http } from 'wagmi';
import { mainnet, sepolia, localhost } from 'wagmi/chains';
import {defineChain} from 'viem';

// Custom Anvil chain for local development (chainId 31337)
export const anvil = defineChain({
	id: 31337,
	name: 'Anvil Local',
	network: 'anvil',
	nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
	rpcUrls: { default: { http: ['http://127.0.0.1:8545'] } },
});

export const wagmiConfig = createConfig({
	chains: [anvil, localhost, sepolia, mainnet],
	transports: {
		[anvil.id]: http(),
		[localhost.id]: http(),
		[sepolia.id]: http(),
		[mainnet.id]: http(),
	},
});
