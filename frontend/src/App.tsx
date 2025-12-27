import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Header, CreateOffer, OffersList, MyOffers } from "./components";
import "./index.css";

type Tab = "browse" | "create" | "my-offers";

function App() {
  const { publicKey } = useWallet();
  const [activeTab, setActiveTab] = useState<Tab>("browse");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleOfferCreated = () => {
    setRefreshTrigger((prev) => prev + 1);
    setActiveTab("my-offers");
  };

  return (
    <div className="app">
      <Header />

      <main className="main-content">
        <div className="container">
          {!publicKey ? (
            <div className="connect-prompt">
              <div className="connect-prompt-icon">🔐</div>
              <h2 className="connect-prompt-title">Connect Your Wallet</h2>
              <p className="connect-prompt-text">
                connect your solana wallet to start trading tokens peer-to-peer
                using our secure escrow system
              </p>
              <WalletMultiButton className="wallet-button" />
            </div>
          ) : (
            <>
              <div className="tabs">
                <button
                  className={`tab ${activeTab === "browse" ? "active" : ""}`}
                  onClick={() => setActiveTab("browse")}
                >
                  🔍 Browse Offers
                </button>
                <button
                  className={`tab ${activeTab === "create" ? "active" : ""}`}
                  onClick={() => setActiveTab("create")}
                >
                  ➕ Create Offer
                </button>
                <button
                  className={`tab ${activeTab === "my-offers" ? "active" : ""}`}
                  onClick={() => setActiveTab("my-offers")}
                >
                  📋 My Offers
                </button>
              </div>

              {activeTab === "browse" && (
                <div>
                  <h2 className="section-title">
                    <span className="section-title-icon">🔍</span>
                    Available Offers
                  </h2>
                  <OffersList refreshTrigger={refreshTrigger} />
                </div>
              )}

              {activeTab === "create" && (
                <CreateOffer onSuccess={handleOfferCreated} />
              )}

              {activeTab === "my-offers" && (
                <div>
                  <h2 className="section-title">
                    <span className="section-title-icon">📋</span>
                    My Active Offers
                  </h2>
                  <MyOffers refreshTrigger={refreshTrigger} />
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <footer
        style={{
          textAlign: "center",
          padding: "24px",
          color: "var(--text-muted)",
          fontSize: "13px",
          borderTop: "1px solid var(--border-color)",
        }}
      >
        escrow on solana devnet • built with anchor
      </footer>
    </div>
  );
}

export default App;
