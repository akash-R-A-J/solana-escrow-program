import { FC, useState, useEffect } from "react";
import type { OfferWithPublicKey } from "../idl/types";
import { getTokenByMint, Token } from "../constants";
import { fromTokenAmount, shortenAddress } from "../utils";
import { useEscrow } from "../hooks";

interface TakeOfferModalProps {
    offer: OfferWithPublicKey;
    onClose: () => void;
    onConfirm: () => void;
    loading: boolean;
}

export const TakeOfferModal: FC<TakeOfferModalProps> = ({
    offer,
    onClose,
    onConfirm,
    loading,
}) => {
    const { getMintDecimals, getTokenBalance } = useEscrow();
    const [tokenA, setTokenA] = useState<Token | null>(null);
    const [tokenB, setTokenB] = useState<Token | null>(null);
    const [decimalsA, setDecimalsA] = useState(9);
    const [decimalsB, setDecimalsB] = useState(9);
    const [userBalanceB, setUserBalanceB] = useState<bigint>(BigInt(0));

    useEffect(() => {
        const loadInfo = async () => {
            const foundA = getTokenByMint(offer.tokenMintA);
            const foundB = getTokenByMint(offer.tokenMintB);

            setTokenA(foundA || null);
            setTokenB(foundB || null);

            const dA = foundA?.decimals || (await getMintDecimals(offer.tokenMintA));
            const dB = foundB?.decimals || (await getMintDecimals(offer.tokenMintB));

            setDecimalsA(dA);
            setDecimalsB(dB);

            const balance = await getTokenBalance(offer.tokenMintB);
            setUserBalanceB(balance);
        };

        loadInfo();
    }, [offer, getMintDecimals, getTokenBalance]);

    const vaultAmount = fromTokenAmount(offer.vaultBalance, decimalsA);
    const demandedAmount = fromTokenAmount(offer.tokenBDemandedAmount, decimalsB);
    const userBalance = fromTokenAmount(userBalanceB, decimalsB);
    const hasEnoughBalance = userBalanceB >= offer.tokenBDemandedAmount;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 className="modal-title">Take This Offer</h3>
                    <button className="modal-close" onClick={onClose}>
                        ×
                    </button>
                </div>

                <div className="modal-body">
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: 24,
                        }}
                    >
                        <div style={{ textAlign: "center" }}>
                            <div className="token-icon" style={{ margin: "0 auto" }}>
                                {tokenA?.logoUrl ? (
                                    <img src={tokenA.logoUrl} alt={tokenA.symbol} />
                                ) : (
                                    "🪙"
                                )}
                            </div>
                            <p
                                style={{
                                    fontSize: 24,
                                    fontWeight: 700,
                                    marginTop: 8,
                                }}
                            >
                                {vaultAmount.toFixed(4)}
                            </p>
                            <p style={{ color: "var(--text-secondary)" }}>
                                {tokenA?.symbol || "TOKEN A"}
                            </p>
                            <p
                                style={{
                                    fontSize: 12,
                                    color: "var(--success)",
                                    marginTop: 4,
                                }}
                            >
                                you receive
                            </p>
                        </div>

                        <span style={{ fontSize: 32, color: "var(--accent-primary)" }}>⇄</span>

                        <div style={{ textAlign: "center" }}>
                            <div className="token-icon" style={{ margin: "0 auto" }}>
                                {tokenB?.logoUrl ? (
                                    <img src={tokenB.logoUrl} alt={tokenB.symbol} />
                                ) : (
                                    "🪙"
                                )}
                            </div>
                            <p
                                style={{
                                    fontSize: 24,
                                    fontWeight: 700,
                                    marginTop: 8,
                                }}
                            >
                                {demandedAmount.toFixed(4)}
                            </p>
                            <p style={{ color: "var(--text-secondary)" }}>
                                {tokenB?.symbol || "TOKEN B"}
                            </p>
                            <p
                                style={{
                                    fontSize: 12,
                                    color: "var(--error)",
                                    marginTop: 4,
                                }}
                            >
                                you pay
                            </p>
                        </div>
                    </div>

                    <div className="offer-details">
                        <div className="offer-detail-row">
                            <span className="offer-detail-label">offer maker</span>
                            <span className="offer-detail-value">
                                {shortenAddress(offer.offerMaker, 6)}
                            </span>
                        </div>
                        <div className="offer-detail-row">
                            <span className="offer-detail-label">your balance</span>
                            <span
                                className="offer-detail-value"
                                style={{ color: hasEnoughBalance ? "var(--success)" : "var(--error)" }}
                            >
                                {userBalance.toFixed(4)} {tokenB?.symbol || "TOKEN B"}
                            </span>
                        </div>
                        <div className="offer-detail-row">
                            <span className="offer-detail-label">exchange rate</span>
                            <span className="offer-detail-value">
                                1 {tokenA?.symbol || "A"} = {(demandedAmount / vaultAmount).toFixed(4)}{" "}
                                {tokenB?.symbol || "B"}
                            </span>
                        </div>
                    </div>

                    {!hasEnoughBalance && (
                        <div
                            style={{
                                background: "rgba(239, 68, 68, 0.1)",
                                border: "1px solid var(--error)",
                                borderRadius: "var(--radius-sm)",
                                padding: 12,
                                marginTop: 16,
                                fontSize: 14,
                                color: "var(--error)",
                            }}
                        >
                            ⚠️ you don't have enough {tokenB?.symbol || "tokens"} to take this offer.
                            you need {demandedAmount.toFixed(4)} but only have {userBalance.toFixed(4)}.
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>
                        Cancel
                    </button>
                    <button
                        className="btn btn-success"
                        onClick={onConfirm}
                        disabled={loading || !hasEnoughBalance}
                    >
                        {loading ? <span className="loader" /> : "Confirm Trade"}
                    </button>
                </div>
            </div>
        </div>
    );
};
