import { FC, useState, useEffect } from "react";
import type { OfferWithPublicKey } from "../idl/types";
import { getTokenByMint, Token } from "../constants";
import { fromTokenAmount, shortenAddress } from "../utils";
import { useEscrow } from "../hooks";

interface OfferCardProps {
    offer: OfferWithPublicKey;
    isOwner: boolean;
    onTake?: (offer: OfferWithPublicKey) => void;
    onRevoke?: (offer: OfferWithPublicKey) => void;
}

export const OfferCard: FC<OfferCardProps> = ({
    offer,
    isOwner,
    onTake,
    onRevoke,
}) => {
    const { getMintDecimals } = useEscrow();
    const [tokenA, setTokenA] = useState<Token | null>(null);
    const [tokenB, setTokenB] = useState<Token | null>(null);
    const [decimalsA, setDecimalsA] = useState(9);
    const [decimalsB, setDecimalsB] = useState(9);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadTokenInfo = async () => {
            const foundA = getTokenByMint(offer.tokenMintA);
            const foundB = getTokenByMint(offer.tokenMintB);

            setTokenA(foundA || null);
            setTokenB(foundB || null);

            if (foundA) {
                setDecimalsA(foundA.decimals);
            } else {
                const d = await getMintDecimals(offer.tokenMintA);
                setDecimalsA(d);
            }

            if (foundB) {
                setDecimalsB(foundB.decimals);
            } else {
                const d = await getMintDecimals(offer.tokenMintB);
                setDecimalsB(d);
            }
        };

        loadTokenInfo();
    }, [offer, getMintDecimals]);

    const vaultAmount = fromTokenAmount(offer.vaultBalance, decimalsA);
    const demandedAmount = fromTokenAmount(offer.tokenBDemandedAmount, decimalsB);

    const handleAction = async (action: "take" | "revoke") => {
        setLoading(true);
        try {
            if (action === "take" && onTake) {
                await onTake(offer);
            } else if (action === "revoke" && onRevoke) {
                await onRevoke(offer);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="offer-card">
            <div className="offer-header">
                <span className="offer-id">#{offer.id.toString().slice(-8)}</span>
                <span className="offer-status active">active</span>
            </div>

            <div className="offer-exchange">
                <div className="offer-token">
                    <div className="token-icon">
                        {tokenA?.logoUrl ? (
                            <img src={tokenA.logoUrl} alt={tokenA.symbol} />
                        ) : (
                            "🪙"
                        )}
                    </div>
                    <span className="token-amount">{vaultAmount.toFixed(4)}</span>
                    <span className="token-symbol">{tokenA?.symbol || "TOKEN"}</span>
                </div>

                <span className="exchange-arrow">→</span>

                <div className="offer-token">
                    <div className="token-icon">
                        {tokenB?.logoUrl ? (
                            <img src={tokenB.logoUrl} alt={tokenB.symbol} />
                        ) : (
                            "🪙"
                        )}
                    </div>
                    <span className="token-amount">{demandedAmount.toFixed(4)}</span>
                    <span className="token-symbol">{tokenB?.symbol || "TOKEN"}</span>
                </div>
            </div>

            <div className="offer-details">
                <div className="offer-detail-row">
                    <span className="offer-detail-label">maker</span>
                    <span className="offer-detail-value">
                        {shortenAddress(offer.offerMaker, 6)}
                    </span>
                </div>
                <div className="offer-detail-row">
                    <span className="offer-detail-label">rate</span>
                    <span className="offer-detail-value">
                        1 {tokenA?.symbol || "A"} = {(demandedAmount / vaultAmount).toFixed(4)}{" "}
                        {tokenB?.symbol || "B"}
                    </span>
                </div>
            </div>

            <div className="offer-actions">
                {isOwner ? (
                    <button
                        className="btn btn-danger btn-full"
                        onClick={() => handleAction("revoke")}
                        disabled={loading}
                    >
                        {loading ? <span className="loader" /> : "Revoke Offer"}
                    </button>
                ) : (
                    <button
                        className="btn btn-success btn-full"
                        onClick={() => handleAction("take")}
                        disabled={loading}
                    >
                        {loading ? <span className="loader" /> : "Take Offer"}
                    </button>
                )}
            </div>
        </div>
    );
};
