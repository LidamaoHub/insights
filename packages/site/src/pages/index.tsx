import { useContext } from 'react';
import styled from 'styled-components';
import { MetamaskActions, MetaMaskContext } from '../hooks';
import { ethers } from 'ethers'
import {
  connectSnap,
  getSnap,
  sendHello,
  shouldDisplayReconnectButton,
} from '../utils';
import {
  ConnectButton,
  InstallFlaskButton,
  ReconnectButton,
  ApplyButton,
  Card,
} from '../components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  margin-top: 7.6rem;
  margin-bottom: 7.6rem;
  ${({ theme }) => theme.mediaQueries.small} {
    padding-left: 2.4rem;
    padding-right: 2.4rem;
    margin-top: 2rem;
    margin-bottom: 2rem;
    width: auto;
  }
`;

const Heading = styled.h1`
  margin-top: 0;
  margin-bottom: 2.4rem;
  text-align: center;
`;

const Span = styled.span`
  color: ${(props) => props.theme.colors.primary.default};
`;

const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.large};
  font-weight: 500;
  margin-top: 0;
  margin-bottom: 0;
  ${({ theme }) => theme.mediaQueries.small} {
    font-size: ${({ theme }) => theme.fontSizes.text};
  }
`;

const CardContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  max-width: 100rem;
  width: 100%;
  height: 100%;
  margin-top: 1.5rem;
`;

const Notice = styled.div`
  background-color: ${({ theme }) => theme.colors.background.alternative};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  color: ${({ theme }) => theme.colors.text.alternative};
  border-radius: ${({ theme }) => theme.radii.default};
  padding: 2.4rem;
  margin-top: 2.4rem;
  max-width: 100rem;
  width: 100%;

  & > * {
    margin: 0;
  }
  ${({ theme }) => theme.mediaQueries.small} {
    margin-top: 1.2rem;
    padding: 1.6rem;
  }
`;

const ErrorMessage = styled.div`
  background-color: ${({ theme }) => theme.colors.error.muted};
  border: 1px solid ${({ theme }) => theme.colors.error.default};
  color: ${({ theme }) => theme.colors.error.alternative};
  border-radius: ${({ theme }) => theme.radii.default};
  padding: 2.4rem;
  margin-bottom: 2.4rem;
  margin-top: 2.4rem;
  max-width: 60rem;
  width: 100%;
  ${({ theme }) => theme.mediaQueries.small} {
    padding: 1.6rem;
    margin-bottom: 1.2rem;
    margin-top: 1.2rem;
    max-width: 100%;
  }
`;

const abi1 = '[{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"handSymbol","type":"uint256"},{"indexed":false,"internalType":"address","name":"player","type":"address"}],"name":"BetEvent","type":"event"},{"inputs":[],"name":"_init","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"a","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"a","type":"uint256"},{"internalType":"uint256","name":"b","type":"uint256"}],"name":"add","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[],"name":"b","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"d","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"input","type":"uint256"}],"name":"s","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"handSymbol","type":"uint256"}],"name":"showHands","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"waitTime","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}]'
const address1 = '0xf3bf90f6d60df979e43f914ecb60303a2caa3bef'

const abi2 = '[{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"handSymbol","type":"uint256"},{"indexed":false,"internalType":"address","name":"player","type":"address"}],"name":"BetEvent","type":"event"},{"inputs":[],"name":"_init","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"a","type":"uint256"},{"internalType":"uint256","name":"b","type":"uint256"}],"name":"add","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"uint256","name":"_waitTime","type":"uint256"}],"name":"adminSetWaitTime","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"count","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_count","type":"uint256"}],"name":"setCount","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"handSymbol","type":"uint256"}],"name":"showHands","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"waitTime","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}]'
const address2 = '0x9e086c9d8a02565c07043c6e3d5131910bec2e48'


const Index = () => {
  const [state, dispatch] = useContext(MetaMaskContext);

  const handleConnectClick = async () => {
    try {
      await connectSnap();
      const installedSnap = await getSnap();
      dispatch({
        type: MetamaskActions.SetInstalled,
        payload: installedSnap,
      });
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  const run1 = async () => {
    let web3Provider: any = window.ethereum
    let provider = new ethers.providers.Web3Provider(web3Provider, "any")
    await provider.send('eth_requestAccounts', [])
    let network = await provider.getNetwork()
    let signer = provider.getSigner()
    let C1 = await new ethers.Contract(address1, abi1, signer)
    try {
      if (network.chainId !== 5) {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x5' }]
        })
      }
      let tx = await C1['s'](1)
      console.log(tx)
    } catch (error) {
      console.log(error)
    }
  }
  
  const run2 = async () => {
    let web3Provider: any = window.ethereum
    let provider = new ethers.providers.Web3Provider(web3Provider, "any")
    await provider.send('eth_requestAccounts', [])
    let network = await provider.getNetwork()
    let signer = provider.getSigner()
    let C2 = await new ethers.Contract(address2, abi2, signer)
    try {
      console.log(network)
      if (network.chainId !== 5) {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x5' }]
        })
      }
      let tx = await C2.setCount(1)
    } catch (error) {
      console.log(error)
    }
  }

  const handleSendHelloClick = async () => {
    try {
      await sendHello();
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  return (
    <Container>
      <Heading>
        Welcome to <Span>template-snap</Span>
      </Heading>
      <Subtitle>
        Get started by editing <code>src/index.ts</code>
      </Subtitle>
      <CardContainer>
        {state.error && (
          <ErrorMessage>
            <b>An error happened:</b> {state.error.message}
          </ErrorMessage>
        )}
        {!state.isFlask && (
          <Card
            content={{
              title: 'Install',
              description:
                'Snaps is pre-release software only available in MetaMask Flask, a canary distribution for developers with access to upcoming features.',
              button: <InstallFlaskButton />,
            }}
            fullWidth
          />
        )}
        {!state.installedSnap && (
          <Card
            content={{
              title: 'Connect',
              description:
                'Get started by connecting to and installing the example snap.',
              button: (
                <ConnectButton
                  onClick={handleConnectClick}
                  disabled={!state.isFlask}
                />
              ),
            }}
            disabled={!state.isFlask}
          />
        )}
        {shouldDisplayReconnectButton(state.installedSnap) && (
          <Card
            content={{
              title: 'Reconnect',
              description:
                'While connected to a local running snap this button will always be displayed in order to update the snap if a change is made.',
              button: (
                <ReconnectButton
                  onClick={handleConnectClick}
                  disabled={!state.installedSnap}
                />
              ),
            }}
            disabled={!state.installedSnap}
          />
        )}
        <Card
          content={{
            title: 'Interacting Proxy Contract',
            description:
              'User try to interact with a proxy contract from an unknown source that has just been updated.',
            button: (
              <ApplyButton
                onClick={run1}
                disabled={!state.installedSnap}
              />
            ),
          }}
          disabled={!state.installedSnap}
        />
        <Card
          content={{
            title: 'Interacting Normal Contract',
            description:
              'User try to interact a normal contract',
            button: (
              <ApplyButton
                onClick={run2}
                disabled={!state.installedSnap}
              />
            ),
          }}
          disabled={!state.installedSnap}
        />
        <div style={{width: '250px',height: 0,fontSize:0,overflow:'hidden'}}></div>
        <Notice>
          <p>
            Please note that the <b>snap.manifest.json</b> and{' '}
            <b>package.json</b> must be located in the server root directory and
            the bundle must be hosted at the location specified by the location
            field.
          </p>
        </Notice>
      </CardContainer>
    </Container>
  );
};

export default Index;
