import React from "react";
import { providers, utils, Contract, Signer, ethers } from "ethers";
import { useEffect, useState, useRef } from "react";
import Web3Modal from "web3modal";
import styles from "../styles/Home.module.css";
import { crytoDevGoerliAddress, crytoDevPolygonAddress } from "../constants";
import { abi } from "../constants/contractmetadata.json";

type Props = {};

type alertType = {
  number?: string;
};

type needSigner = true | false;

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

  const getProvider = async (): Promise<providers.Web3Provider> => {
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);
    const { chainId } = await web3Provider.getNetwork();

    if (chainId !== 5) {
      alert("Please change network to goerli or polygon");
      throw new Error("Please change network to goerli or polygon");
    }

    return web3Provider;
  };

  const getSigner = async (): Promise<providers.JsonRpcSigner> => {
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);
    const {chainId } = await web3Provider.getNetwork();

    if (chainId !==5) {
      alert("Please change network to goerli or polygon");
      throw new Error("Please change network to goerli or polygon");
    }

    const signer = web3Provider.getSigner();
    return signer;
  };

  const getSignerConnectedContract = async (): Promise<Contract> => {
    const signer = await getSigner();
    const signerConnectedContract = new Contract(
      crytoDevGoerliAddress,
      abi,
      signer
    );
    return signerConnectedContract;
  };

  const getProviderConnectedContract = async (): Promise<Contract> => {
    const provider = await getProvider();
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
      await getProvider();
      setWalletConnected(true);
    } catch (e: unknown) {
      console.log(e);
    }
  };

  const startPreSale = async () => {
    try {
      const nftContract = await getSignerConnectedContract();
      const tx = await nftContract.startPresale();
      setLoading(true);
      await tx.wait();
      setLoading(false);
      await checkIfPresaleStarted();
    } catch (e: unknown) {
      console.log(e);
    }
  };

  const checkIfPresaleStarted = async (): Promise<boolean | undefined> => {
    try {
      const nftContract = await getProviderConnectedContract();
      const _presaleStarted: boolean = await nftContract.presaleStarted();
      if (!_presaleStarted) {
        await getOwner();
      }
      setPresaleStarted(_presaleStarted);
      return _presaleStarted;
    } catch (e: unknown) {
      console.log(e);
    }
  };

  const checkIfPresaleHasEnded = async () => {
    try {
      const nftContract = await getProviderConnectedContract();
      const _preSaleEnded = await nftContract.presaleEnded();
      const hasEnded = _preSaleEnded.lt(Math.floor(Date.now() / 1000));
      if (hasEnded) {
        setPresaleEnded(true);
      } else {
        setPresaleEnded(false);
      }
      return hasEnded;
    } catch (e: unknown) {
      console.log(e);
      return false;
    }
  };

  const getOwner = async () => {
    try {
      const nftContract = await getProviderConnectedContract();
      const owner = await nftContract.owner();

      const signer = await getSigner();
      const address = await signer.getAddress();
      if (owner.toLowerCase() == address.toLowerCase()) {
        setIsOwner(true);
      }
    } catch (e: unknown) {
      console.log(e);
    }
  };

  const getTokenIdsMinted = async () => {
    try {
      const nftContract = await getProviderConnectedContract();
      const _tokenIds = await nftContract.tokenIds();
      setTokenIdsMinted(_tokenIds.toString());
    } catch (e: unknown) {
      console.log(e);
    }
  };

  useEffect(() => {
    // if wallet is not connected, create a new instance of Web3Modal and connect the MetaMask wallet
    if (!walletConnected) {
      // Assign the Web3Modal class to the reference object by setting it's `current` value
      // The `current` value is persisted throughout as long as this page is open
      web3ModalRef.current = new Web3Modal({
        network: "goerli",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();

      // Check if presale has started and ended
      const _presaleStarted = checkIfPresaleStarted();
      if (typeof _presaleStarted === "boolean") {
        if (_presaleStarted) {
          checkIfPresaleHasEnded();
        }
      }

      getTokenIdsMinted();

      // Set an interval which gets called every 5 seconds to check presale has ended
      const presaleEndedInterval = setInterval(async function () {
        const _presaleStarted = await checkIfPresaleStarted();
        if (_presaleStarted) {
          const _presaleEnded = await checkIfPresaleHasEnded();
          if (_presaleEnded) {
            clearInterval(presaleEndedInterval);
          }
        }
      }, 5 * 1000);

      // set an interval to get the number of token Ids minted every 5 seconds
      setInterval(async function () {
        await getTokenIdsMinted();
      }, 5 * 1000);
    }
  }, [walletConnected]);

  const renderButton = () => {
    // If wallet is not connected, return a button which allows them to connect their wllet
    if (!walletConnected) {
      return (
        <button onClick={connectWallet} className={styles.button}>
          Connect your wallet
        </button>
      );
    }

    // If we are currently waiting for something, return a loading button
    if (loading) {
      return <button className={styles.button}>Loading...</button>;
    }

    // If connected user is the owner, and presale hasnt started yet, allow them to start the presale
    if (isOwner && !presaleStarted) {
      return (
        <button className={styles.button} onClick={startPreSale}>
          Start Presale!
        </button>
      );
    }

    // If connected user is not the owner but presale hasn't started yet, tell them that
    if (!presaleStarted) {
      return (
        <div>
          <div className={styles.description}>Presale hasnt started!</div>
        </div>
      );
    }

    // If presale started, but hasn't ended yet, allow for minting during the presale period
    if (presaleStarted && !presaleEnded) {
      return (
        <div>
          <div className={styles.description}>
            Presale has started!!! If your address is whitelisted, Mint a Crypto
            Dev 🥳
          </div>
          <button className={styles.button} onClick={presaleMint}>
            Presale Mint 🚀
          </button>
        </div>
      );
    }

    // If presale started and has ended, its time for public minting
    if (presaleStarted && presaleEnded) {
      return (
        <button className={styles.button} onClick={publicMint}>
          Public Mint 🚀
        </button>
      );
    }
  };

  return (
    <div>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to Crypto Devs!</h1>
          <div className={styles.description}>
            Its an NFT collection for developers in Crypto.
          </div>
          <div className={styles.description}>
            {tokenIdsMinted}/20 have been minted
          </div>
          {renderButton()}
        </div>
        <div>
          <img className={styles.image} src="./image.svg" />
        </div>
      </div>
    </div>
  );
};

export default CrytoDev;
