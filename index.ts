import Client, {
  CommitmentLevel,
  SubscribeRequestAccountsDataSlice,
  SubscribeRequestFilterAccounts,
  SubscribeRequestFilterBlocks,
  SubscribeRequestFilterBlocksMeta,
  SubscribeRequestFilterEntry,
  SubscribeRequestFilterSlots,
  SubscribeRequestFilterTransactions,
} from "@triton-one/yellowstone-grpc";
import { SubscribeRequestPing } from "@triton-one/yellowstone-grpc/dist/grpc/geyser";
import { config } from "dotenv";

config();
if(!process.env.GRPC_URL){throw new Error("Invalid GRPC_URL error")}
if(!process.env.X_TOKEN){throw new Error("Invalid X_TOKEN error")}

interface SubscribeRequest {
  accounts: { [key: string]: SubscribeRequestFilterAccounts };
  slots: { [key: string]: SubscribeRequestFilterSlots };
  transactions: { [key: string]: SubscribeRequestFilterTransactions };
  transactionsStatus: { [key: string]: SubscribeRequestFilterTransactions };
  blocks: { [key: string]: SubscribeRequestFilterBlocks };
  blocksMeta: { [key: string]: SubscribeRequestFilterBlocksMeta };
  entry: { [key: string]: SubscribeRequestFilterEntry };
  commitment?: CommitmentLevel | undefined;
  accountsDataSlice: SubscribeRequestAccountsDataSlice[];
  ping?: SubscribeRequestPing | undefined;
}
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
  "commitment": CommitmentLevel.PROCESSED, // Subscribe to processed blocks for the fastest updates
  entry: {},
  transactionsStatus: {}
}

const subscribeRequest2: SubscribeRequest = {
  "slots": {},
  "accounts": {},
  "transactions": {},
  "blocks": {},
  "blocksMeta": {},
  "accountsDataSlice": [],
  "commitment": CommitmentLevel.PROCESSED, // Subscribe to processed blocks for the fastest updates
  entry: {},
  transactionsStatus: {}
}

async function updateSubscription(stream: any, args: SubscribeRequest) {
  try {
    // Send the updated request to the stream
    stream.write(args);
  } catch (error) {
    console.error("Failed to send new request:", error);
  }
}

async function handleStream(client: Client, args: SubscribeRequest) {
  const stream = await client.subscribe();
  console.log(stream)
  const streamClosed = new Promise<void>((resolve, reject) => {
    stream.on("error", (error) => {
      console.log("ERROR", error);
      reject(error);
      stream.end();
    });
    stream.on("end", resolve);
    stream.on("close", resolve);
  });
   // Switch to the second request after 2 seconds without closing the stream
  console.log(new Date().toLocaleString());
  await (async () => {setTimeout(async () => {
    console.log("Switched to second subscription request");
    console.log(new Date().toLocaleString())
    await updateSubscription(stream, subscribeRequest2);  // Update the subscription with the second request
    }, 5000); })();

  await (async () => {setTimeout(async () => {
    console.log("Switched to second subscription request");
    console.log("🍏",new Date().toLocaleString())
    await updateSubscription(stream, subscribeRequest);
    }, 20000); })();

  stream.on("data", async (data) => {
    try {
      console.log(data)
    } catch (error) {
      console.log(error);
    }
  });
  await new Promise<void>((resolve, reject) => {
    stream.write(args, (err: any) => (err ? reject(err) : resolve()));
  }).catch((reason) => {
    console.error(reason);
    throw reason;
  });
  await streamClosed;
}

async function subscribeCommand(client: Client, args: SubscribeRequest) {
  await client.subscribe(); 

  while (true) {
    try {
      await handleStream(client, args); // Start streaming
    } catch (error) {
      console.error("Stream error, restarting in 1 second...", error);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}

const client = new Client(
  process.env.GRPC_URL,
  process.env.X_TOKEN,
  undefined,
);


subscribeCommand(client, subscribeRequest);