import {
  Connection,
  PublicKey,
  Keypair,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
  AccountLayout,
  createInitializeAccountInstruction,
  TOKEN_PROGRAM_ID,
  getMinimumBalanceForRentExemptAccount
} from "@solana/spl-token";

import { URI, encodeGiftData } from "./giftURI";

export class CreateGiftError extends Error {
  name = "CreateGiftError";
}
/* The `export interface CreateGiftFiels` is defining an interface for the fields required to create a
gift. It has two properties: `amount` which is a required number representing the amount of the
gift, and `splToken` which is an optional `PublicKey` representing the SPL token to use for the
gift. The `?` after `splToken` indicates that it is optional. This interface is used as a parameter
in the `createGift` function to ensure that the required fields are provided. */
export interface CreateGiftFiels {
  amount: number | bigint;
  splToken?: PublicKey;
}

/**
 * This TypeScript function creates a gift by generating a keypair, creating a transfer transaction,
 * and encoding gift data into a URI.
 * @param {Connection} connection - The connection parameter is an object that represents a connection
 * to a Solana node. It is used to send transactions and query account information on the Solana
 * blockchain.
 * @param {PublicKey} creator - The public key of the account that is creating the gift.
 * @param {CreateGiftFiels}  - - `CreateGiftFiels`: an Object holds the gift data.
 * @returns an object with two properties: "Transaction" and "uri". The "Transaction" property is a
 * Promise that resolves to a transaction object, while the "uri" property is a URI string that encodes
 * gift data.
 */
export async function createGift(
  connection: Connection,
  creator: PublicKey,
  { amount, splToken }: CreateGiftFiels
): Promise<{ Transaction: Transaction; uri: URI }> {
  const creatorInfo = await connection.getAccountInfo(creator);
  if (!creatorInfo) throw new CreateGiftError("creator not found");
  if (amount == 0) throw new CreateGiftError("amount can't be zero");

  const gift_keypair = Keypair.generate();
  const transaction = splToken
    ? await createSPlTokenTransferTx(
      connection,
        creator,
        { amount, splToken },
        gift_keypair
      )
    : await createSystemTransferTx(creator, { amount }, gift_keypair);
  const uri = encodeGiftData({
    giftKeypair: gift_keypair,
    amount: amount,
    creator: creator,
    splToken: splToken ?? undefined,
  });
  return {
    Transaction: transaction,
    uri,
  };
}

/**
 * This TypeScript function creates a System transfer transaction for a specified amount from a creator
 * to a giftKeypair.
 * @param {PublicKey} creator - The public key of the account that is initiating the transaction and
 * transferring funds.
 * @param {CreateGiftFiels}  - - `CreateGiftFiels`: an Object holds the gift data.
 * @param {Keypair} giftKeypair - `giftKeypair` is a Keypair object that contains a public key and a
 * private key. It is used to hold the gift
 * method.
 * @returns a Promise that resolves to a Transaction object.
 */
async function createSystemTransferTx(
  creator: PublicKey,
  { amount }: CreateGiftFiels,
  giftKeypair: Keypair
): Promise<Transaction> {
  const transaction = new Transaction();

  transaction.add(
    SystemProgram.transfer({
      fromPubkey: creator,
      toPubkey: giftKeypair.publicKey,
      lamports: amount,
    })
  );

  return transaction;
}
/**
 * This TypeScript function creates a transaction for transferring a specified amount of a given SPL
 * token from one associated token account to another.
 * @param {Connection} connection - The connection parameter is an object that represents a connection
 * @param {PublicKey} creator - The public key of the creator of the gift.
 * @param {CreateGiftFiels}   - - `CreateGiftFiels`: an Object holds the gift data.
 * @param {Keypair} giftKeypair - giftKeypair is a Keypair object representing the keypair of the
 * account that will be used to hold the spl-token.
 * @returns a Promise that resolves to a Transaction object.
 */
async function createSPlTokenTransferTx(
  connection: Connection,
  creator: PublicKey,
  { amount, splToken }: CreateGiftFiels,
  giftKeypair: Keypair
): Promise<Transaction> {
  const transaction = new Transaction();

  const creatorSPLTokenATA = await getAssociatedTokenAddress(
    splToken!,
    creator
  );

  let rent = await getMinimumBalanceForRentExemptAccount(connection)

  transaction.add(
      
    SystemProgram.createAccount({
      fromPubkey: creator,
      newAccountPubkey: giftKeypair.publicKey,
      lamports:rent,
      space:AccountLayout.span,
      programId:  TOKEN_PROGRAM_ID,
    }),
    createInitializeAccountInstruction(
      giftKeypair.publicKey,
      splToken!,
      giftKeypair.publicKey,
    )
  );
  transaction.add(
    createTransferInstruction(
      creatorSPLTokenATA,
      giftKeypair.publicKey,
      creator,
      amount,
      undefined,
    )
  );

  transaction.feePayer = creator;
  transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash
  transaction.partialSign(giftKeypair)

  return transaction;
}
