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

class Shyft {
  private stream: any;

  constructor(){
    this.stream = null;
  }
  public createStream = async (client:Client, args:SubscribeRequest) => {
    await client.subscribe();
    while (true) {
      try {
        await this.handleStream(client, args); // Start streaming
      } catch (error) {
        console.error("Stream error, restarting in 1 second...", error);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }
  public handleStream = async (client: Client, args: SubscribeRequest) => {
    const stream = await client.subscribe();
    console.log(typeof stream);
    const streamClosed = new Promise<void>((resolve, reject) => {
      stream.on("error", (error) => {
        console.log("ERROR", error);
        reject(error);
        stream.end();
      });
      stream.on("end", resolve);
      stream.on("close", resolve);
    });
    stream.on("data", async (data) => {
      try {
        console.log(JSON.stringify(data, null, 2));
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
    this.stream = stream;
  };
  public updateSubscription = async (args: SubscribeRequest) => {
    try {
      console.log("🔋")
      this.stream.write(args);
    } catch (error) {
      console.error("Failed to send new request:", error);
    }
  };
}

export const TESTA: SubscribeRequest = {
  slots: {},
  accounts: {},
  transactions: {
    "😹Transactions😹": {
      vote: false,
      failed: false,
      signature: undefined,
      accountInclude: ["6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P"],
      accountExclude: [],
      accountRequired: [],
    },
  },
  blocks: {},
  blocksMeta: {},
  accountsDataSlice: [],
  commitment: CommitmentLevel.PROCESSED, // Subscribe to processed blocks for the fastest updates
  entry: {},
  transactionsStatus: {},
};

export const TESTB: SubscribeRequest = {
  slots: {},
  accounts: {},
  transactions: {},
  blocks: {},
  blocksMeta: {},
  accountsDataSlice: [],
  commitment: CommitmentLevel.PROCESSED, // Subscribe to processed blocks for the fastest updates
  entry: {},
  transactionsStatus: {},
};

export const shyft = new Shyft();