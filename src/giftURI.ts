import { PublicKey, Keypair } from "@solana/web3.js";
import { SOLANA_GIFT } from "./contants";

export class ParseURLError extends Error {
  name = "ParseeURLError";
}

/* The `GiftData` interface is defining the structure of an object that contains information about a
gift. It has four properties:
- `giftKeypair`: a `Keypair` object representing the keypair of the gift.
- `amount`: a number representing the amount of the gift.
- `creator`: a `PublicKey` object representing the public key of the creator of the gift.
- `splToken`: an optional `PublicKey` object representing the token mint of the gift (if it is a SPL
token gift). */
export interface GiftData {
  giftKeypair: Keypair;
  amount: number;
  creator: PublicKey;
  splToken?: PublicKey;
}
export type URI = URL;

/**
 * This TypeScript function encodes gift data into a URI format.
 * @param {GiftData}  - - `GiftData`: an Object contains the required data to create a gift
 * @returns a URI (Uniform Resource Identifier) that includes the encoded gift data.
 */
export function encodeGiftData({
  giftKeypair,
  amount,
  creator,
  splToken,
}: GiftData): URI {
  const pathname = creator.toBase58();

  const uri = new URL(SOLANA_GIFT + pathname);
  uri.searchParams.append("amount", amount.toString());
  if (splToken) {
    uri.searchParams.append("splToken", splToken.toBase58());
  }
  uri.searchParams.append(
    "giftKeypair",
    Buffer.from(giftKeypair.secretKey.buffer).toString("base64")
  );

  return uri;
}
/**
 * This TypeScript function decodes gift data from a URI and returns a GiftData object.
 * @param {URI} uri - The URI (Uniform Resource Identifier) of the gift, which contains information
 * about the gift such as the protocol, pathname, and search parameters.
 * @returns The function `decodeGiftData` returns a `GiftData` object.
 */
export function decodeGiftData(uri: URI): GiftData {
  if (uri.protocol !== SOLANA_GIFT) throw new ParseURLError("protocol invalid");
  if (!uri.pathname) throw new ParseURLError("pathname missing");
  const amountParam = uri.searchParams.get("amount") || undefined;
  const splTokenParam = uri.searchParams.get("splToken") || undefined;
  const giftKeypairParam = uri.searchParams.get("giftKeypair") || undefined;

  let amount: Number | undefined;
  let splToken: PublicKey | undefined;
  let giftKeypair: Keypair | undefined;
  let creator: PublicKey | undefined;

  if (amountParam) {
    try {
      amount = Number(amountParam);
    } catch (error) {}
  }

  if (splTokenParam) {
    try {
      splToken = new PublicKey(splTokenParam);
    } catch (error) {
      throw new ParseURLError("token mint not valid");
    }
  }
  creator = new PublicKey(uri.pathname);
  try {
    if (giftKeypairParam) {
      giftKeypair = Keypair.fromSecretKey(
        Buffer.from(giftKeypairParam, "base64")
      );
    }
  } catch (error: any) {
    throw new ParseURLError(error);
  }
  return {
    giftKeypair: giftKeypair!,
    amount: Number(amount),
    creator,
    splToken,
  };
}
