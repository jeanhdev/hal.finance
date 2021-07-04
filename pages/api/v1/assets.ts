import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { address } = req.query;

  const chainIds = [
    { chainId: "1", name: "Ethereum" },
    { chainId: "137", name: "Polygon/Matic" },
    { chainId: "56", name: "Binance Smart Chain" },
    { chainId: "250", name: "Fantom Opera" },
  ];

  var output = new Array();

  for (let i = 0; i < chainIds.length; i++) {
    const daily_portfolio = await axios.get(
      `https://api.covalenthq.com/v1/${chainIds[i].chainId}/address/${address}/portfolio_v2/?key=${
        process.env.COVALENT_API_KEY
      }&quote-currency=${`USD`}`
    );

    const portfolioData = await daily_portfolio.data;

    const portfolioValue = (items: any) => {
      let portfolioDailyValue = new Array(31).fill(0);
      for (let i = 0; i < items.length; i++) {
        const tokenHoldings = items[i].holdings;
        tokenHoldings.forEach((dailyHolding, idx) => {
          portfolioDailyValue[idx] += dailyHolding.close.quote;
        });
      }
      return portfolioDailyValue;
    };

    const portfolioDays = portfolioData.items[0].holdings.map((tokenHolding: any) => tokenHolding.timestamp);
    const portfolioValues = portfolioValue(portfolioData.items);
    const formattedPortfolioData = [];
    for (let i = 0; i < portfolioDays.length; i++) {
      formattedPortfolioData.push({
        date: portfolioDays[i],
        close: portfolioValues[i],
      });
    }

    const current_holdings = await axios.get(
      `https://api.covalenthq.com/v1/${chainIds[i].chainId}/address/${address}/balances_v2/?key=${process.env.COVALENT_API_KEY}`
    );

    const data = {
      daily_portfolio: formattedPortfolioData.reverse(),
      current_holdings: current_holdings.data.data,
    };

    const toPush = { ...chainIds[i], data };

    output.push(toPush);
  }

  console.log(output);

  res.status(200).json(output);
};
