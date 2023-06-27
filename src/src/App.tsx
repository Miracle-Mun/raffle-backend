import { useMemo } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  GlowWalletAdapter,
  PhantomWalletAdapter,
  SlopeWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
  LedgerWalletAdapter
} from "@solana/wallet-adapter-wallets";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { createTheme, ThemeProvider } from "@material-ui/core";
import CONFIG from "./../src/config";

import AdminRaffle from "./pages/Admin/Raffle/Raffle";
import AdminAuction from "./pages/Admin/Auction/Auction";
import CreateRaffle from "./pages/Admin/Raffle/CreateRaffle";
import EditRaffle from "./pages/Admin/Raffle/EditRaffle";
import CreateAuction from "./pages/Admin/Auction/CreateAuction";
import EditAuction from "./pages/Admin/Auction/EditAuction";
import IRLCreate from "./pages/Admin/IRL"

import UserRaffle from "./pages/User/Raffle/Raffle";
import UserDetailRaffle from "./pages/User/Raffle/DetailRaffle";
import UserAuction from "./pages/User/Auction/Auction";
import DetailUserAuction from "./pages/User/Auction/DetailAuction";

import "./App.css";
import RaffleProfile from "./pages/User/Profile/RaffleProfile";
import AuctionProfile from "./pages/User/Profile/AuctionProfile";


require("@solana/wallet-adapter-react-ui/styles.css"); // Default styles that can be overridden by your app

const network = CONFIG.SOLANA_NETWORK as WalletAdapterNetwork;
const rpcHost = CONFIG.CLUSTER_API;
const theme = createTheme({
  palette: {
    type: "dark",
  },
  overrides: {
    MuiButtonBase: {
      root: {
        justifyContent: "flex-start",
      },
    },
    MuiButton: {
      root: {
        textTransform: undefined,
        padding: "12px 16px",
      },
      startIcon: {
        marginRight: 8,
      },
      endIcon: {
        marginLeft: 8,
      },
    },
  },
});

const App = () => {
  const endpoint = rpcHost;

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter({ network }),
      new GlowWalletAdapter(),
      new SlopeWalletAdapter(),
      new TorusWalletAdapter(),
      new LedgerWalletAdapter()
    ],
    // eslint-disable-next-line
    [network]
  );


  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <ConnectionProvider endpoint={endpoint}>
          <WalletProvider wallets={wallets} autoConnect>
            <WalletModalProvider>
              {/* <Navbar /> */}
              <Routes>
                <Route path="/admin" element={<AdminRaffle />} />
                <Route path="/admin/irl" element={<IRLCreate />} />
                <Route path="/admin/auction" element={<AdminAuction />} />
                <Route path="/admin/raffle/create" element={<CreateRaffle />} />
                <Route path="/admin/raffle/:id" element={<EditRaffle />} />
                <Route
                  path="/admin/auction/create"
                  element={<CreateAuction />}
                />
                <Route path="/admin/auction/:id" element={<EditAuction />} />

                <Route path="/" element={<UserRaffle />} />
                <Route path="/raffle/:id" element={<UserDetailRaffle />} />
                <Route path="/auction" element={<UserAuction />} />
                <Route path="/auction/:id" element={<DetailUserAuction />} />
                <Route path="/profile/raffle" element={<RaffleProfile />} />
                <Route path="/profile/auction" element={<AuctionProfile />} />
                <Route path='*' element={<Navigate to='/' />} />
              </Routes>
            </WalletModalProvider>
          </WalletProvider>
        </ConnectionProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;
