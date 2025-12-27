import { FC, ReactNode, useMemo } from "react";
import {
    ConnectionProvider,
    WalletProvider as SolanaWalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
    PhantomWalletAdapter,
    SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";

import "@solana/wallet-adapter-react-ui/styles.css";

interface WalletProviderProps {
    children: ReactNode;
}

export const WalletProvider: FC<WalletProviderProps> = ({ children }) => {
    const endpoint = import.meta.env.VITE_RPC_ENDPOINT || "https://api.devnet.solana.com";

    const wallets = useMemo(
        () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
        []
    );

    return (
        <ConnectionProvider endpoint={endpoint}>
            <SolanaWalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>{children}</WalletModalProvider>
            </SolanaWalletProvider>
        </ConnectionProvider>
    );
};
