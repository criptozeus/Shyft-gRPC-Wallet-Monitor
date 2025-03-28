import Client from "@triton-one/yellowstone-grpc";
import { config } from "dotenv";
import { shyft, TESTA, TESTB } from "Shyft";

config();
if (!process.env.GRPC_URL) {
  throw new Error("Invalid GRPC_URL error");
}
if (!process.env.X_TOKEN) {
  throw new Error("Invalid X_TOKEN error");
}

(async () => {
  const client = new Client(process.env.GRPC_URL, process.env.X_TOKEN, undefined);
  shyft.createStream(client, TESTA);
  await sleep(5000);
  shyft.updateSubscription(TESTB);
  await sleep(5000);
  shyft.updateSubscription(TESTA);
})();


function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}