import { useEffect, useState } from "react";
import "./App.css";
import Web3 from "web3";
import axios from "axios";
import ABI from "./ABI.json";

const NFTContractAddress = "0x2330E22304853cDB96893B4c801D7F5e37904Dd4";

function App() {
  const [web3, setWeb3] = useState();
  const [account, setAccount] = useState();
  const [contract, setContract] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: null,
  });

  const connectToMetaMask = async () => {
    const provider = window.ethereum;
    if (!provider) {
      alert("Please install MetaMask");
      return;
    }

    const accounts = await provider.request({ method: "eth_requestAccounts" });
    const web3 = new Web3(provider);

    const contractInstance = new web3.eth.Contract(ABI.abi, NFTContractAddress);

    setContract(contractInstance);
    setWeb3(web3);
    setAccount(accounts[0]);
  };

  useEffect(() => {
    connectToMetaMask();
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { name, description, image } = formData;
      const formDataUpload = new FormData();
      formDataUpload.append("name", name);
      formDataUpload.append("description", description);
      formDataUpload.append("image", image);

      // const response = await axios.post(
      //   "http://localhost:3001/upload/web3storage",
      //   formDataUpload,
      //   {
      //     headers: {
      //       "Content-Type": "multipart/form-data",
      //     },
      //   }
      // );

      // console.log("Response from server:", response.data);
      // console.log("URL:", response.data.ipfsUrl.toString());

      const urlmeta =
        "https://bafybeig3afmvrkajh7n73dlpzi7p5fnib4btkztjk4jh3ky4aprqzr6ey4.ipfs.w3s.link/metadata.json";



      const result = await contract.methods.safeMint(urlmeta).send({
        from: account,
        gas: 2100000,
        gasPrice: 8000000000,
      });

      console.log("Minted NFT:", result);

      // You can display a success message or redirect the user after successful upload
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <div>
          <h1>Full Stack NFT dApp</h1>
          <form onSubmit={handleSubmit}>
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
            <button type="submit">Mint NFT</button>
          </form>
        </div>
      </header>
    </div>
  );
}

export default App;
