import {
  Input,
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Typography,
  Alert,
} from "@material-tailwind/react";
import { useState } from "react";
import QrScanner from "qr-scanner";
import { decodeGiftData, GiftData, redeemGift } from "solana-gifts";
import {
  useConnection,
  useAnchorWallet,
  useWallet,
} from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { getMint } from "@solana/spl-token";

function RedeemGift() {
  const { connection } = useConnection();
  const [imageSrc, setImageSrc] = useState<any>();
  const wallet = useAnchorWallet();
  const [uri, setURI] = useState<string>();
  const [giftData, setGiftData] = useState<GiftData>();
  const [show, setShow] = useState(false);
  const [redeemDisabled, setRedeemDisabled] = useState(false);
  const [showMessage, setShowMessage] = useState("success");

  const [tokenDecimal, setTokenDecimal] = useState(0);

  const onFileUpload = async (e: any) => {
    let file = e.target.files[0];
    const uri = await QrScanner.scanImage(file, {
      returnDetailedScanResult: true,
    });
    const decodedGiftData = decodeGiftData(new URL(uri.data));
    setImageSrc(file);
    setURI(uri.data);
    setGiftData(decodedGiftData);
    console.log(decodedGiftData.splToken);

    try {
      let token_decimal = (
        await getMint(connection, new PublicKey(decodedGiftData?.splToken!))
      ).decimals;
      console.log(token_decimal);

      setTokenDecimal(token_decimal);
    } catch (error) {
      console.log(error);

      console.log("no token found");
    }
  };

  const redeem = async () => {
    if (wallet?.publicKey && uri) {
      setRedeemDisabled(true);
      try {
        let transaction = await redeemGift(connection, {
          uri: new URL(uri),
          receiver: wallet?.publicKey,
        });
        transaction.recentBlockhash = (
          await connection.getLatestBlockhash()
        ).blockhash;

        if (tokenDecimal) {
          transaction.feePayer = wallet.publicKey;
          transaction = await wallet.signTransaction(transaction);
        }

        const tx_hash = await connection.sendRawTransaction(
          transaction.serialize()
        );
        await connection.confirmTransaction(tx_hash, "finalized");

        setShow(true);
        setShowMessage("success");
      } catch (error) {
        console.log(error);

        setShow(true);
        setShowMessage("failed");
      } finally {
        setRedeemDisabled(false);
      }
    }
  };

  return (
    <div>
      {uri?.length ? (
        <>
          <Card>
            <CardHeader color="blue" className="relative h-56">
              <img
                src="https://www.freepnglogos.com/uploads/gift-png/file-gift-flat-icon-vector-svg-wikimedia-commons-10.png"
                alt="img-blur-shadow"
                className="h-full w-full"
              />
            </CardHeader>
            <CardBody className="text-center">
              <Typography variant="h5" className="mb-2">
                {tokenDecimal
                  ? Number(giftData?.amount!) / 10 ** tokenDecimal
                  : Number(giftData?.amount!) / 1e9}{" "}
                {" " + (tokenDecimal ? giftData?.splToken?.toBase58() : "SOL")}
              </Typography>
            </CardBody>
          </Card>

          <Button disabled={redeemDisabled} onClick={redeem} variant="filled">
            Redeem
          </Button>
          <Button onClick={() => setURI("")} variant="filled">
            Cancel
          </Button>
        </>
      ) : (
        <>
          <Input
            onChange={(e) => onFileUpload(e)}
            type="file"
            size="lg"
            label="QR code file"
          />
          <br />
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
export default RedeemGift;