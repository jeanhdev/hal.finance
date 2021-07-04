import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import useSWR from "swr";
import { AssetsContext } from "../context/AssetsContext";

const fetcher = (url) => fetch(url).then((r) => r.json());

export default function News({}) {
  const [assetsState, setAssetsState] = useContext(AssetsContext);
  const { allHoldings } = assetsState;
  const [newsData, setNewsData] = useState([]);

  if (!assetsState.allHoldings.length) {
    return null;
  }

  const fetchNews = () => {
    const nonEmptyTokens = allHoldings.filter((holding) => holding.balance !== "0");
    axios.post(`/api/v1/news`, { allHoldings: nonEmptyTokens }).then((res) => {
      setNewsData(res.data);
    });
  };

  useEffect(() => {
    fetchNews();
  }, []);

  return (
    <div className='container mx-auto my-3'>
      <div className='flex flex-row justify-between items-center mb-8'>
        <div className='flex flex-col gap-6 bg-white p-8 rounded-lg shadow-md'>
          <h2 className='text-2xl font-medium leading-6 text-gray-900'>News</h2>
          <div style={{ minHeight: "20vh" }}>
            <div className='grid grid-flow-col grid-cols-1'>
              <div id='holdings-table w-full'>
                <table className='table-auto w-full'>
                  <thead>
                    <tr className='text-left'>
                      <th align='left'>Token</th>
                      <th align='left'>Title</th>
                      <th align='left'>Sentiment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {newsData.map((news) => (
                      <tr className='border-gray-700 border'>
                        <td>{news.token}</td>
                        <td align='left'>{news.title}</td>
                        <td align='left'>{news.binaryResult}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className='border-t-2 border-gray-500'>
                    {/* <tr>
                    <td>Portfolio</td>
                    <td></td>
                    <td align='right'>100 %</td>
                    <td align='right'></td>
                    <td align='right'>{numeral(totalPortfolioValue).format("$ (0.00 a)")}</td>

                    <td align='right'></td>
                  </tr> */}
                  </tfoot>
                </table>
              </div>
              <div id='holdings-pie w-full'>{/* <h3>pie chart</h3> */}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
