import React, { useMemo, useCallback, useState, PureComponent, useRef, useContext } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  XAxis,
  YAxis,
  Line,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Sector,
  Cell,
  LineChart,
} from "recharts";
import findAllAssets from "../utils/allAssets";
import { TrendingUpIcon, TrendingDownIcon, ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/outline";
import numeral from "numeral";
import moment from "moment";
import { useEffect } from "react";
import axios from "axios";
import { SubmitHandler, useForm } from "react-hook-form";
import { Web3Context } from "../context/Web3Context";
import { AssetsContext } from "../context/AssetsContext";

export default function Assets({}) {
  const [assetsState, setAssetsState] = useContext(AssetsContext);
  const [web3State, setWeb3State] = useContext(Web3Context);

  const chainIdRef = useRef();

  const [portfolioData, setPorfolioData] = useState([]);
  const [currentHoldingsData, setCurrentHoldingsData] = useState([]);

  const [appLoading, setAppLoading] = useState(true);

  const fetchInvestorData = (customChaindId?: any) => {
    setAppLoading(true);
    if (customChaindId) {
      const chainData = assetsState.rawData.filter((chain) => chain.chainId === customChaindId)[0];
      setCurrentHoldingsData(chainData.data.current_holdings);
      setPorfolioData(chainData.data.daily_portfolio);
      setAppLoading(false);
    } else {
      axios.get(`/api/v1/assets?address=${web3State.account}`).then((res) => {
        const resData = res.data;
        // const allAssets = findAllAssets(resData);
        const allHoldings = findAllAssets(resData);
        setAssetsState({ rawData: resData, allHoldings: allHoldings });
        const chainData = resData.filter((chain) => chain.chainId === "1")[0];
        const { current_holdings, daily_portfolio } = chainData.data;
        setCurrentHoldingsData(current_holdings);
        setPorfolioData(daily_portfolio);
        setAppLoading(false);
      });
    }
  };

  useEffect(() => {
    if (web3State.authenticated) {
      fetchInvestorData();
    }
  }, [web3State]);

  const handleNetworkChange = () => {
    const chain_id = chainIdRef.current.value;
    fetchInvestorData(chain_id);
  };

  return (
    <div className='container mx-auto my-3'>
      <div className='flex flex-row justify-between items-center mb-8'>
        <h4 className='font-bold text-2xl w-8/12'>Choose your Network</h4>
        <select
          id='chain-id-select'
          // defaultValue={1}
          className='shadow appearance-none w-4/12 border rounded px-5 py-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
          onChange={() => handleNetworkChange()}
          ref={chainIdRef}
        >
          <option value='1'>Ethereum</option>
          <option value='137'>Polygon</option>
          <option value='56'>Binance</option>
          <option value='250'>Phantom</option>
        </select>
      </div>
      {!appLoading && (
        <div className='flex flex-col gap-12'>
          <Portfolio portfolioData={portfolioData} />
          <Holdings currentHoldingsData={currentHoldingsData} />
        </div>
      )}
    </div>
  );
}

const computeChange = (today: any, yesterday: any) => {
  const change = (((today - yesterday) / today) * 100) as any;
  return change;
};

const Portfolio = ({ portfolioData }) => {
  const todayPortfolioValue = {
    close: portfolioData[portfolioData.length - 1].close,
    change: computeChange(portfolioData[portfolioData.length - 1].close, portfolioData[portfolioData.length - 2].close),
  };

  const [portfolioValue, setPortfolioValue] = useState(todayPortfolioValue);

  useEffect(() => {
    setPortfolioValue(todayPortfolioValue);
  }, [portfolioData]);

  return (
    <div className='flex flex-col gap-6  bg-white p-8 rounded-lg shadow-md'>
      <div className='flex flex-row justify-between items-center'>
        <h2 className='text-2xl font-medium leading-6 text-gray-900'>Portfolio</h2>
        <div className='flex flex-row items-center gap-2'>
          {portfolioValue.change > 0 ? (
            <div className='flex flex-row items-center text-green-500'>
              <ArrowUpIcon className='h-6 w-6 ' />
              <h3 className='font-semibold text-xl'>{numeral(portfolioValue.change).format("0.00")} %</h3>
            </div>
          ) : (
            <div className='flex flex-row items-center text-red-500'>
              <ArrowDownIcon className='h-5 w-5' />
              <h3 className='font-semibold text-xl'>{numeral(portfolioValue.change).format("0.00")} %</h3>
            </div>
          )}
          <h3 className='font-semibold text-xl'>{numeral(portfolioValue.close).format("$(0.00 a)")}</h3>
        </div>
      </div>
      <div style={{ height: "30vh", width: "100%" }}>
        <ResponsiveContainer width='100%' height='100%'>
          <LineChart data={portfolioData} onMouseLeave={() => setPortfolioValue(todayPortfolioValue)}>
            <Line type='monotone' dataKey='close' stroke='#10B981' dot={null} />
            <XAxis dataKey='date' tickFormatter={(date) => `${moment(date).format("L")}`} interval='preserveEnd' />
            <YAxis dataKey='close' tickFormatter={(close) => `$${numeral(close).format("(0 a)")}`} />
            <Tooltip
              cursor={false}
              content={
                <CustomTooltip portfolioData={portfolioData} onChange={(value: any) => setPortfolioValue(value)} />
              }
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const CustomTooltip = ({ active, payload, portfolioData, onChange }: any) => {
  useEffect(() => {
    if (active) {
      const today = payload[0].payload;

      const todayPosition = portfolioData.indexOf(today);
      if (todayPosition !== 0) {
        const yesterdayPosition = todayPosition - 1;
        const result = {
          close: today.close,
          change: computeChange(portfolioData[todayPosition].close, portfolioData[yesterdayPosition].close),
        };
        onChange(result);
      }
    }
  }, [payload]);

  return null;
};

const Holdings = ({ currentHoldingsData }) => {
  const tokens = currentHoldingsData.items;
  const totalPortfolioValue = tokens.map((token: any) => token.quote).reduce((a, b) => a + b);

  const getTokenWeight = (tokenQuote: number) => {
    const tokenWeigth = tokenQuote / totalPortfolioValue;
    return tokenWeigth.toString();
  };

  return (
    <>
      <div className='flex flex-col gap-6 bg-white p-8 rounded-lg shadow-md'>
        <h2 className='text-2xl font-medium leading-6 text-gray-900'>Current holdings</h2>
        <div style={{ minHeight: "20vh" }}>
          <div className='grid grid-flow-col grid-cols-1'>
            <div id='holdings-table w-full'>
              <table className='table-auto w-full'>
                <thead>
                  <tr className='text-left'>
                    <th align='left'>Token</th>
                    <th align='left'>Asset Class</th>
                    <th align='left'>Weight</th>
                    <th align='left'>Change (24hrs)</th>
                    <th align='left'>Value</th>
                    <th align='left'>Exposure</th>
                  </tr>
                </thead>
                <tbody>
                  {tokens.map((token: any) => (
                    <tr className='border-gray-700 border'>
                      <td>
                        {token.contract_name} ({token.contract_ticker_symbol})
                      </td>

                      <td align='right'></td>
                      <td align='right'>{numeral(getTokenWeight(token.quote)).format("0.00 %")}</td>

                      <td align='right'></td>
                      <td align='right'>{numeral(token.quote).format("$ (0.00 a)")}</td>

                      <td align='right'></td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className='border-t-2 border-gray-500'>
                  <tr>
                    <td>Portfolio</td>
                    <td></td>
                    <td align='right'>100 %</td>
                    <td align='right'></td>
                    <td align='right'>{numeral(totalPortfolioValue).format("$ (0.00 a)")}</td>

                    <td align='right'></td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <div id='holdings-pie w-full'>{/* <h3>pie chart</h3> */}</div>
          </div>
        </div>
      </div>
    </>
  );
};
