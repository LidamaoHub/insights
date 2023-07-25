import { OnTransactionHandler, OnRpcRequestHandler } from '@metamask/snaps-types';
import { heading, panel, text, copyable, divider } from '@metamask/snaps-ui';
import { ethers } from 'ethers';
import { getContractInfo, setShortUrl, getRiskListFun, getSourceCode } from './utils/utils.js';

// Handle outgoing transactions.
export const onTransaction: OnTransactionHandler = async ({ transaction }) => {
  let p = await new ethers.providers.Web3Provider(window.ethereum, "any");
  let info = {chain: {}, token: '', to: transaction.to, isProxy: false, isOpenSources: false, riskList: []}
  let network = await p.getNetwork()
  info.chain = network
  // info = await setShortUrl(info)
  info = await getContractInfo(info, p)
  if (info.isProxy) {
    info.riskList.push({risk: true, text: 'upgradeable contract'})
  }
  info = await getSourceCode(info)
  if (!info.isOpenSources) {
    info.riskList.push({risk: true, text: 'not opensourced'})
  }
  info = await getRiskListFun(info)
  console.log(info)
  return {
    content: panel([
      text(
        `${info.riskList.length} risk item`,
      ),
      heading(`${info.riskList.length ? 'Risk List' : ''}`),
      ...info.riskList.map((item, i) => text(`${i + 1} ${item.text}`)),
      divider(),
      text(
        `More audit info from the following url`,
      ),
      copyable(
        `https://contract-info.pages.dev/mm${info.token}`,
      )
    ])
  };
};
