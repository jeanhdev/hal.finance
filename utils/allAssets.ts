const findAllAssets = (resData: any) => {
  var output = new Array();

  for (let i = 0; i < resData.length; i++) {
    let holdings: Array<any> = resData[i].data.current_holdings.items;
    output.push(holdings);
  }

  return output.flat();
};

export default findAllAssets;
