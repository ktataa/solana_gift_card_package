import { useState } from "react";
import Connect from "../../components/connect/connect";
import { useConnection } from "@solana/wallet-adapter-react";

import TabsScreen from "./tabs_screen";

function MainScreen() {
  return (
    <div className="flex items-center justify-center h-screen">
      <TabsScreen></TabsScreen>
    </div>
  );
}

export default MainScreen;
