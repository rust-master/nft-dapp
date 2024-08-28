import { useEffect, useState } from "react";
import { BrowserProvider, Contract, ethers } from 'ethers';
import {
  createWeb3Modal,
  defaultConfig,
  useWeb3Modal,
  useWeb3ModalAccount,
  useWeb3ModalProvider,
  useDisconnect,
} from '@web3modal/ethers/react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CircularProgress from '@mui/material/CircularProgress';
import ABI from "./ABI.json";
import './App.css';

// Set up your Web3Modal configuration
const projectId = '8ad813f72792250629f434f63aa93b32';
const bnb_tesnet = {
  chainId: 97,
  name: 'BNB Chain',
  currency: 'BNB',
  explorerUrl: 'https://testnet.bscscan.com',
  rpcUrl: 'https://bsc-testnet.core.chainstack.com/a6ac3e4320de6a11032f3eba5d3a0d1e',
};

const metadata = {
  name: 'Portfolio Token dApp',
  description: 'Portfolio token minting dApp',
  url: 'https://mywebsite.com',
  icons: ['https://avatars.mywebsite.com/'],
};

const ethersConfig = defaultConfig({
  metadata,
  enableEIP6963: true,
  enableInjected: true,
  enableCoinbase: true,
  rpcUrl: '...', // used for the Coinbase SDK
  defaultChainId: 1, // used for the Coinbase SDK
});

createWeb3Modal({
  ethersConfig,
  chains: [bnb_tesnet],
  projectId,
  enableAnalytics: true,
});

const NFTContractAddress = "0x2330E22304853cDB96893B4c801D7F5e37904Dd4";

function App() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: null,
  });
  const [minting, setMinting] = useState(false);

  const { open } = useWeb3Modal();
  const { disconnect } = useDisconnect();
  const { address, isConnected } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();

  useEffect(() => {
    if (isConnected) {
      console.log("Wallet connected:", address);
    } else {
      console.log("Wallet disconnected");
    }
  }, [isConnected, address]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  const connectWallet = async () => {
    try {
      open();
    } catch (error) {
      toast.error("Connection error.");
    }
  };

  const disconnectWallet = async () => {
    try {
      disconnect();
    } catch (error) {
      toast.error("Disconnection error.");
    }
  };

  const mintNFT = async (e) => {
    e.preventDefault();

    if (!isConnected) {
      toast.error("Please connect your wallet first.");
      return;
    }

    try {
      setMinting(true);
      const browserProvider = new ethers.BrowserProvider(walletProvider);
      const signer = await browserProvider.getSigner();
      const contract = new ethers.Contract(NFTContractAddress, ABI.abi, signer);

      const urlmeta =
        "https://bafybeig3afmvrkajh7n73dlpzi7p5fnib4btkztjk4jh3ky4aprqzr6ey4.ipfs.w3s.link/metadata.json";

      const tx = await contract.safeMint(urlmeta, {
        gasLimit: 2100000,
      });

      const result = await tx.wait();
      if (result && result.status === 1) {
        console.log("Minted NFT:", result);
        toast.success("Minted successfully!");
      } else {
        toast.error("Minting failed. Try again!");
      }
    } catch (error) {
      console.error("Minting error:", error);
      toast.error("Minting failed. Try again!");
    } finally {
      setMinting(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Full Stack NFT dApp</h1>
        <form onSubmit={mintNFT}>
          <div>
            <label>Name:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label>Description:</label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label>Image:</label>
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>
          <button type="submit" disabled={minting}>
            {minting ? (
              <CircularProgress size={15} sx={{ color: '#fff' }} />
            ) : (
              `Mint NFT`
            )}
          </button>
        </form>
        <div className="wallet-section">
          <button className="btn" onClick={isConnected ? disconnectWallet : connectWallet}>
            {isConnected ? 'Disconnect Wallet' : 'Connect Wallet'}
          </button>
          <p>{address ? `${address.slice(0, 6)}.......${address.slice(-4)}` : 'Wallet Not Connected'}</p>
        </div>
        <ToastContainer />
      </header>
    </div>
  );
}

export default App;
