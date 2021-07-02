import type { AppProps /*, AppContext */ } from "next/app";
import useSWR from "swr";
import Web3 from "web3";
import "tailwindcss/tailwind.css";
import Navbar from "../components/Navbar";
import { Web3Provider } from "../context/Web3Context";
import { AssetsProvider } from "../context/AssetsContext";

function App({ Component, pageProps }: AppProps) {
  return (
    <Web3Provider>
      <AssetsProvider>
        <Navbar />
        <Component {...pageProps} />
      </AssetsProvider>
    </Web3Provider>
  );
}

export default App;
