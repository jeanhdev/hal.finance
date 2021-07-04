import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";
import Sentiment from "sentiment";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { allHoldings } = req.body;

  var output = new Array();

  for (let i = 0; i < allHoldings.length; i++) {
    var tokenData = new Array();

    const newsData = await axios
      .get(
        `https://newsapi.org/v2/everything?q=${
          "(" + allHoldings[i].contract_ticker_symbol + " OR " + allHoldings[i].contract_name + ")" + " AND " + "crypto"
        }&apiKey=${process.env.NEWS_API_KEY}&language=en`
      )
      .then((res) => {
        const resData = res.data;
        return resData;
      });

    const articles = newsData.articles;

    for (let y = 0; y < articles.length; y++) {
      const sentiment = new Sentiment();
      const sentimentOfArticle = sentiment.analyze(articles[y].description);
      const binaryResult = sentimentOfArticle.score < 0 ? "Negative" : "Positive";
      tokenData.push({
        token: allHoldings[i].contract_name,
        title: articles[y].title,
        sentimentScore: sentimentOfArticle.score,
        binaryResult: binaryResult,
      });
    }

    output.push(tokenData);
  }

  res.status(200).json(output.flat());
};
