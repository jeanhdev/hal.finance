import { createContext, useState } from "react";

let assetsState, setAssetsState;

const AssetsContext = createContext([assetsState, setAssetsState]);

const AssetsProvider = (props) => {
  const [assetsState, setAssetsState] = useState<any>([{ chainId: 1, name: "Ethereum", data: {} }]);

  return <AssetsContext.Provider value={[assetsState, setAssetsState]}>{props.children}</AssetsContext.Provider>;
};

export { AssetsContext, AssetsProvider };
