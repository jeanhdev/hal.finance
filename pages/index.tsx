import React, { useMemo, useCallback, useState, PureComponent } from "react";
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

export default function Home({}) {
  // active will be dynamically set via web3 address fetching
  const active = false;
  const address = "0xB1c0d16894e6D3B4C6eE0d40f28Bd1338e996AbD";
  const [portfolioData, setPorfolioData] = useState([]);
  const [currentHoldingsData, setCurrentHoldingsData] = useState([]);
  const [appLoading, setAppLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);

  const fetchInvestorData = () => {
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

  return (
    <div className='container mx-auto my-3'>
      <div className='grid place-items-center gap-2 mb-6'>
        <h1 className='mt-6 text-2xl font-bold text-gray-900 sm:mt-8 sm:text-4xl lg:text-3xl xl:text-4xl mb-3'>
          Hal.finance - alpha
        </h1>
        <div className='flex flex-row gap-3 items-center'>
          <div>
            <input
              className='shadow appearance-none border rounded w-full px-5 py-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
              id='address'
              type='text'
              placeholder='Address'
            />
          </div>
          <a
            className='inline-block px-5 py-3 rounded-lg transform transition bg-green-500 hover:bg-green-500 hover:-translate-y-0.5 focus:ring-green-600 focus:ring-opacity-50 focus:outline-none focus:ring focus:ring-offset-2 active:bg-indigo-600  font-semibold text-sm text-white shadow-lg sm:text-base'
            href='#'
          >
            Submit
          </a>
        </div>
      </div>
      <div className='flex flex-col gap-12'>
        {!appLoading && (
          <>
            <Portfolio portfolioData={portfolioData} />
            <Holdings currentHoldingsData={currentHoldingsData} />
          </>
        )}
      </div>
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
              <h3 className='font-semibold text-xl'>{numeral(portfolioValue.change).format("(0.00)")} %</h3>
            </div>
          ) : (
            <div className='flex flex-row items-center text-red-500'>
              <ArrowDownIcon className='h-5 w-5' />
              <h3 className='font-semibold text-xl'>{numeral(portfolioValue.change).format("(0.00)")} %</h3>
            </div>
          )}
          <h3 className='font-semibold text-xl'>{numeral(portfolioValue).format("$(0.00 a)")}</h3>
        </div>
      </div>
      <div style={{ height: "30vh", width: "100%" }}>
        <ResponsiveContainer width='100%' height='100%'>
          <LineChart data={portfolioData}>
            <Line type='monotone' dataKey='close' stroke='#10B981' dot={null} />
            <XAxis dataKey='date' tickFormatter={(date) => `${moment(date).format("L")}`} interval='preserveEnd' />
            <YAxis dataKey='close' tickFormatter={(close) => `$${numeral(close).format("(0 a)")}`} />
            <Tooltip
              cursor={false}
              content={<CustomTooltip portfolioValue={portfolioValue} setPortfolioValue={setPortfolioValue} />}
            />
            {/* <CartesianGrid /> */}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const CustomTooltip = ({ active, payload, portfolioValue, setPortfolioValue }: any) => {
  if (active) {
    const today = payload[0].value;
    setPortfolioValue({
      ...portfolioValue,
      close: today.close,
      // change: computeChange()
    });
    return (
      // <div className='p-3 bg-blue-400'>
      //   <h4>{value}</h4>
      // </div>
      null
    );
  }
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
        <div style={{ height: "20vh" }}>
          <div className='grid grid-flow-col grid-cols-2'>
            <div id='holdings-table w-full'>
              <table className='table-auto w-full'>
                <thead>
                  <tr className='text-left'>
                    <th align='center'>Token</th>
                    <th align='center'>Value</th>
                    <th align='center'>Weight</th>
                  </tr>
                </thead>
                <tbody>
                  {tokens.map((token: any) => (
                    <tr>
                      <td>
                        {token.contract_name} ({token.contract_ticker_symbol})
                      </td>
                      <td align='right'>{numeral(token.quote).format("(0.00 a)")}</td>
                      <td align='right'>{numeral(getTokenWeight(token.quote)).format("0.00 %")}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className='border-t-2 border-gray-500'>
                  <tr>
                    <td>Portfolio</td>
                    <td align='right'>{numeral(totalPortfolioValue).format("(0.00 a)")}</td>
                    <td align='right'>100 %</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <div id='holdings-pie w-full'>
              <h3>pie chart</h3>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
