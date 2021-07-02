import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  let chain_id;
  if (req.query.chain_id) {
    chain_id = req.query.chain_id;
  } else {
    chain_id = 1;
  }

  const aave_assets = await axios.get(
    `https://api.covalenthq.com/v1/${chain_id}/networks/aave_v2/assets/?key=${process.env.COVALENT_API_KEY}`
  );

  const compound_assets = await axios.get(
    `https://api.covalenthq.com/v1/1/networks/compound/assets/?key=${process.env.COVALENT_API_KEY}&quote-currency=USD`
  );

  const sushi_assets = await axios.get(
    `https://api.covalenthq.com/v1/${chain_id}/networks/sushiswap/assets/?key=${process.env.COVALENT_API_KEY}&quote-currency=USD`
  );

  const data = {
    aave: aave_assets.data.data,
    compound: compound_assets.data.data,
    sushi: sushi_assets.data.data,
  };

  res.status(200).json(data);
};
