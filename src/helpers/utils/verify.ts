import Web3 from 'web3'

export const verifyEthereum = (address, signature) => {
  let web3 = new Web3(new Web3.providers.HttpProvider('https://mainnet.infura.io/v3/a96c6b2710b64f2380bf6045c1e9e13d'));
  let original_message = 'Sign Message'

  let recoveredAddress = web3.eth.accounts.recover(original_message, signature)
  return recoveredAddress.toUpperCase() === address.toUpperCase()
}

