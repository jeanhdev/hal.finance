import { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import { GetServerSideProps } from "next";
import useSWR from "swr";
import { apiFetcher } from "../utils/fetcher";
import { injectedConnector } from "./_app";

export default function Home({}) {
  // active will be dynamically set via web3 address fetching
  const active = true;
  const address = "YOUR_ETH_ACCOUNT_ADDRESS";
  const { data, error } = useSWR(`/api/v1/eth?address=${address}`, apiFetcher);

  return (
    <div>
      {/* <div>ChainId: {chainId}</div>
      <div>Account: {account}</div> */}

      <div className='container mx-auto my-3'>
        <div className='grid place-items-center gap-2'>
          <h1 className='text-center text-4xl font-bold'>Hal - Ethereum</h1>
          {active ? (
            <div>Address: {address}</div>
          ) : (
            <a className='px-4 py-2 bg-blue-400 text-white rounded-lg' href='#' onClick={() => null}>
              Connect your MetaMask 🦊
            </a>
          )}
        </div>
        <div className='flex flex-col gap-12'>
          {data && !error && (
            <>
              <div className='text-2xl font-semibold'>Portfolio over time</div>
              {JSON.stringify(data.daily_portfolio)}
              <div className='text-2xl font-semibold'>Current holdings</div>
              {JSON.stringify(data.current_holdings)}
              <div className='text-2xl font-semibold'>Latest transactions</div>
              {JSON.stringify(data.latest_transactions)}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
