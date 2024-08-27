import { Input, Button, Alert, Typography } from "@material-tailwind/react";
import { useConnection, useAnchorWallet } from "@solana/wallet-adapter-react";
import { useEffect, useRef, useState } from "react";
import { Transaction, PublicKey } from "@solana/web3.js";
import { getMint } from "@solana/spl-token";
import { createGift } from "solana-gifts";

import QRCodeStyling from "qr-code-styling";

const fileExt = "png";
const qrCode = new QRCodeStyling({
  width: 200,
  height: 200,

  dotsOptions: {
    color: "#4267b2",
    type: "rounded",
  },
  imageOptions: {
    crossOrigin: "anonymous",
    margin: 20,
  },
});
function CreateGift() {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  const [show, setShow] = useState(false);
  const [showMessage, setShowMessage] = useState("success");
  const [createDisabled, setCreateDisabled] = useState(false);

  const [tokenMint, setTokenMint] = useState<String>();
  const [amount, setAmount] = useState(0);

  const [generateQR, setGenerateQR] = useState(false);
  const [transaction, setTransaction] = useState<Transaction>();
  const [uri, setURI] = useState<URL>();
  const ref = useRef<any>();
  useEffect(() => {
    qrCode.append(ref.current);
  }, [uri]);

  useEffect(() => {
    qrCode.update({
      data: uri?.toString(),
    });
    qrCode._canvas?.style.setProperty("display", "initial");
  }, [uri]);

  const generate = async () => {
    if (wallet?.publicKey) {
      let token_decimal;

      try {
        token_decimal = (await getMint(connection, new PublicKey(tokenMint!)))
          .decimals;
      } catch (error) {
        console.log("no token set");
      }

      const { Transaction: tx, uri } = await createGift(
        connection,
        wallet.publicKey,
        {
          amount: token_decimal ? amount * 10 ** token_decimal : amount * 1e9,
          splToken: token_decimal ? new PublicKey(tokenMint!) : undefined,
        }
      );
      setURI(uri);
      setTransaction(tx);
      setGenerateQR(true);
    }
  };
  const create = async () => {
    if (wallet?.publicKey && transaction) {
      onDownloadClick()
      setCreateDisabled(true);

      try {
        transaction.feePayer = wallet.publicKey;
        transaction.recentBlockhash = (
          await connection.getLatestBlockhash()
        ).blockhash;

        const tx = await wallet.signTransaction(transaction);

        const tx_signature = await connection.sendRawTransaction(
          tx.serialize()
        );

        await connection.confirmTransaction(tx_signature, "finalized");
        console.log("gift created");
        setShow(true);
      } catch (error) {
      } finally {
        setCreateDisabled(false);
      }
    }
  };
  const onDownloadClick = () => {
    qrCode.download({
      extension: fileExt,
    });
  };
  const requestAirdrop = async () => {
    if (wallet?.publicKey) {
      try {
        const tx_signature = await connection.requestAirdrop(
          wallet?.publicKey,
          1e9
        );
        await connection.confirmTransaction(tx_signature, "finalized");
        setShowMessage("success");
        setShow(true);
      } catch (error) {
        setShowMessage("failed");
        setShow(true);
      }
    }
  };

  return (
    <div>
      {generateQR ? (
        <>
          <div ref={ref} />
          <br />
          <Button onClick={onDownloadClick} variant="filled" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
            Download
          </Button>

          <Button disabled={createDisabled} onClick={create} variant="filled" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
            Create
          </Button>

          <Button onClick={() => setGenerateQR(false)} variant="filled" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
            Cancel
          </Button>
          <br />
          <Button onClick={requestAirdrop} variant="filled"  placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
            Request airdrop
          </Button>
        </>
      ) : (
        <>
          <Input
              style={{ fontSize: 17, color: "#000000" }}
              onChange={(e) => setTokenMint(e.target.value)}
              size="lg"
              label="Token address leave empty for SOL" crossOrigin={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}          />
          <br />
          <Input
              style={{ fontSize: 17, color: "#000000" }}
              inputMode="numeric"
              onChange={(e) => setAmount(Number(e.target.value))}
              size="lg"
              label="amount" crossOrigin={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}          />
          <br />
          <Button onClick={generate} variant="filled" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
            Generate
          </Button>
        </>
      )}
      <br />
      <br />
      <Alert
        show={show}
        color={showMessage == "success" ? "green" : "red"}
        className="max-w-screen-md"
        dismissible={{
          onClose: () => setShow(false),
        }}
      >
        <Typography variant="h5" color="white">
          {showMessage == "success" ? "Success" : "Failed"}
        </Typography>
      </Alert>
    </div>
  );
}
export default CreateGift;