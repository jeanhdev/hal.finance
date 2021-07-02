import React, { useContext, useEffect, useState } from "react";
import Link from "next/link";
import Web3 from "web3";
import { useRouter } from "next/router";

import { Web3Context } from "../context/Web3Context";

interface NavbarProps {}

const Navbar: React.FC<NavbarProps> = ({}) => {
  const router = useRouter();
  const [web3State, setWeb3State] = useContext(Web3Context);
  const [loading, setLoading] = useState(true);
  // const { authenticated, account, web3 } = ;

  useEffect(() => {
    if (!web3State.authenticated) {
      loadMetaMaskData();
    }
  }, []);

  const loadMetaMaskData = async () => {
    const web3StateObj: any = {};
    if (typeof (window as any).ethereum) {
      const ethWindow = (window as any).ethereum;
      await ethWindow.send("eth_requestAccounts");
      const web3 = new Web3(ethWindow);
      web3StateObj.web3 = web3;
      const chain_id = await web3.eth.net.getId();
      web3StateObj.chain_id = chain_id;
      const accounts = await web3.eth.getAccounts();
      // If the investor has an account on his MetaMask, then proceeds
      if (typeof accounts[0] !== "undefined") {
        web3StateObj.authenticated = true;
        web3StateObj.account = accounts[0];
        router.push("/assets");
        const balance = await web3.eth.getBalance(accounts[0]);
        // console.log(web3.utils.fromWei(balance));
      } else {
        web3StateObj.authenticated = false;
      }
    } else {
      window.alert("Get MetaMask !");
    }
    setWeb3State(web3StateObj);
    return setLoading(false);
  };

  return (
    <div className='container mx-auto px-6'>
      <div className='flex items-center justify-between h-16'>
        <div className='flex items-center gap-12'>
          <Link href='/'>
            <a className='text-lg font-semibold text-gray-900'>📈 Hal.finance</a>
          </Link>
          <Link href='/assets'>
            <a className='underline'>Assets</a>
          </Link>
          <Link href='/liquidity'>
            <a className='underline'>Liquidity</a>
          </Link>
        </div>
        {!loading && (
          <>
            {!web3State.authenticated ? (
              <a
                onClick={() => web3State.web3.eth.requestAccounts()}
                href='#'
                className='block px-4 py-2 rounded-lg transform transition bg-green-500 hover:bg-green-500 hover:-translate-y-0.5 focus:ring-green-600 focus:ring-opacity-50 focus:outline-none focus:ring focus:ring-offset-2 active:bg-indigo-600  font-base text-sm text-white shadow-lg sm:text-base'
              >
                Connect 🦊
              </a>
            ) : (
              <h4>Hi {web3State.account.slice(0, 10)}...</h4>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Navbar;
