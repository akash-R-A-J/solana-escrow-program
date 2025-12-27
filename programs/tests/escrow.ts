import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Escrow } from "../target/types/escrow";
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
} from "@solana/web3.js";
import {
  TOKEN_2022_PROGRAM_ID,
  createMint,
  createAccount,
  mintTo,
  getAccount,
  getAssociatedTokenAddressSync,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { assert } from "chai";

describe("escrow", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.escrow as Program<Escrow>;
  const connection = provider.connection;

  const maker = Keypair.generate();
  const taker = Keypair.generate();
  const mintAuthority = Keypair.generate();

  let mintA: PublicKey;
  let mintB: PublicKey;
  let makerTokenAccountA: PublicKey;
  let takerTokenAccountB: PublicKey;

  const tokenProgram = TOKEN_2022_PROGRAM_ID;

  const getOfferPda = (id: anchor.BN) => {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("offer"), id.toArrayLike(Buffer, "le", 8)],
      program.programId
    )[0];
  };

  const getVaultPda = (offer: PublicKey, mint: PublicKey) => {
    return getAssociatedTokenAddressSync(mint, offer, true, tokenProgram);
  };

  before(async () => {
    await connection.requestAirdrop(maker.publicKey, 10 * LAMPORTS_PER_SOL);
    await connection.requestAirdrop(taker.publicKey, 10 * LAMPORTS_PER_SOL);
    await connection.requestAirdrop(
      mintAuthority.publicKey,
      10 * LAMPORTS_PER_SOL
    );

    await new Promise((resolve) => setTimeout(resolve, 1000));

    mintA = await createMint(
      connection,
      mintAuthority,
      mintAuthority.publicKey,
      null,
      6,
      undefined,
      undefined,
      tokenProgram
    );

    mintB = await createMint(
      connection,
      mintAuthority,
      mintAuthority.publicKey,
      null,
      6,
      undefined,
      undefined,
      tokenProgram
    );

    makerTokenAccountA = await createAccount(
      connection,
      maker,
      mintA,
      maker.publicKey,
      undefined,
      undefined,
      tokenProgram
    );

    takerTokenAccountB = await createAccount(
      connection,
      taker,
      mintB,
      taker.publicKey,
      undefined,
      undefined,
      tokenProgram
    );

    await mintTo(
      connection,
      mintAuthority,
      mintA,
      makerTokenAccountA,
      mintAuthority,
      1_000_000_000,
      undefined,
      undefined,
      tokenProgram
    );

    await mintTo(
      connection,
      mintAuthority,
      mintB,
      takerTokenAccountB,
      mintAuthority,
      1_000_000_000,
      undefined,
      undefined,
      tokenProgram
    );
  });

  describe("make_offer", () => {
    it("creates an offer successfully", async () => {
      const id = new anchor.BN(1);
      const tokenAOfferedAmount = new anchor.BN(100_000_000);
      const tokenBDemandedAmount = new anchor.BN(50_000_000);

      const offer = getOfferPda(id);
      const vault = getVaultPda(offer, mintA);

      const makerBalanceBefore = (
        await getAccount(
          connection,
          makerTokenAccountA,
          undefined,
          tokenProgram
        )
      ).amount;

      await program.methods
        .makeOffer(id, tokenAOfferedAmount, tokenBDemandedAmount)
        .accounts({
          tokenMintA: mintA,
          tokenMintB: mintB,
          offerMaker: maker.publicKey,
          offerMakerTokenAccountA: makerTokenAccountA,
          offer: offer,
          vault: vault,
          tokenProgram: tokenProgram,
        })
        .signers([maker])
        .rpc();

      const offerAccount = await program.account.offer.fetch(offer);
      assert.equal(offerAccount.id.toNumber(), 1);
      assert.equal(
        offerAccount.offerMaker.toString(),
        maker.publicKey.toString()
      );
      assert.equal(offerAccount.tokenMintA.toString(), mintA.toString());
      assert.equal(offerAccount.tokenMintB.toString(), mintB.toString());
      assert.equal(offerAccount.tokenBDemandedAmount.toNumber(), 50_000_000);

      const vaultAccount = await getAccount(
        connection,
        vault,
        undefined,
        tokenProgram
      );
      assert.equal(Number(vaultAccount.amount), 100_000_000);

      const makerBalanceAfter = (
        await getAccount(
          connection,
          makerTokenAccountA,
          undefined,
          tokenProgram
        )
      ).amount;
      assert.equal(
        Number(makerBalanceBefore) - Number(makerBalanceAfter),
        100_000_000
      );
    });

    it("fails with zero token amount", async () => {
      const id = new anchor.BN(2);
      const offer = getOfferPda(id);
      const vault = getVaultPda(offer, mintA);

      try {
        await program.methods
          .makeOffer(id, new anchor.BN(0), new anchor.BN(50_000_000))
          .accounts({
            tokenMintA: mintA,
            tokenMintB: mintB,
            offerMaker: maker.publicKey,
            offerMakerTokenAccountA: makerTokenAccountA,
            offer: offer,
            vault: vault,
            tokenProgram: tokenProgram,
          })
          .signers([maker])
          .rpc();
        assert.fail("should have thrown an error");
      } catch (err) {
        assert.include(err.toString(), "InvalidAmount");
      }
    });

    it("fails when token mints are the same", async () => {
      const id = new anchor.BN(3);
      const offer = getOfferPda(id);
      const vault = getVaultPda(offer, mintA);

      try {
        await program.methods
          .makeOffer(id, new anchor.BN(100_000_000), new anchor.BN(50_000_000))
          .accounts({
            tokenMintA: mintA,
            tokenMintB: mintA,
            offerMaker: maker.publicKey,
            offerMakerTokenAccountA: makerTokenAccountA,
            offer: offer,
            vault: vault,
            tokenProgram: tokenProgram,
          })
          .signers([maker])
          .rpc();
        assert.fail("should have thrown an error");
      } catch (err) {
        assert.include(err.toString(), "InvalidTokenMint");
      }
    });
  });

  describe("take_offer", () => {
    it("takes an offer successfully", async () => {
      const id = new anchor.BN(10);
      const tokenAOfferedAmount = new anchor.BN(100_000_000);
      const tokenBDemandedAmount = new anchor.BN(50_000_000);

      const offer = getOfferPda(id);
      const vault = getVaultPda(offer, mintA);

      await program.methods
        .makeOffer(id, tokenAOfferedAmount, tokenBDemandedAmount)
        .accounts({
          tokenMintA: mintA,
          tokenMintB: mintB,
          offerMaker: maker.publicKey,
          offerMakerTokenAccountA: makerTokenAccountA,
          offer: offer,
          vault: vault,
          tokenProgram: tokenProgram,
        })
        .signers([maker])
        .rpc();

      const takerTokenAccountA = getAssociatedTokenAddressSync(
        mintA,
        taker.publicKey,
        false,
        tokenProgram
      );
      const makerTokenAccountB = getAssociatedTokenAddressSync(
        mintB,
        maker.publicKey,
        false,
        tokenProgram
      );

      const takerBalanceBBefore = (
        await getAccount(
          connection,
          takerTokenAccountB,
          undefined,
          tokenProgram
        )
      ).amount;

      await program.methods
        .takeOffer()
        .accounts({
          offerTaker: taker.publicKey,
          offerMaker: maker.publicKey,
          tokenMintA: mintA,
          tokenMintB: mintB,
          vault: vault,
          offerTakerTokenAccountA: takerTokenAccountA,
          offerTakerTokenAccountB: takerTokenAccountB,
          offerMakerTokenAccountB: makerTokenAccountB,
          offer: offer,
          tokenProgram: tokenProgram,
        })
        .signers([taker])
        .rpc();

      const takerABalance = (
        await getAccount(
          connection,
          takerTokenAccountA,
          undefined,
          tokenProgram
        )
      ).amount;
      assert.equal(Number(takerABalance), 100_000_000);

      const makerBBalance = (
        await getAccount(
          connection,
          makerTokenAccountB,
          undefined,
          tokenProgram
        )
      ).amount;
      assert.equal(Number(makerBBalance), 50_000_000);

      const takerBalanceBAfter = (
        await getAccount(
          connection,
          takerTokenAccountB,
          undefined,
          tokenProgram
        )
      ).amount;
      assert.equal(
        Number(takerBalanceBBefore) - Number(takerBalanceBAfter),
        50_000_000
      );

      try {
        await program.account.offer.fetch(offer);
        assert.fail("offer account should be closed");
      } catch (err) {
        assert.include(err.toString(), "Account does not exist");
      }
    });

    it("fails when offer is already taken", async () => {
      const id = new anchor.BN(10);
      const offer = getOfferPda(id);
      const vault = getVaultPda(offer, mintA);

      const takerTokenAccountA = getAssociatedTokenAddressSync(
        mintA,
        taker.publicKey,
        false,
        tokenProgram
      );
      const makerTokenAccountB = getAssociatedTokenAddressSync(
        mintB,
        maker.publicKey,
        false,
        tokenProgram
      );

      try {
        await program.methods
          .takeOffer()
          .accounts({
            offerTaker: taker.publicKey,
            offerMaker: maker.publicKey,
            tokenMintA: mintA,
            tokenMintB: mintB,
            vault: vault,
            offerTakerTokenAccountA: takerTokenAccountA,
            offerTakerTokenAccountB: takerTokenAccountB,
            offerMakerTokenAccountB: makerTokenAccountB,
            offer: offer,
            tokenProgram: tokenProgram,
          })
          .signers([taker])
          .rpc();
        assert.fail("should have thrown an error");
      } catch (err) {
        assert.ok(err);
      }
    });
  });

  describe("revoke_offer", () => {
    it("revokes an offer successfully", async () => {
      const id = new anchor.BN(20);
      const tokenAOfferedAmount = new anchor.BN(100_000_000);
      const tokenBDemandedAmount = new anchor.BN(50_000_000);

      const offer = getOfferPda(id);
      const vault = getVaultPda(offer, mintA);

      const makerBalanceBefore = (
        await getAccount(
          connection,
          makerTokenAccountA,
          undefined,
          tokenProgram
        )
      ).amount;

      await program.methods
        .makeOffer(id, tokenAOfferedAmount, tokenBDemandedAmount)
        .accounts({
          tokenMintA: mintA,
          tokenMintB: mintB,
          offerMaker: maker.publicKey,
          offerMakerTokenAccountA: makerTokenAccountA,
          offer: offer,
          vault: vault,
          tokenProgram: tokenProgram,
        })
        .signers([maker])
        .rpc();

      const makerBalanceAfterOffer = (
        await getAccount(
          connection,
          makerTokenAccountA,
          undefined,
          tokenProgram
        )
      ).amount;

      await program.methods
        .revokeOffer()
        .accounts({
          offerMaker: maker.publicKey,
          tokenMintA: mintA,
          offerMakerTokenAccountA: makerTokenAccountA,
          offer: offer,
          vault: vault,
          tokenProgram: tokenProgram,
        })
        .signers([maker])
        .rpc();

      const makerBalanceAfterRevoke = (
        await getAccount(
          connection,
          makerTokenAccountA,
          undefined,
          tokenProgram
        )
      ).amount;
      assert.equal(Number(makerBalanceAfterRevoke), Number(makerBalanceBefore));

      try {
        await program.account.offer.fetch(offer);
        assert.fail("offer account should be closed");
      } catch (err) {
        assert.include(err.toString(), "Account does not exist");
      }
    });

    it("multiple offers can be created with different ids", async () => {
      const id1 = new anchor.BN(100);
      const id2 = new anchor.BN(101);

      const offer1 = getOfferPda(id1);
      const offer2 = getOfferPda(id2);
      const vault1 = getVaultPda(offer1, mintA);
      const vault2 = getVaultPda(offer2, mintA);

      await program.methods
        .makeOffer(id1, new anchor.BN(10_000_000), new anchor.BN(5_000_000))
        .accounts({
          tokenMintA: mintA,
          tokenMintB: mintB,
          offerMaker: maker.publicKey,
          offerMakerTokenAccountA: makerTokenAccountA,
          offer: offer1,
          vault: vault1,
          tokenProgram: tokenProgram,
        })
        .signers([maker])
        .rpc();

      await program.methods
        .makeOffer(id2, new anchor.BN(20_000_000), new anchor.BN(10_000_000))
        .accounts({
          tokenMintA: mintA,
          tokenMintB: mintB,
          offerMaker: maker.publicKey,
          offerMakerTokenAccountA: makerTokenAccountA,
          offer: offer2,
          vault: vault2,
          tokenProgram: tokenProgram,
        })
        .signers([maker])
        .rpc();

      const offerAccount1 = await program.account.offer.fetch(offer1);
      const offerAccount2 = await program.account.offer.fetch(offer2);

      assert.equal(offerAccount1.id.toNumber(), 100);
      assert.equal(offerAccount2.id.toNumber(), 101);
      assert.notEqual(offer1.toString(), offer2.toString());
    });
  });
});
