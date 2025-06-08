# StackToken Smart Contract

This folder contains the core smart contract logic for the StackToken decentralized Q&A platform, designed for deployment on the MultiversX blockchain.

## Architecture Overview

- **Language**: Rust (using the MultiversX smart contract framework)
- **Structure**:
  - `src/stacktoken.rs`: Main contract logic (questions, answers, token logic)
  - `src/stacktoken_proxy.rs`: Proxy interface for contract interaction
  - `output/`: Compiled contract artifacts (WASM, ABI, etc.)
  - `interactor/`: Rust CLI for interacting with the contract (testing, admin, automation)
  - `meta/`: Metadata and deployment helpers
  - `tests/`: Rust-based contract tests

## Technologies Used

- **MultiversX Rust Framework**: For writing and compiling smart contracts
- **WASM**: Contract is compiled to WebAssembly for blockchain deployment
- **Rust**: All contract and interactor logic is written in Rust
- **Cargo**: Rust's package manager and build tool

## How the Contract Works

### Core Concepts
- **Questions**: Users can post questions on-chain. Each question is stored with metadata (author, timestamp, etc.).
- **Answers**: Users can answer questions. Answers are linked to questions and also stored on-chain.
- **StackToken**: The contract manages a custom token used for rewarding participation and paying fees.
- **Rewards & Fees**: Asking or answering may require a fee (in StackToken), and accepted answers can earn rewards.

### Main Contract Logic (`src/stacktoken.rs`)
- **Storage**: Uses Rust structs and MultiversX storage mappers to persist questions, answers, and balances.
- **Entry Points**:
  - `ask_question`: Allows a user to post a question (may require a fee)
  - `answer_question`: Allows a user to answer a question
  - `accept_answer`: Question author can accept an answer, triggering a reward
  - `get_questions` / `get_answers`: Query functions for reading on-chain data
- **Token Logic**: Implements basic token minting, transfer, and balance tracking for StackToken
- **Access Control**: Only the question author can accept answers; only contract owner can mint tokens

### Proxy & Interactor
- **Proxy (`src/stacktoken_proxy.rs`)**: Provides a typed interface for dApp/frontend or CLI tools to interact with the contract
- **Interactor (`interactor/`)**: CLI tool for contract management, testing, and automation (e.g., batch operations, admin tasks)

### Artifacts
- **WASM**: The compiled contract (`output/stacktoken.wasm`) is deployed to MultiversX
- **ABI**: The contract ABI (`output/stacktoken.abi.json`) is used by the dApp and tools to encode/decode contract calls

## Development & Testing

- **Build Contract**:
  ```sh
  sc-meta all build
  ```

- **Generate Proxy**:
  ```sh
  sc-meta all proxy
  ```

- **Generate Snippets**:
  ```sh
  sc-meta all snippets
  ```

- **Run Tests**:
  ```sh
  sc-meta test
  ```
- **Deploy Contract**:
  Use the MultiversX CLI or web IDE to deploy the WASM artifact to devnet/testnet/mainnet.

- **Interactor Usage**:
  The `interactor/` CLI can be used for local testing, contract calls, and admin actions. See its README or run with `--help` for options.

## File Structure

- `src/stacktoken.rs` — Main contract logic
- `src/stacktoken_proxy.rs` — Proxy interface
- `output/` — Compiled artifacts (WASM, ABI, etc.)
- `interactor/` — CLI for contract interaction
- `meta/` — Metadata and deployment helpers
- `tests/` — Rust-based contract tests

## Security & Best Practices
- All state-changing functions require proper authorization (e.g., only question author can accept answers)
- Token logic follows MultiversX standards for safety
- All on-chain data is validated and sanitized

---
For more details, see the code in `src/stacktoken.rs` and the contract ABI in `output/stacktoken.abi.json`.
