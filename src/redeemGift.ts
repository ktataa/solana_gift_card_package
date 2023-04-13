import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { GiftData, URI, decodeGiftData } from "./giftURI";
import {
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAccount,
  getAssociatedTokenAddress,
} from "@solana/spl-token";

export class RedeemError extends Error {
  name = "RedeemError";
}

/* The `export interface RedeemData` defines the structure of the data that needs to be passed as an
argument to the `redeemGift` function. It specifies that the `uri` parameter should be of type
`URI`, which is a string that represents the gift URI, and the `receiver` parameter should be of
type `PublicKey`, which is the public key of the account that will receive the redeemed gift. This
interface helps to ensure that the correct data is passed to the function and helps with type
checking during development. */
export interface RedeemData {
  uri: URI;
  receiver: PublicKey;
}


/**
 * This TypeScript function redeems a gift by decoding the gift data and then either redeeming an SPL
 * token or redeeming SOL.
 * @param {Connection} connection - 1. The connection parameter is an instance of the Solana web3.js
 * Connection class, which is used to connect to a Solana cluster and send transactions to the network.
 * @param {RedeemData}  - 2. `RedeemData`: An object holds redeemable gift card data.
 * network.
 * @returns The function `redeemGift` returns a Promise that resolves to a `Transaction` object.
 */
export async function redeemGift(
  connection: Connection,
  { uri, receiver }: RedeemData
): Promise<Transaction> {
  const decoded_uri = decodeGiftData(uri);
  const redeem_tx = decoded_uri.splToken
    ? await redeemSPL(connection, receiver, decoded_uri)
    : await redeemSOL(connection, receiver, decoded_uri);
  return redeem_tx;
}

/**
 * This TypeScript function creates a transaction to transfer SOL from a giftKeypair to a receiver,
 * with a specified amount and subtracting a fee.
 * @param {Connection} connection - The connection parameter is an instance of the Solana web3.js
 * Connection class, which is used to connect to a Solana cluster and send transactions to the network.
 * @param {PublicKey} receiver - The public key of the account that will receive the SOL tokens being
 * redeemed.
 * @param {GiftData}  - - `RedeemData`: An object holds redeemable gift card data.
 * @returns a Promise that resolves to a Transaction object.
 */
async function redeemSOL(
  connection: Connection,
  receiver: PublicKey,
  { amount, giftKeypair }: GiftData
): Promise<Transaction> {
  const transaction = new Transaction();

  transaction.add(
    SystemProgram.transfer({
      fromPubkey: giftKeypair.publicKey,
      toPubkey: receiver,
      lamports: amount - 5000,
    })
  );

  transaction.recentBlockhash = (
    await connection.getLatestBlockhash()
  ).blockhash;

  transaction.sign(giftKeypair);

  return transaction;
}

/**
 * This TypeScript function redeems a specified amount of SPL tokens by transferring them from a gift
 * account to a receiver account.
 * @param {Connection} connection - A connection object that represents a connection to a Solana node.
 * @param {PublicKey} receiver - The public key of the account that will receive the redeemed SPL
 * tokens.
 * @param {GiftData}  - - `GiftData`: An object holds redeemable gift card data.
 * @returns a Promise that resolves to a Transaction object.
 */
async function redeemSPL(
  connection: Connection,
  receiver: PublicKey,
  { amount, giftKeypair, splToken }: GiftData
): Promise<Transaction> {
  const transaction = new Transaction();
  const giftSPLTokenATA = await getAssociatedTokenAddress(
    splToken!,
    giftKeypair.publicKey
  );
  const receiverSPLTokenATA = await getAssociatedTokenAddress(
    splToken!,
    receiver
  );
  try {
    const recipientAccount = await getAccount(connection, receiverSPLTokenATA);
    if (recipientAccount.isFrozen) throw new RedeemError("recipient frozen");
  } catch (error) {
    transaction.add(
      createAssociatedTokenAccountInstruction(
        receiver,
        receiverSPLTokenATA,
        receiver,
        splToken!
      )
    );
  }
  transaction.add(
    createTransferInstruction(
      giftSPLTokenATA,
      receiverSPLTokenATA,
      giftKeypair.publicKey,
      amount,
      undefined,
      TOKEN_PROGRAM_ID
    )
  );

  transaction.feePayer = receiver;

  transaction.recentBlockhash = (
    await connection.getLatestBlockhash()
  ).blockhash;

  transaction.partialSign(giftKeypair);

  return transaction;
}
