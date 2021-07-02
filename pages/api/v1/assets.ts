import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { address } = req.query;
  let chain_id;
  if (req.query.chain_id) {
    chain_id = req.query.chain_id;
  } else {
    chain_id = 1;
  }
  // We'll need to do error handling on each requests, and make multiple axios promises at once instead of 3 calls
  const daily_portfolio = await axios.get(
    `https://api.covalenthq.com/v1/${chain_id}/address/${address}/portfolio_v2/?key=${
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
    `https://api.covalenthq.com/v1/${chain_id}/address/${address}/balances_v2/?key=${process.env.COVALENT_API_KEY}`
  );

  const latest_transactions = await axios.get(
    `https://api.covalenthq.com/v1/${chain_id}/address/${address}/transactions_v2/?key=${process.env.COVALENT_API_KEY}&quote-currency=USD`
  );

  const data = {
    daily_portfolio: formattedPortfolioData.reverse(),
    current_holdings: current_holdings.data.data,
    latest_transactions: latest_transactions.data.data,
  };

  res.status(200).json(data);
};
