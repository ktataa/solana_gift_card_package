import {
  WalletModalProvider,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";

require("@solana/wallet-adapter-react-ui/styles.css");

function Connect() {
  return (
    <WalletModalProvider>
      <WalletMultiButton />
    </WalletModalProvider>
  );
}

export default Connect;
