import React from "react";
import { providers, utils, Contract } from "ethers";
import { useEffect, useState, useRef } from "react";
import web3Modal from "web3modal";
import styles from "../styles/Home.module.css";
import { crytoDevGoerliAddress, crytoDevPolygonAddress } from "../constants";
import { abi } from "../constants/contractmetadata.json";

type Props = {};

type alertType = {
  message?: string;
};

type needSigner = boolean;

const CrytoDev = ({}: Props) => {
  // walletConnected keep track of whether the user's wallet is connected or not
  const [walletConnected, setWalletConnected] = useState<boolean>(false);
  // presaleStarted keeps track of whether the presale has started or not
  const [presaleStarted, setPresaleStarted] = useState<boolean>(false);
  // presaleEnded keeps track of whether the presale ended
  const [presaleEnded, setPresaleEnded] = useState<boolean>(false);
  // loading is set to true when we are waiting for a transaction to get mined
  const [loading, setLoading] = useState<boolean>(false);
  // checks if the currently connected MetaMask wallet is the owner of the contract
  const [isOwner, setIsOwner] = useState<boolean>(false);
  // tokenIdsMinted keeps track of the number of tokenIds that have been minted
  const [tokenIdsMinted, setTokenIdsMinted] = useState<string>("0");
  // Create a reference to the Web3 Modal (used for connecting to Metamask) which persists as long as the page is open
  const web3ModalRef = useRef<any>();

  const getSignerOrProvider = async (needSigner: needSigner = false) => {
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);
    const { chainId } = await web3Provider.getNetwork();

    if (chainId != 5 || 80001) {
      alert("Please change network to goerli or polygon");
      throw new Error("Please change network to goerli or polygon");
    }

    if (needSigner) {
      const signer = await web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };

  const getSignerConnectedContract = async (): Promise<Contract> => {
    const signer = await getSignerOrProvider(true);
    const signerConnectedContract = new Contract(
      crytoDevGoerliAddress,
      abi,
      signer
    );
    return signerConnectedContract;
  };

  const getProviderConnectedContract = async (): Promise<Contract> => {
    const provider = await getSignerOrProvider(false);
    const providerConnectedAccount = new Contract(
      crytoDevGoerliAddress,
      abi,
      provider
    );
    return providerConnectedAccount;
  };

  // This function can be performed only 5 minutes  owner of the contract  starts presale
  const presaleMint = async () => {
    try {
      const nftContract = await getSignerConnectedContract();
      // value is the amount to be specified for the transaction
      // the amount is 0.01ETH which is == 10000000000000000wei
      const tx = await nftContract.presaleMint({
        value: utils.parseEther("0.01"),
      });
      // to load te button when the transaction is about to be performed
      setLoading(true);
      await tx.wait();
      // to stop the button from after the transaction response has been gotten
      setLoading(false);
      alert("you have successful minted a Crypto Dev Nft , welldone 🚀🚀");
    } catch (e: unknown) {
      console.log(e);
    }
  };

  const publicMint = async () => {
    try {
      const nftContract = await getSignerConnectedContract();
      const tx = await nftContract.mint({
        value: utils.parseEther("0.01"),
      });
      // to load te button when the transaction is about to be performed
      setLoading(true);
      await tx.wait();
      // to stop the button from after the transaction response has been gotten
      setLoading(false);
      alert("you have successful minted a Crypto Dev Nft , welldone 🚀🚀");
    } catch (e: unknown) {
      console.log(e);
    }
  };

  const connectWallet = async () => {
    try {
      await getSignerOrProvider();
      setWalletConnected(true);
    } catch (e: unknown) {
      console.log(e);
    }
  };

  const  startPreSale = async()=>{
      try{
        const nftContract = await getSignerConnectedContract()
        const tx = await nftContract.startPresale()
        setLoading(true)
        await tx.wait()
        setLoading(false)
        await checkIfPresaleStarted();
      }catch(e:unknown){
        console.log(e)
      }
  }

 
  const checkIfPresaleStarted =async()=>{
   try{
       const nftContract = await getProviderConnectedContract()
       const _presaleStarted = await nftContract.presaleStarted()
       if(!_presaleStarted){
        await getOwner()
       }
       setPresaleStarted(_presaleStarted)
       return _presaleStarted
   }
   catch(e:unknown){
     console.log(e)
   }
  }

  return <div>helfahhh</div>;
};

export default CrytoDev;
