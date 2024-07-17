// tests/cash_token.ts
import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { PublicKey, Keypair } from "@solana/web3.js";
import { assert } from "chai";
import { SolanaCashToken } from "../target/types/solana_cash_token";

describe("CashToken", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.local();
  anchor.setProvider(provider);

  const program = anchor.workspace.MyAnchorProject as Program<MyAnchorProject>;

  let admin: Keypair;
  let user: Keypair;

  before(async () => {
    // Generate keypairs for the admin and user
    admin = Keypair.generate();
    user = Keypair.generate();

    // Airdrop SOL to admin
    await provider.connection.requestAirdrop(admin.publicKey, 1000000000);

    // Initialize the program (replace with your initialization logic)
    await program.rpc.initialize(
      new anchor.BN(100),
      new anchor.BN(Date.now()),
      {
        accounts: {
          admin: admin.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        },
        signers: [admin],
      }
    );
  });

  it("Mints cash tokens", async () => {
    // Mint cash tokens for user
    await program.rpc.mint(new anchor.BN(1000), {
      accounts: {
        admin: admin.publicKey,
        user: user.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
      signers: [admin],
    });

    // Fetch the user's account and check the balance
    const userAccount = await program.account.userAccount.fetch(user.publicKey);
    assert.equal(userAccount.principal.toNumber(), 1000);
  });

  it("Burns cash tokens", async () => {
    // Burn cash tokens for user
    await program.rpc.burn(new anchor.BN(500), {
      accounts: {
        admin: admin.publicKey,
        user: user.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
      signers: [admin],
    });

    // Fetch the user's account and check the balance
    const userAccount = await program.account.userAccount.fetch(user.publicKey);
    assert.equal(userAccount.principal.toNumber(), 500);
  });

  it("Updates yield and index", async () => {
    // Update yield and index
    await program.rpc.setFutureYield(
      new anchor.BN(200),
      new anchor.BN(2000000),
      new anchor.BN(Date.now() + 1000),
      {
        accounts: {
          admin: admin.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        },
        signers: [admin],
      }
    );

    // Fetch the program state and check the yield and index
    const state = await program.account.state.fetch(admin.publicKey);
    assert.equal(state.nextYield.toNumber(), 200);
    assert.equal(state.nextIndex.toNumber(), 2000000);
  });
});
