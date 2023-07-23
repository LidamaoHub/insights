import { ethers } from 'ethers'
// import fetch from "isomorphic-unfetch";

const fetcher = (...args) => fetch(...args).then((res) => res.json())

const admin_slot = ethers.BigNumber.from("0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103")
const impl_slot = ethers.BigNumber.from("0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc")
const eip1822_slot = ethers.BigNumber.from('0xc5f16f0fcc639fa48a6947836d9850f504798523bf8c9a3a87d5876cf622bcf7')
let provider = null
const get_address = async (proxy_address, solt_address) => {
  const info = await provider.getStorageAt(proxy_address , solt_address)
  const address = ethers.utils.getAddress("0x" + info.substring(26))
  return address
}

export const getContractInfo = async (item, pro) => {
  provider = pro
  let proxy_address = item.to
  try {
    let res = await Promise.all([
      get_address(proxy_address, admin_slot), 
      get_address(proxy_address, impl_slot), 
      get_address(proxy_address, eip1822_slot)
    ])
    let admin_address = res[0]
    let eip1967_address = res[1]
    let eip1822_address = res[2]
    item.adminAddress = admin_address
    if (admin_address != '0x0000000000000000000000000000000000000000') {
      item.isProxy = true
    }
    if (eip1967_address != '0x0000000000000000000000000000000000000000') {
      item.proxyAddress = eip1967_address
    } else if (eip1822_address != '0x0000000000000000000000000000000000000000') {
      item.proxyAddress = eip1822_address
    }
    return item
  } catch (error) {
    return item
  }
}

export const getSourceCode = async (contract) => {
  let address = contract.proxyAddress || contract.to
  let chain = contract.chain
  if (!(chain.chainId == 1 || chain.chainId == 42 || chain.chainId == 3 || chain.chainId == 5 || chain.chainId == 11155111)) {
    contract.isOpenSources = false
  } else {
    let apiKey = '19SE5KR1KSVTIYMRTBJ8VQ3UJGGVFKIK5W'
    let name = 'api'
    if (chain.chainId == 42) name = 'api-kovan' 
    else if (chain.chainId == 3) name = 'api-ropsten'
    else if (chain.chainId == 5) name = 'api-goerli'
    else if (chain.chainId == 11155111) name = 'api-sepolia'
    else if (chain.chainId == 1) name = 'api'
    else name = ''
    if (!name) {
      contract.sources = null
    }
    try {
      let data = await fetcher(`https://${name}.etherscan.io/api?module=contract&action=getsourcecode&address=${address}&apikey=${apiKey}`)
      let result = data.result
      if (data.status == 1) {
        result = result[0]
        if (result.SourceCode) {
          contract.isOpenSources = true
        } else {
          contract.isOpenSources = false
        }
      } else {
        contract.isOpenSources = false
      }
    } catch (error) {
      console.log(error)
    }
  }
  return contract
}

export const setShortUrl = async (contract) => {
  let data = await fetcher(`https://api.dappreader.com/v1/set_short_url`, {
    method: 'POST',
    body: JSON.stringify({
      "chain_id": contract.chain.chainId,
      "contract_address": contract.to,
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  })
  console.log(data)
  if (data.code == 0) {
    contract.token = data.short_url_token
  }
  return contract
}

export const getRiskListFun = async (info) => {
  let setShortUrl = fetcher(`https://api.dappreader.com/v1/set_short_url`, {
    method: 'POST',
    body: JSON.stringify({
      "chain_id": info.chain.chainId,
      "contract_address": info.to,
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  })
  let getProxyUpdateCount = fetcher(`https://api.dappreader.com/v1/get_proxy_update_count`, {
    method: 'POST',
    body: JSON.stringify({
      admin_address: info.adminAddress,
      chain_id: info.chain.chainId
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  })
  let getTxAmount = fetcher(`https://api.dappreader.com/v1/get_tx_amount`, {
    method: 'POST',
    body: JSON.stringify({
      contract_address: info.to,
      chain_id: info.chain.chainId
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  })
  let arr = []
  if (info.isProxy) {
    arr = [setShortUrl, getProxyUpdateCount, getTxAmount]
  } else {
    arr = [setShortUrl]
  }
  try {
    let res = await Promise.all(arr)
    if (res[0].code == 0) {
      info.token = res[0].short_url_token
    }
    let deploy = res[1]?.deploy
    let update = res[1]?.update
    let address = res[2]?.address
    let tx = res[2]?.tx
    if (deploy?.risk === true) {
      info.riskList.push({risk: true, text: 'recently deployed', timestamp: deploy.timestamp})
    }
    if (update?.risk === true) {
      info.riskList.push({risk: true, text: 'recently updated', timestamp: update.timestamp})
    }
    if (address?.risk === true) {
      info.riskList.push({risk: true, text: 'less address', amount: address.amount, desc: `only ${address.amount} address`})
    }
    if (tx?.risk === true) {
      info.riskList.push({risk: true, text: 'less transaction', amount: tx.amount, desc: `only ${tx.amount} transaction`})
    }
  } catch (error) {
    console.log(error)
  }
  
  return info
}