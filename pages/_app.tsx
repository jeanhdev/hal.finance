import type { AppProps /*, AppContext */ } from "next/app";
import useSWR from "swr";
import { Web3ReactProvider } from "@web3-react/core";
import { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import { InjectedConnector } from "@web3-react/injected-connector";
import "tailwindcss/tailwind.css";

export const injectedConnector = new InjectedConnector({
  supportedChainIds: [
    1, // Mainet
    3, // Ropsten
    4, // Rinkeby
    5, // Goerli
    42, // Kovan
  ],
});

function getLibrary(provider: any): Web3Provider {
  const library = new Web3Provider(provider);
  library.pollingInterval = 12000;
  return library;
}

const fetcher =
  (library) =>
  (...args) => {
    const [method, ...params] = args;
    console.log(method, params);
    return library[method](...params);
  };

export const Balance = () => {
  const { account, library } = useWeb3React<Web3Provider>();
};

function App({ Component, pageProps }: AppProps) {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <Component {...pageProps} />
    </Web3ReactProvider>
  );
}

export default App;
