import { FC, useState } from "react";
import { DEVNET_TOKENS, Token } from "../constants";
import { useEscrow } from "../hooks";
import { toTokenAmount } from "../utils";

interface CreateOfferProps {
    onSuccess?: () => void;
}

export const CreateOffer: FC<CreateOfferProps> = ({ onSuccess }) => {
    const { makeOffer, loading, isConnected, getMintDecimals } = useEscrow();

    const [tokenA, setTokenA] = useState<Token | null>(null);
    const [tokenB, setTokenB] = useState<Token | null>(null);
    const [amountA, setAmountA] = useState("");
    const [amountB, setAmountB] = useState("");
    const [customMintA, setCustomMintA] = useState("");
    const [customMintB, setCustomMintB] = useState("");
    const [useCustomA, setUseCustomA] = useState(false);
    const [useCustomB, setUseCustomB] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        const mintA = useCustomA ? customMintA : tokenA?.mint;
        const mintB = useCustomB ? customMintB : tokenB?.mint;

        if (!mintA || !mintB) {
            setError("please select both tokens");
            return;
        }

        if (!amountA || !amountB) {
            setError("please enter both amounts");
            return;
        }

        if (mintA === mintB) {
            setError("tokens must be different");
            return;
        }

        try {
            const decimalsA = useCustomA ? await getMintDecimals(mintA) : tokenA!.decimals;
            const decimalsB = useCustomB ? await getMintDecimals(mintB) : tokenB!.decimals;

            const tokenAAmount = toTokenAmount(parseFloat(amountA), decimalsA);
            const tokenBAmount = toTokenAmount(parseFloat(amountB), decimalsB);

            const result = await makeOffer(mintA, mintB, tokenAAmount, tokenBAmount);

            if (result) {
                setSuccess(`offer created! tx: ${result.txSignature.slice(0, 8)}...`);
                setAmountA("");
                setAmountB("");
                setTokenA(null);
                setTokenB(null);
                onSuccess?.();
            }
        } catch (err: any) {
            setError(err.message || "failed to create offer");
        }
    };

    if (!isConnected) {
        return null;
    }

    return (
        <div className="card" style={{ maxWidth: "600px" }}>
            <h2 className="section-title">
                <span className="section-title-icon">📝</span>
                Create New Offer
            </h2>

            <form onSubmit={handleSubmit}>
                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">You Offer</label>
                        {!useCustomA ? (
                            <select
                                className="form-select"
                                value={tokenA?.mint || ""}
                                onChange={(e) => {
                                    const token = DEVNET_TOKENS.find((t) => t.mint === e.target.value);
                                    setTokenA(token || null);
                                }}
                            >
                                <option value="">Select token</option>
                                {DEVNET_TOKENS.map((token) => (
                                    <option key={token.mint} value={token.mint}>
                                        {token.symbol} - {token.name}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Token mint address"
                                value={customMintA}
                                onChange={(e) => setCustomMintA(e.target.value)}
                            />
                        )}
                        <button
                            type="button"
                            onClick={() => setUseCustomA(!useCustomA)}
                            style={{
                                background: "transparent",
                                border: "none",
                                color: "var(--accent-primary)",
                                fontSize: "12px",
                                marginTop: "8px",
                                cursor: "pointer",
                            }}
                        >
                            {useCustomA ? "use token list" : "enter custom mint"}
                        </button>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Amount to Offer</label>
                        <input
                            type="number"
                            className="form-input"
                            placeholder="0.00"
                            value={amountA}
                            onChange={(e) => setAmountA(e.target.value)}
                            step="any"
                            min="0"
                        />
                    </div>
                </div>

                <div style={{ textAlign: "center", margin: "20px 0", fontSize: "24px" }}>
                    ⇅
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">You Want</label>
                        {!useCustomB ? (
                            <select
                                className="form-select"
                                value={tokenB?.mint || ""}
                                onChange={(e) => {
                                    const token = DEVNET_TOKENS.find((t) => t.mint === e.target.value);
                                    setTokenB(token || null);
                                }}
                            >
                                <option value="">Select token</option>
                                {DEVNET_TOKENS.map((token) => (
                                    <option key={token.mint} value={token.mint}>
                                        {token.symbol} - {token.name}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Token mint address"
                                value={customMintB}
                                onChange={(e) => setCustomMintB(e.target.value)}
                            />
                        )}
                        <button
                            type="button"
                            onClick={() => setUseCustomB(!useCustomB)}
                            style={{
                                background: "transparent",
                                border: "none",
                                color: "var(--accent-primary)",
                                fontSize: "12px",
                                marginTop: "8px",
                                cursor: "pointer",
                            }}
                        >
                            {useCustomB ? "use token list" : "enter custom mint"}
                        </button>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Amount You Want</label>
                        <input
                            type="number"
                            className="form-input"
                            placeholder="0.00"
                            value={amountB}
                            onChange={(e) => setAmountB(e.target.value)}
                            step="any"
                            min="0"
                        />
                    </div>
                </div>

                {error && (
                    <div style={{ color: "var(--error)", marginBottom: "16px", fontSize: "14px" }}>
                        {error}
                    </div>
                )}

                {success && (
                    <div style={{ color: "var(--success)", marginBottom: "16px", fontSize: "14px" }}>
                        {success}
                    </div>
                )}

                <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                    {loading ? <span className="loader" /> : "Create Offer"}
                </button>
            </form>
        </div>
    );
};
