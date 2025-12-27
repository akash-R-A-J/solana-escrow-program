# Solana Escrow Program

A trustless, peer‑to‑peer token escrow built on Solana devnet, with a React/TypeScript frontend and an Anchor-based smart contract. Users can create offers to swap one SPL token for another, take existing offers, or revoke their own offers without any centralized intermediary.

---

## Features

- **Trustless SPL token swaps** using a Solana program deployed on devnet
- **Create, take, and revoke** escrow offers with a clean React UI
- **Program Derived Addresses (PDAs)** for deterministic offer and vault accounts
- **Wallet adapter integration** (Phantom, Solflare, etc.) for signing and sending transactions
- **Type-safe integration** via Anchor IDL and modern Vite/TypeScript frontend tooling

---

## Architecture

The system has three main layers:

### Frontend dApp
React + TypeScript single‑page application that handles:
- Wallet connection and gating of authenticated actions
- Creating offers, listing all offers, and managing "My Offers"
- Calling blockchain operations via a `useEscrow` hook

### Integration Layer
A set of hooks and services that bridge the UI and Solana:
- `@coral-xyz/anchor` for type-safe program interaction using the IDL
- `@solana/web3.js` for RPC communication and transaction sending
- `@solana/spl-token` for SPL token account operations
- `@solana/wallet-adapter-*` packages for wallet connectivity and signing

### On‑chain Program (Escrow)
An Anchor-based Solana program (deployed on devnet) that:
- Manages escrowed token custody in a vault PDA
- Tracks offer metadata in an offer PDA
- Executes atomic swaps and cleans up accounts

**Program address (devnet):** `6kTpPk3Bm4SfY2KuLF5sH4cpsTwBUtyJ5j3prMB92i7Q`

---

## Smart Contract Design

### Accounts

The program uses deterministic PDAs for offers and token vaults:

#### Offer PDA
- **Seeds:** `["offer", id: u64]`
- **Fields:**
  - `id: u64` (timestamp-based identifier)
  - `offer_maker: Pubkey`
  - `token_mint_a: Pubkey`
  - `token_mint_b: Pubkey`
  - `token_b_demanded_amount: u64`
  - `bump: u8`

#### Vault PDA
- **Type:** Associated Token Account (ATA)
- **Seeds:** `[offer_pubkey, token_program, token_mint_a]`
- Holds escrowed Token A for the lifetime of the offer

This structure allows the frontend to derive and verify addresses off‑chain while the program enforces them on‑chain.

### Instructions

The program exposes three core instructions:

#### `make_offer`
- Creates the offer PDA
- Creates/derives the vault ATA for Token A
- Transfers Token A from the maker into the vault

#### `take_offer`
- Transfers Token B from the taker to the maker
- Transfers Token A from the vault to the taker
- Closes the offer and vault accounts

#### `revoke_offer`
- Verifies the signer is the original maker
- Returns escrowed Token A from the vault to the maker
- Closes the offer and vault accounts

All operations are atomic and governed by PDAs plus signer checks, removing counterparty risk in the swap.

---

## Frontend Application

The frontend is a Vite‑powered React app written in TypeScript.

### Key Components

- **App:** Main orchestrator, manages tab navigation (`Create Offer`, `All Offers`, `My Offers`), wallet connection gating, and a `refreshTrigger` mechanism to refetch on‑chain state after actions

- **Header:** Displays branding and uses `WalletMultiButton` from `@solana/wallet-adapter-react-ui` for wallet connection

- **CreateOffer:** Form for creating a new offer with Token A/B selection, amount inputs, and submission via the `useEscrow.makeOffer` hook

- **OffersList:** Lists all open offers and exposes a "Take" action that opens the `TakeOfferModal`

- **MyOffers:** Filters offers by the connected wallet's public key and allows the maker to revoke offers

- **OfferCard:** Reusable UI card for displaying offer details (maker, tokens, amounts, status)

- **TakeOfferModal:** Confirmation dialog for taking an offer, includes balance validation on the taker's Token B account and feedback on loading/error states

### State Management & Data Flow

- Local React state for UI concerns (forms, loading, errors)
- A custom `useEscrow` hook that:
  - Reads the connected wallet and IDL types
  - Builds Anchor transactions (`make_offer`, `take_offer`, `revoke_offer`)
  - Sends and confirms transactions via RPC
- A `refreshTrigger` state value in `App` that increments on successful transactions and triggers data refetch for dependent components

---

## Technology Stack

### Frontend
- **React** `^19.2.0` – component-based UI
- **TypeScript** `~5.9.3` – type safety and better tooling
- **Vite** `^7.2.4` – fast dev server and build system
- **ESLint** `^9.39.1` – linting and code quality

### Solana / Web3
- `@coral-xyz/anchor` – IDL-driven program interface
- `@solana/web3.js` – RPC and transaction utilities
- `@solana/spl-token` – SPL token account management
- `@solana/wallet-adapter-react`, `react-ui`, `wallets` – wallet connection and UI
- `bn.js` – big integer math for token amounts

---

## Getting Started

### Prerequisites

- Node.js (LTS recommended)
- Yarn or npm
- A Solana wallet (Phantom, Solflare, etc.) funded on **devnet**
- Solana CLI and Anchor (optional, if you want to build/deploy the program yourself)

### Frontend Setup

```bash
git clone https://github.com/akash-R-A-J/solana-escrow-program.git
cd solana-escrow-program/frontend

# install dependencies
yarn            # or: npm install

# start dev server
yarn dev        # or: npm run dev
```

The app will start on the Vite dev server (e.g. `http://localhost:5173`). Connect a devnet wallet and you should see your offers and the global offers list.

### Building & Preview

```bash
# build production bundle
yarn build      # or: npm run build

# preview production build locally
yarn preview    # or: npm run preview
```

### Program Deployment (Optional)

The repository currently targets the devnet program at:

```
6kTpPk3Bm4SfY2KuLF5sH4cpsTwBUtyJ5j3prMB92i7Q
```

To deploy your own instance:

1. Install Anchor and Solana CLI
2. Configure Solana to use devnet (`solana config set --url https://api.devnet.solana.com`)
3. Build and deploy the program from the `programs` directory
4. Update the program ID and IDL reference in the frontend (`frontend/src/idl/escrow.json` and any config)

---

## Development Guide

The project uses standard scripts defined in `frontend/package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint src --ext ts,tsx",
    "preview": "vite preview"
  }
}
```

Typical workflow:

1. Run `yarn dev` for hot-reload development
2. Use `yarn lint` to catch issues early
3. Build and preview with `yarn build` and `yarn preview` before deployment

---

## Future Improvements

Some potential extensions to this project:

- **Unit and integration tests** for the on‑chain program and the `useEscrow` hook
- **Price/quote integration** (e.g., Pyth or Switchboard) to show approximate USD values
- **Order filtering and sorting** (by token, amount, recency)
- **Mainnet‑beta configuration** with environment-based RPC and program IDs
- **Notification/toast system** for transaction lifecycle feedback
- **Enhanced error handling** with user-friendly messages for common failure scenarios
- **Token decimals handling** with explicit validation and display

---

## Project Structure

```
solana-escrow-program/
├── frontend/               # React + TypeScript dApp
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── hooks/         # Custom hooks (useEscrow)
│   │   ├── idl/           # Anchor IDL
│   │   └── App.tsx        # Main app component
│   └── package.json
├── programs/              # Anchor smart contract
│   └── escrow/
│       └── src/
│           └── lib.rs     # Program logic
└── README.md
```

---

## Contributing

Contributions are welcome! Feel free to:

- Open issues for bugs or feature requests
- Submit pull requests with improvements
- Share feedback and suggestions

---

## License

MIT License - feel free to use this project for learning or building your own escrow solutions.

---

## Contact

Built by [akash-R-A-J](https://github.com/akash-R-A-J)

For questions or collaboration opportunities, feel free to reach out via GitHub.
