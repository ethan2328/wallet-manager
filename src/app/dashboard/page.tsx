"use client";

import { set } from "mongoose";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [balance, setBalance] = useState(0);

  const [amount, setAmount] = useState("");
  const [transferEmail, setTransferEmail] = useState("");
  const [transferAmount, setTransferAmount] = useState("");

  const [transactions, setTransactions] = useState<any[]>([]);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // ======================
  // FETCH DATA
  // ======================
  const fetchBalance = async () => {
    const res = await fetch("/api/wallet/balance");
    const data = await res.json();
    setBalance(data.balance);
  };

  const fetchTransactions = async () => {
    const res = await fetch("/api/wallet/transactions");
    const data = await res.json();
    setTransactions(data);
  };

  useEffect(() => {
    fetchBalance();
    fetchTransactions();
  }, []);

  // ======================
  // DEPOSIT
  // ======================
  const handleDeposit = async () => {
    const value = Number(amount);

    if (!value || value <= 0) {
      setError("Invalid amount");
      return;
    }

    setError("");
    setMessage("");

    const res = await fetch("/api/wallet/deposit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount: value }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.message);
      return;
    }

    setMessage("Deposit successful");
    setAmount("");

    fetchBalance();
    fetchTransactions();
  };

  // ======================
  // WITHDRAW
  // ======================
  const handleWithdraw = async () => {
    const value = Number(amount);

    if (!value || value <= 0) {
      setError("Invalid amount");
      return;
    }

    setError("");
    setMessage("");

    const res = await fetch("/api/wallet/withdraw", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount: value }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.message);
      return;
    }

    setMessage("Withdraw successful");
    setAmount("");

    fetchBalance();
    fetchTransactions();
  };

  // ======================
  // TRANSFER
  // ======================
  const handleTransfer = async () => {
    const value = Number(transferAmount);

    if (!transferEmail || !transferAmount || isNaN(value) || value <= 0) {
      setError("Invalid input");
      return;
    }

    try {
      const res = await fetch("/api/wallet/transfer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: transferEmail,
          amount: value, // ✅ FIXED (IMPORTANT)
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message);
        return;
      }

      setMessage("Transfer successful");
      setError("");

      setTransferAmount("");
      setTransferEmail("");

      fetchBalance();
      fetchTransactions();
    } catch (error) {
      setError("Network error");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Welcome to our site</h1>

      <h2>Balance: ${balance}</h2>

      {/* Messages */}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {message && <p style={{ color: "green" }}>{message}</p>}

      {/* Deposit / Withdraw */}
      <div>
        <input
          type="number"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <button onClick={handleDeposit}>Deposit</button>
        <button onClick={handleWithdraw}>Withdraw</button>
      </div>

      {/* Transfer */}
      <div style={{ marginTop: 20 }}>
        <input
          type="email"
          placeholder="Receiver email"
          value={transferEmail}
          onChange={(e) => setTransferEmail(e.target.value)}
        />
        <input
          type="number"
          placeholder="Transfer amount"
          value={transferAmount}
          onChange={(e) => setTransferAmount(e.target.value)}
        />
        <button onClick={handleTransfer}>Send</button>
      </div>

      {/* Transactions */}
      <h3>Transactions</h3>
      <ul>
        {transactions.map((t, index) => (
          <li key={index}>
            <strong>{t.type}</strong> - ${t.amount}
            <br />
            <small>{new Date(t.createdAt).toLocaleString()}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}