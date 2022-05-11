import { ethers } from "ethers";
import "./App.css";

function App() {
  const wave = () => {};

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">👨🏽‍💻 Hi everybody!</div>

        <div className="bio">
          This is Gabriel Antunes! A Software Engineer and Father of Cats!
        </div>

        <button className="waveButton" onClick={wave}>
          Wave for me 👋🏽
        </button>
      </div>
    </div>
  );
}

export default App;
