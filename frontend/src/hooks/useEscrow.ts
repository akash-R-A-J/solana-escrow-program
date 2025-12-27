import { useState, useCallback, useMemo } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { AnchorProvider } from "@coral-xyz/anchor";
import { EscrowService } from "../services/escrowService";
import type {
    OfferWithPublicKey,
    MakeOfferParams,
    TakeOfferParams,
    RevokeOfferParams,
} from "../idl/types";
import { generateOfferId, validateOfferParams } from "../utils/programUtils";

export function useEscrow() {
    const { connection } = useConnection();
    const wallet = useWallet();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const escrowService = useMemo(() => {
        if (!wallet.publicKey || !wallet.signTransaction) return null;

        const provider = new AnchorProvider(
            connection,
            wallet as any,
            { commitment: "confirmed" }
        );

        return new EscrowService(provider);
    }, [connection, wallet]);

    const makeOffer = useCallback(
        async (
            tokenMintA: string,
            tokenMintB: string,
            tokenAOfferedAmount: bigint,
            tokenBDemandedAmount: bigint
        ): Promise<{ txSignature: string; offerId: bigint } | null> => {
            if (!escrowService || !wallet.publicKey) {
                setError("wallet not connected");
                return null;
            }

            const validation = validateOfferParams(
                tokenAOfferedAmount,
                tokenBDemandedAmount,
                tokenMintA,
                tokenMintB
            );

            if (!validation.valid) {
                setError(validation.error || "invalid params");
                return null;
            }

            setLoading(true);
            setError(null);

            try {
                const id = generateOfferId();

                const params: MakeOfferParams = {
                    id,
                    tokenAOfferedAmount,
                    tokenBDemandedAmount,
                    tokenMintA,
                    tokenMintB,
                };

                const txSignature = await escrowService.makeOffer(params, wallet.publicKey);

                return { txSignature, offerId: id };
            } catch (err: any) {
                setError(err.message || "failed to create offer");
                return null;
            } finally {
                setLoading(false);
            }
        },
        [escrowService, wallet.publicKey]
    );

    const takeOffer = useCallback(
        async (offer: OfferWithPublicKey): Promise<string | null> => {
            if (!escrowService || !wallet.publicKey) {
                setError("wallet not connected");
                return null;
            }

            setLoading(true);
            setError(null);

            try {
                const params: TakeOfferParams = {
                    offerId: offer.id,
                    offerPublicKey: offer.publicKey,
                    offerMaker: offer.offerMaker,
                    tokenMintA: offer.tokenMintA,
                    tokenMintB: offer.tokenMintB,
                };

                const txSignature = await escrowService.takeOffer(params, wallet.publicKey);

                return txSignature;
            } catch (err: any) {
                setError(err.message || "failed to take offer");
                return null;
            } finally {
                setLoading(false);
            }
        },
        [escrowService, wallet.publicKey]
    );

    const revokeOffer = useCallback(
        async (offer: OfferWithPublicKey): Promise<string | null> => {
            if (!escrowService || !wallet.publicKey) {
                setError("wallet not connected");
                return null;
            }

            if (offer.offerMaker !== wallet.publicKey.toString()) {
                setError("only the offer maker can revoke");
                return null;
            }

            setLoading(true);
            setError(null);

            try {
                const params: RevokeOfferParams = {
                    offerId: offer.id,
                    offerPublicKey: offer.publicKey,
                    tokenMintA: offer.tokenMintA,
                };

                const txSignature = await escrowService.revokeOffer(params, wallet.publicKey);

                return txSignature;
            } catch (err: any) {
                setError(err.message || "failed to revoke offer");
                return null;
            } finally {
                setLoading(false);
            }
        },
        [escrowService, wallet.publicKey]
    );

    const getOffer = useCallback(
        async (offerPublicKey: string): Promise<OfferWithPublicKey | null> => {
            if (!escrowService) return null;

            try {
                return await escrowService.getOffer(offerPublicKey);
            } catch {
                return null;
            }
        },
        [escrowService]
    );

    const getAllOffers = useCallback(async (): Promise<OfferWithPublicKey[]> => {
        if (!escrowService) return [];

        setLoading(true);
        try {
            return await escrowService.getAllOffers();
        } catch {
            return [];
        } finally {
            setLoading(false);
        }
    }, [escrowService]);

    const getMyOffers = useCallback(async (): Promise<OfferWithPublicKey[]> => {
        if (!escrowService || !wallet.publicKey) return [];

        setLoading(true);
        try {
            return await escrowService.getOffersByMaker(wallet.publicKey.toString());
        } catch {
            return [];
        } finally {
            setLoading(false);
        }
    }, [escrowService, wallet.publicKey]);

    const getTokenBalance = useCallback(
        async (tokenMint: string): Promise<bigint> => {
            if (!escrowService || !wallet.publicKey) return BigInt(0);

            try {
                return await escrowService.getTokenBalance(tokenMint, wallet.publicKey.toString());
            } catch {
                return BigInt(0);
            }
        },
        [escrowService, wallet.publicKey]
    );

    const getMintDecimals = useCallback(
        async (tokenMint: string): Promise<number> => {
            if (!escrowService) return 9;

            try {
                return await escrowService.getMintDecimals(tokenMint);
            } catch {
                return 9;
            }
        },
        [escrowService]
    );

    return {
        makeOffer,
        takeOffer,
        revokeOffer,
        getOffer,
        getAllOffers,
        getMyOffers,
        getTokenBalance,
        getMintDecimals,
        loading,
        error,
        clearError: () => setError(null),
        isConnected: !!wallet.publicKey,
        walletAddress: wallet.publicKey?.toString() || null,
    };
}
