import { ContractInterface, ethers } from "ethers";
import { useMemo, useState, useEffect, useCallback } from "react";
import { abi } from "./assets/abi/WavePortal.json";

import "./App.css";

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
const CONTRACT_BIN = abi;

type Wave = {
  waver: string;
  message: string;
  timestamp: string;
};

function App() {
  const [currentAccount, setCurrentAccount] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [totalWave, setTotalWave] = useState(0);
  const [allWaves, setAllWaves] = useState<Wave[]>([]);

  const metaMaskIsInstalled = useMemo(() => {
    return Boolean(window.ethereum);
  }, []);

  const waveProtalContract = useMemo(() => {
    if (metaMaskIsInstalled && CONTRACT_ADDRESS && CONTRACT_BIN) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_BIN, signer);
    }
  }, [metaMaskIsInstalled]);

  const getAllWaves = useCallback(async () => {
    if (!waveProtalContract) {
      return;
    }

    try {
      setIsLoading(true);
      const allWaves: Wave[] = await waveProtalContract.getAllWaves();

      const cleaned = allWaves.map((i): Wave => {
        console.log("iutems", i);
        return {
          waver: i.waver,
          message: i.message,
          timestamp: new Date(Number(i.timestamp) * 1000).toISOString(),
        };
      });

      setAllWaves(cleaned);
      setIsLoading(false);
    } catch (err) {
      console.warn("getAllWaves()", (err as Error).message);
      setIsLoading(false);
    }
  }, []);

  const connectWallet = useCallback(async () => {
    try {
      if (!metaMaskIsInstalled) {
        throw new Error("metamask is not instaled");
      }

      if (!waveProtalContract) {
        return;
      }

      const { ethereum } = window;

      let accounts = await ethereum.request<string[]>({
        method: "eth_accounts",
      });

      if (!accounts?.length) {
        accounts = await ethereum.request({
          method: "eth_requestAccounts",
        });
      }

      setCurrentAccount((accounts as string[])[0]);

      const data = await waveProtalContract?.getTotalWaves();

      setTotalWave(data.toNumber());
      getAllWaves();
    } catch (err) {
      return alert(`Error ${(err as Error).message}`);
    }
  }, [waveProtalContract, metaMaskIsInstalled, getAllWaves]);

  const sayWave = useCallback(async () => {
    try {
      const waveTransaction = await waveProtalContract?.wave(message);
      console.info("Minerando...", waveTransaction.hash);

      await waveTransaction.wait();

      console.info("Minerado...", waveTransaction.hash);

      const data = await waveProtalContract?.getTotalWaves();

      setTotalWave(data.toNumber());
      getAllWaves();
    } catch (err) {
      console.warn((err as Error).message);
    }
  }, [message]);

  useEffect(() => {
    connectWallet();
  }, [connectWallet, getAllWaves]);

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">👨🏽‍💻 Hi everybody!</div>
        <div className="bio">
          This is Gabriel Antunes! A Software Engineer and Father of Cats!
        </div>

        {Boolean(currentAccount) && (
          <input
            className="input"
            value={message}
            placeholder="Type a message for me"
            onChange={($e) => {
              setMessage($e.target.value);
            }}
          />
        )}

        {metaMaskIsInstalled ? (
          <button
            className="waveButton"
            onClick={currentAccount ? sayWave : connectWallet}
            disabled={isLoading}
          >
            {currentAccount ? "Wave for me 👋🏽" : "🦊 Connect Metamask"}
          </button>
        ) : (
          <a className="link" href="https://metamask.io/" target="_blank">
            🦊 Please install Metamask to continue
          </a>
        )}

        {Boolean(totalWave) && (
          <div className="totalWave">Total Waves: {totalWave}</div>
        )}

        {allWaves.map((wave, index) => {
          return (
            <div
              key={index}
              style={{
                backgroundColor: "OldLace",
                marginTop: "16px",
                padding: "8px",
              }}
            >
              <div>Endereço: {wave.waver}</div>
              <div>Data/Horário: {wave.timestamp}</div>
              <div>Mensagem: {wave.message}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;
