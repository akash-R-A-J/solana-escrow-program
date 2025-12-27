import { PublicKey, Connection } from "@solana/web3.js";
import { Program, AnchorProvider, BN } from "@coral-xyz/anchor";
import {
    TOKEN_2022_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    getAssociatedTokenAddressSync,
    getMint,
    getAccount,
} from "@solana/spl-token";
import type { Escrow } from "../idl/escrow";
import idl from "../idl/escrow.json";
import type { OfferWithPublicKey, MakeOfferParams, TakeOfferParams, RevokeOfferParams } from "../idl/types";
import { getOfferPda } from "../utils/programUtils";

export class EscrowService {
    private program: Program<Escrow>;
    private connection: Connection;

    constructor(provider: AnchorProvider) {
        this.program = new Program(idl as unknown as Escrow, provider);
        this.connection = provider.connection;
    }

    private async getTokenProgramForMint(mint: PublicKey): Promise<PublicKey> {
        try {
            const mintInfo = await this.connection.getAccountInfo(mint);
            if (!mintInfo) throw new Error("mint not found");

            if (mintInfo.owner.equals(TOKEN_2022_PROGRAM_ID)) {
                return TOKEN_2022_PROGRAM_ID;
            }
            return TOKEN_PROGRAM_ID;
        } catch {
            return TOKEN_PROGRAM_ID;
        }
    }

    async makeOffer(params: MakeOfferParams, wallet: PublicKey): Promise<string> {
        const { id, tokenAOfferedAmount, tokenBDemandedAmount, tokenMintA, tokenMintB } = params;

        const tokenMintAPubkey = new PublicKey(tokenMintA);
        const tokenMintBPubkey = new PublicKey(tokenMintB);
        const tokenProgram = await this.getTokenProgramForMint(tokenMintAPubkey);

        const tx = await this.program.methods
            .makeOffer(
                new BN(id.toString()),
                new BN(tokenAOfferedAmount.toString()),
                new BN(tokenBDemandedAmount.toString())
            )
            .accountsPartial({
                tokenProgram: tokenProgram,
                tokenMintA: tokenMintAPubkey,
                tokenMintB: tokenMintBPubkey,
                offerMaker: wallet,
            })
            .rpc();

        return tx;
    }

    async takeOffer(params: TakeOfferParams, wallet: PublicKey): Promise<string> {
        const { offerPublicKey, tokenMintA, tokenMintB } = params;

        const offerPubkey = new PublicKey(offerPublicKey);
        const tokenMintAPubkey = new PublicKey(tokenMintA);
        const tokenMintBPubkey = new PublicKey(tokenMintB);
        const tokenProgramA = await this.getTokenProgramForMint(tokenMintAPubkey);

        const tx = await this.program.methods
            .takeOffer()
            .accountsPartial({
                tokenProgram: tokenProgramA,
                offerTaker: wallet,
                tokenMintA: tokenMintAPubkey,
                tokenMintB: tokenMintBPubkey,
                offer: offerPubkey,
            })
            .rpc();

        return tx;
    }

    async revokeOffer(params: RevokeOfferParams, wallet: PublicKey): Promise<string> {
        const { offerPublicKey, tokenMintA } = params;

        const offerPubkey = new PublicKey(offerPublicKey);
        const tokenMintAPubkey = new PublicKey(tokenMintA);
        const tokenProgram = await this.getTokenProgramForMint(tokenMintAPubkey);

        const tx = await this.program.methods
            .revokeOffer()
            .accountsPartial({
                tokenProgram: tokenProgram,
                offer: offerPubkey,
            })
            .rpc();

        return tx;
    }

    async getOffer(offerPublicKey: string): Promise<OfferWithPublicKey | null> {
        try {
            const offerPubkey = new PublicKey(offerPublicKey);
            const offerData = await this.program.account.offer.fetch(offerPubkey);

            const tokenProgram = await this.getTokenProgramForMint(
                new PublicKey(offerData.tokenMintA)
            );

            const vaultAddress = getAssociatedTokenAddressSync(
                new PublicKey(offerData.tokenMintA),
                offerPubkey,
                true,
                tokenProgram
            );

            let vaultBalance = BigInt(0);
            try {
                const vaultAccount = await getAccount(
                    this.connection,
                    vaultAddress,
                    undefined,
                    tokenProgram
                );
                vaultBalance = vaultAccount.amount;
            } catch {
                vaultBalance = BigInt(0);
            }

            return {
                publicKey: offerPublicKey,
                id: BigInt(offerData.id.toString()),
                offerMaker: offerData.offerMaker.toString(),
                tokenMintA: offerData.tokenMintA.toString(),
                tokenMintB: offerData.tokenMintB.toString(),
                tokenBDemandedAmount: BigInt(offerData.tokenBDemandedAmount.toString()),
                bump: offerData.bump,
                vaultAddress: vaultAddress.toString(),
                vaultBalance: vaultBalance,
            };
        } catch {
            return null;
        }
    }

    async getOfferById(id: bigint): Promise<OfferWithPublicKey | null> {
        const [offerPda] = getOfferPda(id);
        return this.getOffer(offerPda.toString());
    }

    async getAllOffers(): Promise<OfferWithPublicKey[]> {
        try {
            const accounts = await this.program.account.offer.all();
            const offers: OfferWithPublicKey[] = [];

            for (const account of accounts) {
                const offerData = account.account;

                const tokenProgram = await this.getTokenProgramForMint(
                    new PublicKey(offerData.tokenMintA)
                );

                const vaultAddress = getAssociatedTokenAddressSync(
                    new PublicKey(offerData.tokenMintA),
                    account.publicKey,
                    true,
                    tokenProgram
                );

                let vaultBalance = BigInt(0);
                try {
                    const vaultAccount = await getAccount(
                        this.connection,
                        vaultAddress,
                        undefined,
                        tokenProgram
                    );
                    vaultBalance = vaultAccount.amount;
                } catch {
                    vaultBalance = BigInt(0);
                }

                offers.push({
                    publicKey: account.publicKey.toString(),
                    id: BigInt(offerData.id.toString()),
                    offerMaker: offerData.offerMaker.toString(),
                    tokenMintA: offerData.tokenMintA.toString(),
                    tokenMintB: offerData.tokenMintB.toString(),
                    tokenBDemandedAmount: BigInt(offerData.tokenBDemandedAmount.toString()),
                    bump: offerData.bump,
                    vaultAddress: vaultAddress.toString(),
                    vaultBalance: vaultBalance,
                });
            }

            return offers;
        } catch {
            return [];
        }
    }

    async getOffersByMaker(maker: string): Promise<OfferWithPublicKey[]> {
        const allOffers = await this.getAllOffers();
        return allOffers.filter((offer) => offer.offerMaker === maker);
    }

    async getTokenBalance(tokenMint: string, owner: string): Promise<bigint> {
        try {
            const mintPubkey = new PublicKey(tokenMint);
            const ownerPubkey = new PublicKey(owner);
            const tokenProgram = await this.getTokenProgramForMint(mintPubkey);

            const tokenAccount = getAssociatedTokenAddressSync(
                mintPubkey,
                ownerPubkey,
                false,
                tokenProgram
            );

            const account = await getAccount(
                this.connection,
                tokenAccount,
                undefined,
                tokenProgram
            );

            return account.amount;
        } catch {
            return BigInt(0);
        }
    }

    async getMintDecimals(tokenMint: string): Promise<number> {
        try {
            const mintPubkey = new PublicKey(tokenMint);
            const tokenProgram = await this.getTokenProgramForMint(mintPubkey);
            const mintInfo = await getMint(
                this.connection,
                mintPubkey,
                undefined,
                tokenProgram
            );
            return mintInfo.decimals;
        } catch {
            return 9;
        }
    }
}
