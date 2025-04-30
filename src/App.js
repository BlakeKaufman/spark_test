import {
  createDummyTx,
  getLatestDepositTxId,
  SparkWallet,
} from "@buildonspark/spark-sdk";

import { ExitSpeed } from "@buildonspark/spark-sdk/types";

import { useEffect, useState } from "react";

function App() {
  const [sparkWallet, setSparkWallet] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [bitcoinAddr, setBitcoinAddr] = useState("");
  const [balance, setBalance] = useState(0);
  const [paymentResponse, setPaymentResponse] = useState(null);
  const [transfers, setTransfers] = useState([]);

  const initializeSpark = async () => {
    try {
      const { wallet } = await SparkWallet.initialize({
        mnemonicOrSeed: undefined,
        options: {
          network: "MAINNET",
        },
      });

      setSparkWallet(wallet);
      console.log("Spark client initialized successfully!");
    } catch (error) {
      console.error("Failed to initialize Spark client:", error);
    }
  };
  const getSparkBitcoinL1Address = async () => {
    try {
      if (!sparkWallet) throw new Error("sparkWallet not initialized");
      const test = sparkWallet.getSingleUseDepositAddress();
      console.log(test);
      setBitcoinAddr(test);
    } catch (err) {
      console.log("Get Bitcoin mainchain address error", err);
    }
  };
  const querySparkBitcoinL1Transaction = async (depositAddress) => {
    try {
      if (!sparkWallet) throw new Error("sparkWallet not initialized");
      console.log(depositAddress);
      const test1 = await sparkWallet.getUnusedDepositAddresses();
      console.log(new Set(test1));
      // const test2 = await hackDepositID(depositAddress);
      // console.log(test2);
      const test = await getLatestDepositTxId(depositAddress);
      console.log(test);
      return test1;
    } catch (err) {
      console.log("Get latest deposit address information error", err);
    }
  };

  const hackDepositID = async (address) => {
    const response = await fetch(
      `https://mempool.space/api/address/${address}/txs`,
      {
        "Content-Type": "application/json",
      }
    );

    const addressTxs = await response.json();

    if (addressTxs && addressTxs.length > 0) {
      const latestTx = addressTxs[0];

      const outputIndex = latestTx.vout.findIndex(
        (output) => output.scriptpubkey_address === address
      );

      if (outputIndex === -1) {
        return null;
      }

      return latestTx.txid;
    }
  };

  const claimSparkBitcoinL1Transaction = async (depositAddress) => {
    try {
      if (!sparkWallet) throw new Error("sparkWallet not initialized");

      const txId = await querySparkBitcoinL1Transaction(depositAddress);
      console.log(txId);
      return txId ? sparkWallet.claimDeposit(txId) : null;
    } catch (err) {
      console.log("Claim bitcoin mainnet payment error", err);
    }
  };
  const createInvoice = async () => {
    if (!sparkWallet) {
      console.error("Spark client not initialized");
      return;
    }
    // const invoice = await sparkWallet.getSparkAddress();
    const invoice = await sparkWallet.createLightningInvoice({
      amountSats: 100,
      memo: "hey",
    });
    console.log(invoice);

    // setInvoice(invoice.invoice.encodedInvoice);
  };
  const sendPayment = async () => {
    if (!sparkWallet) {
      console.error("Spark client not initialized");
      return;
    }
    console.log("Starting payment process");
    const fee = await sparkWallet.getLightningSendFeeEstimate({
      encodedInvoice:
        "lnbc5330n1p5py5qwpp5z498whg22gkcq35gz27v6vczr7kxcr6dgkh0utvwwa6378j322rssp52tf9rsy32gl0h4dfzf0lsm4lxv8tjf08sp668k76stfwvryd3paqxq9z0rgqnp4qvyndeaqzman7h898jxm98dzkm0mlrsx36s93smrur7h0azyyuxc5rzjq25carzepgd4vqsyn44jrk85ezrpju92xyrk9apw4cdjh6yrwt5jgqqqqrt49lmtcqqqqqqqqqqqthqq9qrzjqwghf7zxvfkxq5a6sr65g0gdkv768p83mhsnt0msszapamzx2qvuxqqqqrt49lmtcqqqqqqqqqqqthqq9qcqzpgdpq2dcxzuntyptkzmrvv46zq3r9wphhx6t59qyyssqgsmsedxep99vcg9u7tqmcp5d2ck2s05s4mxstn0j42hj5xt9d5xrf9w5s08d7qq9a7azjven7z0exew6txhqmyyhkmlqya4rg9ry7yqp62kf36",
    });

    console.log(fee);
    const response = await sparkWallet.payLightningInvoice({
      invoice:
        "lnbc5330n1p5py5qwpp5z498whg22gkcq35gz27v6vczr7kxcr6dgkh0utvwwa6378j322rssp52tf9rsy32gl0h4dfzf0lsm4lxv8tjf08sp668k76stfwvryd3paqxq9z0rgqnp4qvyndeaqzman7h898jxm98dzkm0mlrsx36s93smrur7h0azyyuxc5rzjq25carzepgd4vqsyn44jrk85ezrpju92xyrk9apw4cdjh6yrwt5jgqqqqrt49lmtcqqqqqqqqqqqthqq9qrzjqwghf7zxvfkxq5a6sr65g0gdkv768p83mhsnt0msszapamzx2qvuxqqqqrt49lmtcqqqqqqqqqqqthqq9qcqzpgdpq2dcxzuntyptkzmrvv46zq3r9wphhx6t59qyyssqgsmsedxep99vcg9u7tqmcp5d2ck2s05s4mxstn0j42hj5xt9d5xrf9w5s08d7qq9a7azjven7z0exew6txhqmyyhkmlqya4rg9ry7yqp62kf36",
    });
    console.log(response);

    setPaymentResponse(response);
  };
  const sendSparkPayment = async () => {
    if (!sparkWallet) {
      console.error("Spark client not initialized");
      return;
    }
    console.log("Starting payment process");

    const response = await sparkWallet.transfer({
      amountSats: 100,
      receiverSparkAddress:
        "sp1pgssxmwne6jf879cnreq452u24jvauzgxh62rasy6zxcwzafjua3jh4cz35ghj",
    });
    console.log(response);
  };

  const getBalance = async () => {
    if (!sparkWallet) {
      console.error("Spark client not initialized");
      return;
    }
    console.log("Gettting balance");
    const balance = await sparkWallet.getBalance();
    setBalance(Number(balance.balance));
  };
  const sendBitcoinPayment = async ({
    onchainAddress,
    exitSpeed = ExitSpeed.FAST,
    amountSats = 0,
  }) => {
    if (!sparkWallet) {
      console.error("Spark client not initialized");
      return;
    }
    console.log("SENding bitoin payment");
    const feeEstimate = await sparkWallet.getWithdrawalFeeEstimate({
      amountSats,
      withdrawalAddress: onchainAddress,
    });

    console.log(feeEstimate);
    const response = await sparkWallet.withdraw({
      onchainAddress,
      exitSpeed,
      amountSats,
    });

    console.log(response);
  };
  const getTransactions = async () => {
    if (!sparkWallet) {
      console.error("Spark client not initialized");
      return;
    }
    const transactions = await sparkWallet.getTransfers(100, 0);
    console.log(transactions);
    return;
    setTransfers(transactions);
  };

  const dummyTx = createDummyTx({
    address: "bcrt1qnuyejmm2l4kavspq0jqaw0fv07lg6zv3z9z3te",
    amountSats: 65536n,
  });

  useEffect(() => {
    if (!sparkWallet) {
      console.error("Spark client not initialized");
      return;
    }
    console.log("Loading listener");
    sparkWallet.on("transfer:claimed", (transferId, balance) => {
      console.log(`Transfer ${transferId} claimed. New balance: ${balance}`);
      getBalance();
      getTransactions();
    });
    sparkWallet.on("deposit:confirmed", (transferId, balance) => {
      console.log(`Transfer ${transferId} claimed. New balance: ${balance}`);
    });
    return () => {
      sparkWallet.off("transfer:claimed");
      sparkWallet.off("deposit:confirmed");
    };
  }, [sparkWallet]);

  return (
    <div className="App">
      <h1>Vite + React + Spark SDK</h1>
      <div className="card">
        <p>Test transaction ID</p>
        <p>{dummyTx.txid}</p>
        <button onClick={initializeSpark}>Initialize Spark Client</button>
        <p>
          {sparkWallet
            ? "Spark client is initialized!"
            : "Click the button to initialize Spark client"}
        </p>
        <button onClick={createInvoice}>Create Invoice</button>
        <p>Invoice: {invoice}</p>
        <button onClick={getSparkBitcoinL1Address}>Get Bitcoin address</button>
        <p>Bitcoin address: {bitcoinAddr}</p>
        <button
          onClick={() =>
            querySparkBitcoinL1Transaction(
              "bc1p7tmkn6u0jxsmjz2h85w0rrpjfqedzexf73las63kzdrht7hyyweqty0d9j"
            )
          }
        >
          Query address
        </button>
        <button
          onClick={() =>
            claimSparkBitcoinL1Transaction(
              "bc1p7tmkn6u0jxsmjz2h85w0rrpjfqedzexf73las63kzdrht7hyyweqty0d9j"
            )
          }
        >
          Claim Bitcoin address
        </button>
        <button
          onClick={() =>
            sendBitcoinPayment({
              amountSats: 2000,
              onchainAddress:
                "bc1qv8vj9muuyv3zqnsf9mycvgu2jgeuw2qk6jdssk2cp9q5mdn2ayas6xjj7d",
            })
          }
        >
          Send Bitcoin l1
        </button>

        <button onClick={sendPayment}>Send payment</button>
        <p>Pay invoice: {JSON.stringify(paymentResponse)}</p>
        <button onClick={sendSparkPayment}>Send spark payment</button>
        <button onClick={getBalance}>Get Balance</button>
        <p>Balance: {balance}</p>
        <button onClick={getTransactions}>Get Transactions</button>
        {transfers.map((tx) => {
          console.log(tx);
          return <div></div>;
        })}
      </div>
    </div>
  );
}

export default App;
