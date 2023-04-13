
# Solana Gift example

A protocol to Create and Redeem Solana Based Gift Cards.

- This example not meant to be used in Production.


## Features

- Create A Gift Card (SOL/SPL Token)
- Redeem A Gift Card (No need to have funds for SOL Gift card)

## How it works!

![Alt text](https://github.com/banditesq/solana_gift/blob/main/how_it_works.png "How it works!")

## Install dependencies

Run the following command

```bash
  npm install
```
## Run example

To run the example, run the following command

```bash
  npm start
```


## Usage/Examples

```javascript
import { Connection,Transaction} from "@solana/web3.js";
import { createGift, redeemGift } from "../index";

// Create a Gift
const { Transaction: createGiftTx, uri } = await createGift(
    connection,
    creatorPubkey,
    {
      amount: amount,
      // For SPL Gift card
      splToken: splToken 
   
    }
  );
// Redeem a Gift  
const redeemGiftTx = await redeemGift(connection, {
    uri,
    receiver: receiverAccount.publicKey,
});
```

