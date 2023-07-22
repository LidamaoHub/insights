import { OnTransactionHandler, OnRpcRequestHandler } from '@metamask/snaps-types';
import { heading, panel, text, copyable, divider } from '@metamask/snaps-ui';
import { ethers } from 'ethers';
import { getContractInfo, setShortUrl } from './utils/utils.js';

// Handle outgoing transactions.
export const onTransaction: OnTransactionHandler = async ({ transaction }) => {
  let p = await new ethers.providers.Web3Provider(window.ethereum, "any");
  let info = await getContractInfo(transaction, p)
  let network = await p.getNetwork()
  info.chain = network
  info = await setShortUrl(info)
  console.log(info)
  return {
    content: panel([
      heading('Risk List'),
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
