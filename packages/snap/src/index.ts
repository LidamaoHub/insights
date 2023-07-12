import { OnTransactionHandler } from '@metamask/snaps-types';
import { heading, panel, text } from '@metamask/snaps-ui';
import { ethers } from 'ethers';
import { getContractInfo, getSourceCode } from './utils/utils.js';

// Handle outgoing transactions.
export const onTransaction: OnTransactionHandler = async ({ transaction }) => {
  let p = await new ethers.providers.Web3Provider(window.ethereum, "any");
  let info = await getContractInfo(transaction, p)
  let network = await p.getNetwork()
  info.chain = network
  info = await getSourceCode(info)
  console.log('info', info)
  return {
    content: panel([
      heading('Is Proxy'),
      text(
        `${info.isProxy ? 'Yes' : 'No'}`,
      ),
      heading('Is OpenSoure'),
      text(
        `${info.openStatus}`,
      ),
    ])
  };
};