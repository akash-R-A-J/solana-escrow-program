import { FC } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export const Header: FC = () => {
    const { publicKey } = useWallet();

    return (
        <header className="header">
            <div className="container header-content">
                <div className="logo">
                    <div className="logo-icon">⚔️</div>
                    Escrow
                </div>

                <div className="network-badge">devnet</div>

                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    {publicKey ? (
                        <div className="wallet-connected">
                            <span className="wallet-address">
                                {publicKey.toString().slice(0, 4)}...
                                {publicKey.toString().slice(-4)}
                            </span>
                            <WalletMultiButton />
                        </div>
                    ) : (
                        <WalletMultiButton className="wallet-button" />
                    )}
                </div>
            </div>
        </header>
    );
};
