export default function TradesHistory({}) {
  return (
    <div className='container mx-auto my-3'>
      <div className='flex flex-row justify-between items-center mb-8'>
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
                    {/* {tokens.map((token: any) => (
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
                  ))} */}
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
