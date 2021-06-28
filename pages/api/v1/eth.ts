import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { address } = req.query;
  const chainId = 1;
  // We'll need to do error handling on each requests, and make multiple axios promises at once instead of 3 calls
  const daily_portfolio = await axios.get(
    `https://api.covalenthq.com/v1/${chainId}/address/${address}/portfolio_v2/?key=${process.env.COVALENT_API_KEY}`
  );

  const current_holdings = await axios.get(
    `https://api.covalenthq.com/v1/${chainId}/address/${address}/balances_v2/?key=${process.env.COVALENT_API_KEY}`
  );

  const latest_transactions = await axios.get(
    `https://api.covalenthq.com/v1/${chainId}/address/${address}/transactions_v2/?key=${process.env.COVALENT_API_KEY}`
  );

  const data = {
    daily_portfolio: daily_portfolio.data,
    current_holdings: current_holdings.data.data,
    latest_transactions: latest_transactions.data.data,
  };

  res.status(200).json(data);
};
