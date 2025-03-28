## Shyft-gRPC-Wallet-Monitor

### How to use this repo
Download 
```bash
git clone https://github.com/criptozeus/Shyft-gRPC-Wallet-Monitor.git
```
Configuration .env File
```
GRPC_URL = 
X_TOKEN = 
```
Install and Run
```cmd
cd Shyft-gRPC-Wallet-Monitor
npm install
npm run dev
```
Example
```ts
let wallets: string[] = [
  "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P",
];

const subscribeRequest: SubscribeRequest = {
  "slots": {},
  "accounts": {},
  "transactions": {
    "😹Transactions😹": {
      vote: false,
      failed: false,
      signature: undefined,
      accountInclude: wallets, 
      accountExclude: [],
      accountRequired: [],
    },
  },
  "blocks": {},
  "blocksMeta": {},
  "accountsDataSlice": [],
  "commitment": CommitmentLevel.PROCESSED,
  entry: {},
  transactionsStatus: {}
}
// You can add any solana wallet addresses to track its transcations
```