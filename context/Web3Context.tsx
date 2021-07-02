import { createContext, useEffect, useState } from "react";
import Web3 from "web3";

let web3State, setWeb3State;

const Web3Context = createContext([web3State, setWeb3State]);

const Web3Provider = (props) => {
  const [web3State, setWeb3State] = useState<any>({ authenticated: false, web3: {}, account: [] });

  return <Web3Context.Provider value={[web3State, setWeb3State]}>{props.children}</Web3Context.Provider>;
};

export { Web3Context, Web3Provider };
