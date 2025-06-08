# StackToken dApp

A decentralized Q&A platform built on the MultiversX blockchain. Users can ask and answer questions, interact with the StackToken smart contract, and connect their MultiversX wallets (including xPortal) for blockchain-based actions.

## Features
- Ask and answer questions on-chain
- Connect with MultiversX wallets (only Metamask available)
- Earn and spend StackToken for participation
- Modern, responsive UI

## Technologies Used
- [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/) (build tool)
- [Tailwind CSS](https://tailwindcss.com/) (utility-first CSS)
- [shadcn/ui](https://ui.shadcn.com/) (UI components)
- [MultiversX SDK](https://docs.multiversx.com/sdk-and-tools/sdk-dapp/) (`@multiversx/sdk-dapp`)
- [WalletConnect v2](https://cloud.walletconnect.com/)

## How It Works

### Architecture Overview
- **Frontend**: Built with React and TypeScript, the dApp provides a modern, responsive interface for users to interact with the blockchain.
- **Smart Contract**: The StackToken contract (written in Rust, deployed on MultiversX) manages questions, answers, and token balances.
- **Wallet Integration**: Users connect their MultiversX-compatible wallets (web, xPortal, WalletConnect) to sign transactions and interact with the contract.
- **On-chain Q&A**: All questions and answers are stored on-chain, ensuring transparency and immutability. Token rewards and fees are handled by the contract.

### Core Logic
- **Asking a Question**: Users submit a question via the UI. The dApp calls the smart contract's `askQuestion` method, which stores the question on-chain and may deduct a token fee.
- **Answering a Question**: Users can answer questions by calling the contract's `answerQuestion` method. Answers are stored on-chain, and users may earn tokens for accepted answers.
- **Wallet Connection**: The dApp uses `@multiversx/sdk-dapp` to connect to wallets, sign transactions, and fetch account data. WalletConnect v2 enables mobile and cross-platform wallet support.
- **State Management**: React context and hooks manage wallet state, questions, answers, and UI feedback.
- **Contract Interaction**: All blockchain interactions are handled through a service layer (`src/services/contractService.ts`), which abstracts contract calls and transaction logic.

### File Structure Highlights
- `src/components/`: UI components (questions, answers, wallet, layout)
- `src/pages/`: Main pages (AskQuestion, Questions, etc.)
- `src/services/contractService.ts`: Handles all contract calls
- `src/contracts/stacktoken.abi.json`: Contract ABI for encoding/decoding calls
- `src/contexts/`: React contexts for app-wide state

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [npm](https://www.npmjs.com/) or [bun](https://bun.sh/) (for dependency management)

### 1. Clone the repository
```sh
git clone https://github.com/maiconloure/stacktoken.git
cd stacktoken/dapp
```

### 2. Install dependencies
```sh
npm install
# or
bun install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env` and fill in the required values:
```sh
cp .env.example .env
```
Edit `.env` and set the correct variables as the env.example

### 4. Run the Development Server
```sh
npm run dev
```
Visit [http://localhost:5173](http://localhost:5173) in your browser.

## Building for Production
```sh
npm run build
```
The output will be in the `dist/` folder. You can preview with:
```sh
npm run preview
```

## Connecting Your Wallet
- Click the wallet connect button in the UI
- Choose your preferred wallet (web, xPortal, WalletConnect)
- Approve the connection and interact with the contract

## Contract & Blockchain
- The dApp interacts with the StackToken smart contract deployed on MultiversX
- Contract ABI is in `src/contracts/stacktoken.abi.json`
- Update the contract address in your `.env` file after deployment

## Linting & Code Quality
```sh
npm run lint
```

## License
MIT

---
Made by Maicon Souza. Powered by MultiversX.
