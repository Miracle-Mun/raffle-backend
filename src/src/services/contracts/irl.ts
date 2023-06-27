

export const CreateIrl = async (data: any) => {
  try {
    const { metaplex, name, symbol, uri } = data

    let createTx;
    try {
      createTx = await metaplex.nfts().create({
        uri: uri,
        name: name,
        symbol: symbol,
        sellerFeeBasisPoints: 500, // Represents 5.00%.
      });
      return createTx

    } catch (error: any) {
      if (error.name === 'AccountNotFoundError') {
        return true
      } else {
        return false
      }

    }

  } catch (error) {
    console.log('error', error)

  }
}