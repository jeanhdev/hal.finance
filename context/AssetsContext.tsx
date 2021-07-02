import { createContext, useEffect, useState } from "react";

let assetsState, setAssetsState;

const AssetsContext = createContext([assetsState, setAssetsState]);

const AssetsProvider = (props) => {
  const [assetsState, setAssetsState] = useState<any>({ authenticated: false, assets: {}, account: [] });

  return <AssetsContext.Provider value={[assetsState, setAssetsState]}>{props.children}</AssetsContext.Provider>;
};

export { AssetsContext, AssetsProvider };
