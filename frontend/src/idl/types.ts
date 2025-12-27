export interface OfferAccount {
    id: bigint;
    offerMaker: string;
    tokenMintA: string;
    tokenMintB: string;
    tokenBDemandedAmount: bigint;
    bump: number;
}

export interface OfferWithPublicKey extends OfferAccount {
    publicKey: string;
    vaultAddress: string;
    vaultBalance: bigint;
}

export interface MakeOfferParams {
    id: bigint;
    tokenAOfferedAmount: bigint;
    tokenBDemandedAmount: bigint;
    tokenMintA: string;
    tokenMintB: string;
}

export interface TakeOfferParams {
    offerId: bigint;
    offerPublicKey: string;
    offerMaker: string;
    tokenMintA: string;
    tokenMintB: string;
}

export interface RevokeOfferParams {
    offerId: bigint;
    offerPublicKey: string;
    tokenMintA: string;
}
