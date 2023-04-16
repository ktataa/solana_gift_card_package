import { Connection, Keypair, PublicKey, SystemProgram, Transaction, clusterApiUrl } from "@solana/web3.js";

import { createGift, decodeGiftData, redeemGift } from "../src";
import { MINT_SIZE, TOKEN_PROGRAM_ID, createAssociatedTokenAccountInstruction, createInitializeMint2Instruction, createMintToInstruction, getAssociatedTokenAddress, getMinimumBalanceForRentExemptMint } from "@solana/spl-token";

(async()=>{


  let creatorAccount = Keypair.generate();
  let receiverAccount = Keypair.generate();

  console.log("creator account :", creatorAccount.publicKey.toBase58());
  console.log("receiver account :", receiverAccount.publicKey.toBase58());

  

  const connection = new Connection(clusterApiUrl("devnet"), "finalized");

  // Request airdrop

  console.log("Requesting airdrop...");
  
  await connection.confirmTransaction(
    await connection.requestAirdrop(creatorAccount.publicKey, 1e9)
  );
  await connection.confirmTransaction(
    await connection.requestAirdrop(creatorAccount.publicKey, 1e9)
  );

  // Check balance

  console.log(
    "creator balance: ",
    await connection.getBalance(creatorAccount.publicKey)
  );

  // Create SOL gift
  console.log("Creating SOL gift....");
  

  const { Transaction: createGiftTx, uri } = await createGift(
    connection,
    creatorAccount.publicKey,
    {
      amount: 1.5 * 1e9,
    }
  );
  console.log("Gift created with", 1500000000);

  createGiftTx.feePayer = creatorAccount.publicKey;
  createGiftTx.recentBlockhash = (
    await connection.getRecentBlockhash()
  ).blockhash;
  createGiftTx.sign(creatorAccount);

  let createTx = await connection.sendRawTransaction(createGiftTx.serialize());
  await connection.confirmTransaction(createTx, "finalized");
  // Redeem SOL gift
  console.log("Redeeming SOL gift....");
  

  const redeemGiftTx = await redeemGift(connection, {
    uri,
    receiver: receiverAccount.publicKey,
  });

  let redeemTx = await connection.sendRawTransaction(redeemGiftTx.serialize());
  await connection.confirmTransaction(redeemTx, "finalized");

  console.log(await connection.getBalance(receiverAccount.publicKey));
  console.log("Gift redeemed");
  

  // Create and mint TEST SPL token
  console.log("Creating and minting token...");
  
  const splToken = Keypair.generate();

  console.log("token mint :",splToken.publicKey.toBase58() );
  

  let tokenTx = new Transaction();


  const tokenIx = createInitializeMint2Instruction(
    splToken.publicKey,
    9,
    creatorAccount.publicKey,
    null,
    TOKEN_PROGRAM_ID
  );
  const tokenATA = await getAssociatedTokenAddress(splToken.publicKey, creatorAccount.publicKey);

  const createTokenATAIx = createAssociatedTokenAccountInstruction(
    creatorAccount.publicKey,
    tokenATA,
    creatorAccount.publicKey,
    splToken.publicKey
  );
  const lamports = await getMinimumBalanceForRentExemptMint(connection);
  const mintToATAIx = createMintToInstruction(
    splToken.publicKey,
    tokenATA,
    creatorAccount.publicKey,
    BigInt(100000000000)
  );
  tokenTx.add(
    SystemProgram.createAccount({
      fromPubkey: creatorAccount.publicKey,
      newAccountPubkey: splToken.publicKey,
      space: MINT_SIZE,
      lamports,
      programId: TOKEN_PROGRAM_ID,
    }),
    tokenIx,
    createTokenATAIx,
    mintToATAIx,
  );

  tokenTx.feePayer = creatorAccount.publicKey;
  tokenTx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash
  tokenTx.sign(creatorAccount,splToken)

  const mintTx = await connection.sendRawTransaction(tokenTx.serialize())

  await connection.confirmTransaction(mintTx,"finalized")

  console.log("Done creating and minting token");

  // Create SPL gift

  console.log("Creating SPL gift...");


  const {Transaction:splGiftTx,uri: splGiftURI} = await createGift(connection,creatorAccount.publicKey,{
    amount: 1000000000,
    splToken: new PublicKey(splToken.publicKey)
  })

  const splGiftAddress = decodeGiftData(splGiftURI).giftKeypair.publicKey.toBase58()
  console.log("splGiftAddress :", splGiftAddress);


  splGiftTx.partialSign(creatorAccount)
  const splGift = await connection.sendRawTransaction(splGiftTx.serialize())

  await connection.confirmTransaction(splGift,"finalized")
  console.log("Done creating SPL gift");

  // Redeem SPL gift

  console.log("Redeeming SPL gift...");



  const redeemSPLGiftTx = await redeemGift(connection, {
    uri:splGiftURI,
    receiver: receiverAccount.publicKey,
  });

  const decodedGiftData = decodeGiftData(splGiftURI)
  console.log("splGiftAddress :", decodedGiftData.giftKeypair.publicKey.toBase58());  


  redeemSPLGiftTx.partialSign(receiverAccount)

  let redeemSPLGift = await connection.sendRawTransaction(redeemSPLGiftTx.serialize());
  await connection.confirmTransaction(redeemSPLGift, "finalized");
  
  console.log("SPL gift redeemed");
  
   






}) ();
