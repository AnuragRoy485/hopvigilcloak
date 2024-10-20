document.getElementById("analyzeButton").addEventListener("click", async () => {
  const walletAddress = document.getElementById("walletInput").value.trim();
  if (!walletAddress) {
    alert("Please enter a wallet address.");
    return;
  }
  document.getElementById("results").innerHTML = "<p>Fetching data...</p>";

  try {
    const transactions = await fetchTransactions(walletAddress);
    if (!transactions || transactions.length === 0) {
      document.getElementById("results").innerHTML =
        "<p>No transactions found.</p>";
      return;
    }
    displayTransactions(transactions);
  } catch (error) {
    document.getElementById(
      "results"
    ).innerHTML = `<p>Error: ${error.message}</p>`;
  }
});

async function fetchTransactions(wallet) {
  const network = wallet.startsWith("0x") ? "eth/main" : "btc/main";
  const url = `https://api.blockcypher.com/v1/${network}/addrs/${wallet}/full`;

  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch transactions");

  const data = await response.json();
  return data.txs || []; // Ensure an empty array if no transactions are found
}

function displayTransactions(transactions) {
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";

  transactions.slice(0, 10).forEach((tx, index) => {
    const txDiv = document.createElement("div");
    txDiv.classList.add("result-item");

    const inputs = tx.inputs || [];
    const outputs = tx.outputs || [];

    let amountTransferred = 0;
    let currency = "";

    // Determine if it's a Bitcoin or Ethereum transaction
    if (inputs.length > 0 && inputs[0].addresses) {
      // For Bitcoin, sum the values of outputs
      amountTransferred = outputs.reduce(
        (total, output) => total + output.value,
        0
      );
      currency = "BTC"; // Set currency for Bitcoin
      amountTransferred = (amountTransferred / 1e8).toFixed(8); // Convert satoshis to BTC
    } else {
      // For Ethereum, use the value directly from the transaction
      amountTransferred = tx.value ? (tx.value / 1e18).toFixed(6) : "0.000000"; // Convert Wei to ETH
      currency = "ETH"; // Set currency for Ethereum
    }

    // Ensure to show the correct currency for each transaction
    txDiv.innerHTML = `
            <h3>Hop ${index + 1}</h3>
            <p><strong>Transaction Hash:</strong> ${tx.hash || "N/A"}</p>
            <p><strong>Date:</strong> ${
              new Date(tx.received || Date.now()).toLocaleString() || "Unknown"
            }</p>
            <p><strong>Amount Transferred:</strong> ${amountTransferred} ${currency}</p>
            <p><strong>Sender (From):</strong> ${
              (inputs[0]?.addresses || ["Unknown"])[0]
            }</p>
            <p><strong>Receiver (To):</strong> ${
              (outputs[0]?.addresses || ["Unknown"])[0]
            }</p>
        `;
    resultsDiv.appendChild(txDiv);
  });
}
