import React, { useMemo, useCallback, useState, PureComponent, useRef } from "react";
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
import { TrendingUpIcon, TrendingDownIcon, ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/outline";
import numeral from "numeral";
import moment from "moment";
import { useEffect } from "react";
import axios from "axios";
import { SubmitHandler, useForm } from "react-hook-form";

export default function Home({}) {
  // active will be dynamically set via web3 address fetching
  type DashboardInputs = {
    address: string;
    chain_id: string;
  };
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<DashboardInputs>();

  const [showMenu, setShowMenu] = useState(false);
  const [address, setAddress] = useState("0xB1c0d16894e6D3B4C6eE0d40f28Bd1338e996AbD");
  const [portfolioData, setPorfolioData] = useState([]);
  const [currentHoldingsData, setCurrentHoldingsData] = useState([]);
  const [appLoading, setAppLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);

  const fetchInvestorData = (customAddress?: any, customChaindId?: any) => {
    setAppLoading(true);
    axios.get(`/api/v1/eth?address=${address}`).then((res) => {
      const resData = res.data;
      setPorfolioData(resData.daily_portfolio);
      setCurrentHoldingsData(resData.current_holdings);
      setAppLoading(false);
    });
  };

  useEffect(() => {
    fetchInvestorData();
  }, []);

  const onSubmit: SubmitHandler<DashboardInputs> = (data) => {
    const { address, chain_id } = data;
    console.log(data);
    setAppLoading(true);
    axios.get(`/api/v1/eth?address=${address}&chain_id=${chain_id}`).then((res) => {
      const resData = res.data;
      setPorfolioData(resData.daily_portfolio);
      setCurrentHoldingsData(resData.current_holdings);
      setAppLoading(false);
    });
  };

  return (
    <div className='container mx-auto my-3'>
      <div className='grid place-items-center gap-2 mb-6'>
        <h1 className='mt-6 text-2xl font-bold text-gray-900 sm:mt-8 sm:text-4xl lg:text-3xl xl:text-4xl mb-3'>
          📈 Hal.finance
        </h1>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className='flex w-full flex-row gap-3 items-center mb-4' style={{ width: "50vw" }}>
            <input
              {...register("address", { required: true })}
              className='shadow appearance-none border rounded w-full px-5 py-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
              id='address'
              type='text'
              placeholder='ETH Address'
            />

            <select
              id='chain-id-select'
              {...register("chain_id", { required: true })}
              className='shadow appearance-none border rounded w-full px-5 py-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
            >
              <option value='1'>Ethereum</option>
              <option value='137'>Polygon</option>
              <option value='56'>Binance</option>
              <option value='250'>Phantom</option>
            </select>
          </div>
          <div className='grid'>
            <button
              type='submit'
              className='block px-5 py-3 rounded-lg transform transition bg-green-500 hover:bg-green-500 hover:-translate-y-0.5 focus:ring-green-600 focus:ring-opacity-50 focus:outline-none focus:ring focus:ring-offset-2 active:bg-indigo-600  font-semibold text-sm text-white shadow-lg sm:text-base'
            >
              {!appLoading ? "Submit" : "..."}
            </button>
          </div>
        </form>
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
            {/* <CartesianGrid /> */}
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
                    <th align='left'>Value</th>
                    <th align='left'>Weight</th>
                  </tr>
                </thead>
                <tbody>
                  {tokens.map((token: any) => (
                    <tr className='border-gray-700 border'>
                      <td>
                        {token.contract_name} ({token.contract_ticker_symbol})
                      </td>
                      <td align='right'>{numeral(token.quote).format("$ (0.00 a)")}</td>
                      <td align='right'>{numeral(getTokenWeight(token.quote)).format("0.00 %")}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className='border-t-2 border-gray-500'>
                  <tr>
                    <td>Portfolio</td>
                    <td align='right'>{numeral(totalPortfolioValue).format("$ (0.00 a)")}</td>
                    <td align='right'>100 %</td>
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
