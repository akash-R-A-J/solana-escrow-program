import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";

export const PROGRAM_ID = new PublicKey(
    import.meta.env.VITE_PROGRAM_ID || "6kTpPk3Bm4SfY2KuLF5sH4cpsTwBUtyJ5j3prMB92i7Q"
);

export const OFFER_SEED = Buffer.from("offer");

export function getOfferPda(id: bigint | BN): [PublicKey, number] {
    const idBn = typeof id === "bigint" ? new BN(id.toString()) : id;
    const idBuffer = idBn.toArrayLike(Buffer, "le", 8);

    return PublicKey.findProgramAddressSync(
        [OFFER_SEED, idBuffer],
        PROGRAM_ID
    );
}

export function toTokenAmount(amount: number, decimals: number): bigint {
    return BigInt(Math.floor(amount * Math.pow(10, decimals)));
}

export function fromTokenAmount(amount: bigint, decimals: number): number {
    return Number(amount) / Math.pow(10, decimals);
}

export function calculateExchangeRate(
    offeredAmount: bigint,
    demandedAmount: bigint
): number {
    if (offeredAmount === BigInt(0)) return 0;
    return Number(demandedAmount) / Number(offeredAmount);
}

export function calculateRequiredAmount(
    vaultBalance: bigint,
    tokenBDemandedAmount: bigint,
    offeredDecimals: number,
    demandedDecimals: number
): { tokenAReceive: number; tokenBRequired: number } {
    return {
        tokenAReceive: fromTokenAmount(vaultBalance, offeredDecimals),
        tokenBRequired: fromTokenAmount(tokenBDemandedAmount, demandedDecimals),
    };
}

export function validateOfferParams(
    tokenAOfferedAmount: bigint,
    tokenBDemandedAmount: bigint,
    tokenMintA: string,
    tokenMintB: string
): { valid: boolean; error?: string } {
    if (tokenAOfferedAmount <= BigInt(0)) {
        return { valid: false, error: "offered amount must be greater than zero" };
    }

    if (tokenBDemandedAmount <= BigInt(0)) {
        return { valid: false, error: "demanded amount must be greater than zero" };
    }

    if (tokenMintA === tokenMintB) {
        return { valid: false, error: "token mints must be different" };
    }

    return { valid: true };
}

export function generateOfferId(): bigint {
    return BigInt(Date.now());
}

export function shortenAddress(address: string, chars = 4): string {
    return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}
