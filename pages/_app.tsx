import React, { useEffect, useState } from "react";
import useSWR from "swr";
import { Web3ReactProvider } from "@web3-react/core";
import { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import { InjectedConnector } from "@web3-react/injected-connector";
import convert from "ether-converter";

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
  const { data: balance } = useSWR(["getBalance", account, "latest"], {
    fetcher: fetcher(library),
  });
  if (!balance) {
    return null;
  }
  return balance.toString();
};

const zapperFetcher = (url) => fetch(url).then((r) => r.json());

const zapperAPIKey = "96e0cc51-a62e-42ca-acee-910ea7d2a241";

export const Wallet = () => {
  const { chainId, account, activate, active } = useWeb3React<Web3Provider>();
  const [sumOfGasFees, setSumOfGasFees] = useState<number>(0);
  const balance = Balance();
  const { data, error } = useSWR(
    `https://api.zapper.fi/v1/transactions?address=${account}&network=ethereum&api_key=${zapperAPIKey}`,
    zapperFetcher
  );

  const onClick = () => {
    activate(injectedConnector);
  };

  useEffect(() => {
    if (data !== undefined && data.data) {
      const sumOfGasFees = data.data.map((transaction: any) => transaction.gas).reduce((a, b) => a + b, 0);
      // console.log(sumOfGasFees.toLocaleString("fullwide", { useGrouping: false }));
      // console.log(totalOfGasFees);
      setSumOfGasFees(sumOfGasFees * 1832.08);
      // console.log(data);
    }
  }, [data]);

  return (
    <div>
      <div>ChainId: {chainId}</div>
      <div>Account: {account}</div>
      {active ? (
        <div>✅ </div>
      ) : (
        <button type='button' onClick={onClick}>
          Connect
        </button>
      )}
      <div>
        <p>{balance}</p>
      </div>
      <div style={{ maxWidth: "700px" }}>
        <p>{JSON.stringify(data)}</p>
      </div>
      <h1>TOTAL GAS FEES</h1>
      <p>USD {sumOfGasFees}</p>
    </div>
  );
};

const App = () => {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <Wallet />
    </Web3ReactProvider>
  );
};

export default App;
