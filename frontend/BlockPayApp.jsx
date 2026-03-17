import { useState, useEffect } from "react";

// ─── Mock Data ───────────────────────────────────────────
const mockUser = {
  name: "Arjun Sharma",
  username: "arjun_s",
  phone: "+91 98765 43210",
  walletAddress: "0x742d35Cc6634C0532925a3b8D4C9E...",
  upiId: "arjun_s@blockpay",
  avatar: "AS",
};

const mockWallet = { balance: 24850.75, cryptoBalance: "0.0994 MATIC" };

const mockTransactions = [
  { id: 1, type: "send", name: "Priya Mehta", amount: -1500, time: "2 min ago", hash: "0x4a3b...", icon: "↗", status: "confirmed", category: "Transfer" },
  { id: 2, type: "receive", name: "Rahul Kumar", amount: +5000, time: "1 hr ago", hash: "0x9d2e...", icon: "↙", status: "confirmed", category: "Transfer" },
  { id: 3, type: "bill", name: "Electricity Bill", amount: -2340, time: "3 hr ago", hash: "0x7f1a...", icon: "⚡", status: "confirmed", category: "BESCOM" },
  { id: 4, type: "recharge", name: "Jio Recharge", amount: -299, time: "Yesterday", hash: "0x2c8b...", icon: "📱", status: "confirmed", category: "Mobile" },
  { id: 5, type: "receive", name: "Sneha Patel", amount: +800, time: "Yesterday", hash: "0x5e4d...", icon: "↙", status: "pending", category: "Transfer" },
  { id: 6, type: "bill", name: "ACT Fibernet", amount: -799, time: "2 days ago", hash: "0x1a9f...", icon: "🌐", status: "confirmed", category: "Internet" },
];

const quickActions = [
  { id: "send", label: "Send", icon: "↗", color: "#6C63FF" },
  { id: "receive", label: "Receive", icon: "↙", color: "#00C896" },
  { id: "scan", label: "Scan", icon: "⬛", color: "#FF6B6B" },
  { id: "history", label: "History", icon: "⊟", color: "#FFB347" },
];

const billTypes = [
  { id: "electric", label: "Electricity", icon: "⚡", color: "#FFD700" },
  { id: "mobile", label: "Mobile", icon: "📱", color: "#00C896" },
  { id: "internet", label: "Internet", icon: "🌐", color: "#6C63FF" },
  { id: "dth", label: "DTH", icon: "📺", color: "#FF6B6B" },
  { id: "gas", label: "Gas", icon: "🔥", color: "#FF8C42" },
  { id: "water", label: "Water", icon: "💧", color: "#4FC3F7" },
];

// ─── Reusable Components ──────────────────────────────────

const StatusBadge = ({ status }) => (
  <span style={{
    fontSize: "10px",
    fontWeight: 700,
    padding: "2px 7px",
    borderRadius: "10px",
    letterSpacing: "0.5px",
    background: status === "confirmed" ? "rgba(0,200,150,0.15)" : "rgba(255,179,71,0.15)",
    color: status === "confirmed" ? "#00C896" : "#FFB347",
    border: `1px solid ${status === "confirmed" ? "rgba(0,200,150,0.3)" : "rgba(255,179,71,0.3)"}`,
  }}>
    {status === "confirmed" ? "✓ On-Chain" : "⏳ Pending"}
  </span>
);

// ─── SCREENS ─────────────────────────────────────────────

function HomeScreen({ onNav }) {
  const [balanceVisible, setBalanceVisible] = useState(true);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0", height: "100%", overflowY: "auto" }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #1a0533 0%, #2d0f4e 50%, #1a1a4e 100%)",
        padding: "20px 20px 0",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -40, right: -30, width: 120, height: 120, borderRadius: "50%", background: "rgba(108,99,255,0.15)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 10, right: 60, width: 60, height: 60, borderRadius: "50%", background: "rgba(0,200,150,0.1)", pointerEvents: "none" }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px", margin: 0, fontFamily: "'Courier New', monospace" }}>GOOD MORNING</p>
            <h2 style={{ color: "#fff", fontSize: "20px", margin: "2px 0 0", fontWeight: 700, letterSpacing: "-0.5px" }}>{mockUser.name.split(" ")[0]} 👋</h2>
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <button style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "50%", width: 36, height: 36, color: "#fff", fontSize: "16px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>🔔</button>
            <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg, #6C63FF, #00C896)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "#fff", fontSize: "14px", border: "2px solid rgba(255,255,255,0.2)" }}>
              {mockUser.avatar}
            </div>
          </div>
        </div>

        {/* Wallet Card */}
        <div style={{
          background: "linear-gradient(135deg, rgba(108,99,255,0.3) 0%, rgba(0,200,150,0.2) 100%)",
          borderRadius: "20px 20px 0 0",
          padding: "20px",
          border: "1px solid rgba(255,255,255,0.1)",
          borderBottom: "none",
          backdropFilter: "blur(10px)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "11px", margin: "0 0 6px", letterSpacing: "1px", textTransform: "uppercase", fontFamily: "'Courier New', monospace" }}>Total Balance</p>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <h1 style={{ color: "#fff", fontSize: "32px", margin: 0, fontWeight: 800, letterSpacing: "-1px" }}>
                  {balanceVisible ? `₹${mockWallet.balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}` : "₹ ••••••"}
                </h1>
                <button onClick={() => setBalanceVisible(!balanceVisible)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: "16px", padding: 0 }}>
                  {balanceVisible ? "👁" : "🚫"}
                </button>
              </div>
              <p style={{ color: "rgba(0,200,150,0.8)", fontSize: "12px", margin: "6px 0 0", fontFamily: "'Courier New', monospace" }}>
                ≈ {mockWallet.cryptoBalance}
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "10px", margin: "0 0 4px", fontFamily: "'Courier New', monospace" }}>BLOCKCHAIN</p>
              <div style={{ background: "rgba(0,200,150,0.2)", borderRadius: "8px", padding: "4px 8px", border: "1px solid rgba(0,200,150,0.3)" }}>
                <span style={{ color: "#00C896", fontSize: "10px", fontWeight: 700, fontFamily: "'Courier New', monospace" }}>⬡ POLYGON</span>
              </div>
            </div>
          </div>

          {/* UPI ID */}
          <div style={{ marginTop: "14px", background: "rgba(0,0,0,0.2)", borderRadius: "10px", padding: "8px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "11px", fontFamily: "'Courier New', monospace" }}>{mockUser.upiId}</span>
            <button style={{ background: "none", border: "none", color: "#6C63FF", fontSize: "11px", cursor: "pointer", fontWeight: 600 }}>COPY</button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ padding: "16px 20px", background: "#0d0d1a" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
          {quickActions.map((action) => (
            <button key={action.id} onClick={() => onNav(action.id)} style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: "8px",
              background: "transparent", border: "none", cursor: "pointer", padding: "10px 0",
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: "16px",
                background: `linear-gradient(135deg, ${action.color}22, ${action.color}11)`,
                border: `1px solid ${action.color}44`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "20px", transition: "transform 0.2s",
              }}>
                <span style={{ fontSize: action.id === "scan" ? "18px" : "20px" }}>{action.icon}</span>
              </div>
              <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "11px", fontWeight: 600, letterSpacing: "0.3px" }}>{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Bills Section */}
      <div style={{ padding: "0 20px 16px", background: "#0d0d1a" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <h3 style={{ color: "#fff", fontSize: "15px", margin: 0, fontWeight: 700 }}>Pay Bills</h3>
          <button onClick={() => onNav("bills")} style={{ background: "none", border: "none", color: "#6C63FF", fontSize: "12px", cursor: "pointer", fontWeight: 600 }}>SEE ALL</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
          {billTypes.slice(0, 6).map((bill) => (
            <button key={bill.id} onClick={() => onNav("bills")} style={{
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "14px", padding: "12px 8px", cursor: "pointer",
              display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", transition: "all 0.2s",
            }}>
              <span style={{ fontSize: "22px" }}>{bill.icon}</span>
              <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "11px", fontWeight: 600 }}>{bill.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div style={{ padding: "0 20px 100px", background: "#0d0d1a" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <h3 style={{ color: "#fff", fontSize: "15px", margin: 0, fontWeight: 700 }}>Recent Activity</h3>
          <button onClick={() => onNav("history")} style={{ background: "none", border: "none", color: "#6C63FF", fontSize: "12px", cursor: "pointer", fontWeight: 600 }}>SEE ALL</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {mockTransactions.slice(0, 4).map((tx) => (
            <TxRow key={tx.id} tx={tx} />
          ))}
        </div>
      </div>
    </div>
  );
}

function TxRow({ tx, showHash = false }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.04)", borderRadius: "14px", padding: "12px 14px",
      display: "flex", alignItems: "center", gap: "12px",
      border: "1px solid rgba(255,255,255,0.06)",
    }}>
      <div style={{
        width: 42, height: 42, borderRadius: "12px", flexShrink: 0,
        background: tx.type === "receive" ? "rgba(0,200,150,0.15)" : tx.type === "send" ? "rgba(108,99,255,0.15)" : "rgba(255,179,71,0.15)",
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px",
        border: `1px solid ${tx.type === "receive" ? "rgba(0,200,150,0.25)" : tx.type === "send" ? "rgba(108,99,255,0.25)" : "rgba(255,179,71,0.25)"}`,
      }}>
        {tx.icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ color: "#fff", fontSize: "13px", margin: "0 0 2px", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tx.name}</p>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "11px", margin: 0, fontFamily: "'Courier New', monospace" }}>{tx.hash}•</p>
          <StatusBadge status={tx.status} />
        </div>
        {showHash && <p style={{ color: "rgba(108,99,255,0.7)", fontSize: "10px", margin: "3px 0 0", fontFamily: "'Courier New', monospace" }}>{tx.time}</p>}
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <p style={{ color: tx.amount > 0 ? "#00C896" : "#fff", fontSize: "14px", margin: "0 0 2px", fontWeight: 700 }}>
          {tx.amount > 0 ? "+" : ""}₹{Math.abs(tx.amount).toLocaleString("en-IN")}
        </p>
        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "10px", margin: 0 }}>{tx.time}</p>
      </div>
    </div>
  );
}

function SendScreen({ onBack }) {
  const [step, setStep] = useState(1);
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [pin, setPin] = useState("");
  const [sending, setSending] = useState(false);
  const [txHash, setTxHash] = useState("");

  const quickAmounts = [500, 1000, 2000, 5000];

  const handleSend = async () => {
    setSending(true);
    await new Promise((r) => setTimeout(r, 2500));
    setTxHash("0x" + Math.random().toString(16).substr(2, 40));
    setSending(false);
    setStep(4);
  };

  if (step === 4) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", padding: "30px", textAlign: "center", background: "#0d0d1a" }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(0,200,150,0.15)", border: "2px solid #00C896", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "36px", marginBottom: "20px", animation: "pulse 2s infinite" }}>✓</div>
        <h2 style={{ color: "#fff", fontSize: "22px", fontWeight: 800, margin: "0 0 8px" }}>Money Sent!</h2>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px", margin: "0 0 24px" }}>₹{parseInt(amount).toLocaleString("en-IN")} sent to {recipient}</p>
        <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: "14px", padding: "16px", width: "100%", border: "1px solid rgba(255,255,255,0.08)", marginBottom: "24px" }}>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "1px" }}>Blockchain TX Hash</p>
          <p style={{ color: "#6C63FF", fontSize: "11px", margin: 0, fontFamily: "'Courier New', monospace", wordBreak: "break-all" }}>{txHash}</p>
          <div style={{ marginTop: "10px", padding: "6px", background: "rgba(0,200,150,0.1)", borderRadius: "8px" }}>
            <span style={{ color: "#00C896", fontSize: "11px", fontWeight: 700 }}>⬡ Recorded on Polygon Network</span>
          </div>
        </div>
        <button onClick={onBack} style={{ background: "linear-gradient(135deg, #6C63FF, #00C896)", border: "none", borderRadius: "14px", padding: "14px 40px", color: "#fff", fontSize: "15px", fontWeight: 700, cursor: "pointer", width: "100%" }}>Done</button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#0d0d1a" }}>
      <div style={{ padding: "20px 20px 16px", background: "linear-gradient(135deg, #1a0533, #1a1a4e)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button onClick={onBack} style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: "10px", width: 36, height: 36, color: "#fff", cursor: "pointer", fontSize: "18px" }}>←</button>
          <h2 style={{ color: "#fff", fontSize: "18px", fontWeight: 700, margin: 0 }}>Send Money</h2>
        </div>
        {/* Progress */}
        <div style={{ display: "flex", gap: "6px", marginTop: "16px" }}>
          {[1, 2, 3].map((s) => (
            <div key={s} style={{ flex: 1, height: 3, borderRadius: 2, background: step >= s ? "linear-gradient(90deg, #6C63FF, #00C896)" : "rgba(255,255,255,0.1)", transition: "all 0.3s" }} />
          ))}
        </div>
      </div>

      <div style={{ flex: 1, padding: "24px 20px", overflowY: "auto" }}>
        {step === 1 && (
          <div>
            <h3 style={{ color: "#fff", fontSize: "16px", fontWeight: 700, margin: "0 0 20px" }}>Who to send?</h3>
            <div style={{ position: "relative", marginBottom: "20px" }}>
              <input
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="Phone, username or wallet address"
                style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "14px", padding: "14px 16px", color: "#fff", fontSize: "14px", boxSizing: "border-box", outline: "none" }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {["priya_m", "rahul_k", "sneha_p"].map((u) => (
                <button key={u} onClick={() => setRecipient(u)} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "12px 14px", display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #6C63FF, #00C896)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "13px" }}>{u[0].toUpperCase()}</div>
                  <div style={{ textAlign: "left" }}>
                    <p style={{ color: "#fff", fontSize: "13px", margin: 0, fontWeight: 600 }}>{u}</p>
                    <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", margin: 0 }}>{u}@blockpay</p>
                  </div>
                </button>
              ))}
            </div>
            <button onClick={() => recipient && setStep(2)} disabled={!recipient} style={{ marginTop: "24px", width: "100%", background: recipient ? "linear-gradient(135deg, #6C63FF, #00C896)" : "rgba(255,255,255,0.1)", border: "none", borderRadius: "14px", padding: "15px", color: "#fff", fontSize: "15px", fontWeight: 700, cursor: recipient ? "pointer" : "not-allowed" }}>Continue →</button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h3 style={{ color: "#fff", fontSize: "16px", fontWeight: 700, margin: "0 0 8px" }}>How much?</h3>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px", margin: "0 0 24px" }}>Sending to <span style={{ color: "#6C63FF" }}>{recipient}</span></p>
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "28px", fontWeight: 300 }}>₹</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  style={{ background: "none", border: "none", color: "#fff", fontSize: "48px", fontWeight: 800, width: "160px", outline: "none", textAlign: "center", letterSpacing: "-2px" }}
                />
              </div>
              <div style={{ width: "60%", margin: "0 auto", height: "1px", background: "rgba(255,255,255,0.15)" }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", marginBottom: "24px" }}>
              {quickAmounts.map((a) => (
                <button key={a} onClick={() => setAmount(a.toString())} style={{ background: amount == a ? "rgba(108,99,255,0.3)" : "rgba(255,255,255,0.05)", border: `1px solid ${amount == a ? "#6C63FF" : "rgba(255,255,255,0.1)"}`, borderRadius: "10px", padding: "10px 6px", color: "#fff", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
                  ₹{a}
                </button>
              ))}
            </div>
            <button onClick={() => amount > 0 && setStep(3)} disabled={!amount || amount <= 0} style={{ width: "100%", background: amount > 0 ? "linear-gradient(135deg, #6C63FF, #00C896)" : "rgba(255,255,255,0.1)", border: "none", borderRadius: "14px", padding: "15px", color: "#fff", fontSize: "15px", fontWeight: 700, cursor: amount > 0 ? "pointer" : "not-allowed" }}>Continue →</button>
          </div>
        )}

        {step === 3 && (
          <div>
            <h3 style={{ color: "#fff", fontSize: "16px", fontWeight: 700, margin: "0 0 20px" }}>Confirm & Pay</h3>
            <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: "16px", padding: "20px", border: "1px solid rgba(255,255,255,0.08)", marginBottom: "20px" }}>
              {[["To", recipient], ["Amount", `₹${parseInt(amount).toLocaleString("en-IN")}`], ["Network Fee", `₹${(amount * 0.001).toFixed(2)}`], ["You Pay", `₹${(amount * 1.001).toFixed(2)}`]].map(([k, v], i) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: i < 3 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
                  <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px" }}>{k}</span>
                  <span style={{ color: i === 3 ? "#6C63FF" : "#fff", fontSize: "13px", fontWeight: i === 3 ? 700 : 400 }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ background: "rgba(0,200,150,0.08)", borderRadius: "12px", padding: "12px 14px", border: "1px solid rgba(0,200,150,0.2)", marginBottom: "20px" }}>
              <p style={{ color: "#00C896", fontSize: "11px", margin: 0, fontWeight: 600 }}>⬡ Transaction will be recorded on Polygon Blockchain</p>
            </div>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px", marginBottom: "12px" }}>Enter your 4-digit PIN</p>
            <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginBottom: "24px" }}>
              {[0, 1, 2, 3].map((i) => (
                <div key={i} style={{ width: 44, height: 44, borderRadius: "12px", background: "rgba(255,255,255,0.06)", border: `1px solid ${pin.length > i ? "#6C63FF" : "rgba(255,255,255,0.1)"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {pin.length > i && <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#6C63FF" }} />}
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "24px" }}>
              {["1","2","3","4","5","6","7","8","9","","0","⌫"].map((k) => (
                <button key={k} onClick={() => {
                  if (k === "⌫") setPin(p => p.slice(0, -1));
                  else if (k && pin.length < 4) setPin(p => p + k);
                }} style={{ background: k ? "rgba(255,255,255,0.06)" : "transparent", border: k ? "1px solid rgba(255,255,255,0.1)" : "none", borderRadius: "12px", padding: "14px", color: "#fff", fontSize: "18px", fontWeight: 600, cursor: k ? "pointer" : "default" }}>
                  {k}
                </button>
              ))}
            </div>
            <button onClick={handleSend} disabled={pin.length < 4 || sending} style={{ width: "100%", background: pin.length === 4 && !sending ? "linear-gradient(135deg, #6C63FF, #00C896)" : "rgba(255,255,255,0.1)", border: "none", borderRadius: "14px", padding: "15px", color: "#fff", fontSize: "15px", fontWeight: 700, cursor: pin.length === 4 && !sending ? "pointer" : "not-allowed" }}>
              {sending ? "⏳ Recording on Blockchain..." : "Send Now →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function HistoryScreen({ onBack }) {
  const [filter, setFilter] = useState("all");
  const filters = ["all", "send", "receive", "bill"];
  const filtered = filter === "all" ? mockTransactions : mockTransactions.filter(t => t.type === filter || (filter === "bill" && (t.type === "bill" || t.type === "recharge")));

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#0d0d1a" }}>
      <div style={{ padding: "20px 20px 16px", background: "linear-gradient(135deg, #1a0533, #1a1a4e)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
          <button onClick={onBack} style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: "10px", width: 36, height: 36, color: "#fff", cursor: "pointer", fontSize: "18px" }}>←</button>
          <h2 style={{ color: "#fff", fontSize: "18px", fontWeight: 700, margin: 0 }}>Transaction History</h2>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          {filters.map((f) => (
            <button key={f} onClick={() => setFilter(f)} style={{ background: filter === f ? "rgba(108,99,255,0.3)" : "rgba(255,255,255,0.06)", border: `1px solid ${filter === f ? "#6C63FF" : "rgba(255,255,255,0.1)"}`, borderRadius: "20px", padding: "6px 14px", color: filter === f ? "#6C63FF" : "rgba(255,255,255,0.5)", fontSize: "12px", fontWeight: 600, cursor: "pointer", textTransform: "capitalize" }}>
              {f}
            </button>
          ))}
        </div>
      </div>
      <div style={{ flex: 1, padding: "16px 20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px" }}>
        {filtered.map((tx) => <TxRow key={tx.id} tx={tx} showHash />)}
      </div>
    </div>
  );
}

function ScanScreen({ onBack }) {
  const [scanning, setScanning] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setScanning(false), 3000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#0d0d1a" }}>
      <div style={{ padding: "20px", background: "linear-gradient(135deg, #1a0533, #1a1a4e)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button onClick={onBack} style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: "10px", width: 36, height: 36, color: "#fff", cursor: "pointer", fontSize: "18px" }}>←</button>
          <h2 style={{ color: "#fff", fontSize: "18px", fontWeight: 700, margin: 0 }}>Scan & Pay</h2>
        </div>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "30px 20px" }}>
        <div style={{ position: "relative", marginBottom: "30px" }}>
          <div style={{ width: 220, height: 220, borderRadius: "20px", background: "rgba(255,255,255,0.04)", border: "2px solid rgba(108,99,255,0.4)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
            {scanning ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "100%", height: 2, background: "linear-gradient(90deg, transparent, #6C63FF, transparent)", animation: "scan 1.5s linear infinite", position: "absolute" }} />
                <span style={{ fontSize: "48px" }}>📷</span>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px", margin: 0 }}>Scanning...</p>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "20px" }}>
                <span style={{ fontSize: "36px", display: "block", marginBottom: "10px" }}>✅</span>
                <p style={{ color: "#00C896", fontSize: "13px", fontWeight: 700, margin: 0 }}>QR Detected!</p>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", margin: "6px 0 0" }}>priya_m@blockpay</p>
              </div>
            )}
          </div>
          {["tl", "tr", "bl", "br"].map((pos) => (
            <div key={pos} style={{ position: "absolute", width: 20, height: 20, border: "3px solid #6C63FF", ...(pos.includes("t") ? { top: -2 } : { bottom: -2 }), ...(pos.includes("l") ? { left: -2, borderRight: "none", borderBottom: pos.includes("t") ? "none" : undefined, borderTop: pos.includes("b") ? "none" : undefined } : { right: -2, borderLeft: "none", borderBottom: pos.includes("t") ? "none" : undefined, borderTop: pos.includes("b") ? "none" : undefined }) }} />
          ))}
        </div>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px", textAlign: "center", margin: "0 0 30px", lineHeight: 1.6 }}>Point camera at a BlockPay QR code to send money instantly</p>
        <div style={{ width: "100%", background: "rgba(255,255,255,0.04)", borderRadius: "16px", padding: "20px", border: "1px solid rgba(255,255,255,0.08)" }}>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 12px" }}>Your QR Code</p>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ width: 70, height: 70, background: "#fff", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px" }}>⬛</div>
            <div>
              <p style={{ color: "#fff", fontSize: "14px", fontWeight: 600, margin: "0 0 4px" }}>{mockUser.name}</p>
              <p style={{ color: "#6C63FF", fontSize: "12px", margin: "0 0 4px" }}>{mockUser.upiId}</p>
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "11px", margin: 0, fontFamily: "'Courier New', monospace" }}>{mockUser.walletAddress.slice(0, 20)}...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileScreen({ onBack }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#0d0d1a" }}>
      <div style={{ padding: "20px", background: "linear-gradient(135deg, #1a0533, #1a1a4e)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
          <button onClick={onBack} style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: "10px", width: 36, height: 36, color: "#fff", cursor: "pointer", fontSize: "18px" }}>←</button>
          <h2 style={{ color: "#fff", fontSize: "18px", fontWeight: 700, margin: 0 }}>Profile</h2>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ width: 64, height: 64, borderRadius: "20px", background: "linear-gradient(135deg, #6C63FF, #00C896)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "#fff", fontSize: "22px", border: "2px solid rgba(255,255,255,0.2)" }}>{mockUser.avatar}</div>
          <div>
            <h3 style={{ color: "#fff", fontSize: "18px", margin: "0 0 4px", fontWeight: 700 }}>{mockUser.name}</h3>
            <p style={{ color: "#6C63FF", fontSize: "13px", margin: "0 0 2px" }}>@{mockUser.username}</p>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px", margin: 0 }}>{mockUser.phone}</p>
          </div>
        </div>
      </div>
      <div style={{ flex: 1, padding: "20px", overflowY: "auto" }}>
        <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.08)", marginBottom: "16px", overflow: "hidden" }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 6px" }}>Blockchain Wallet</p>
            <p style={{ color: "#6C63FF", fontSize: "12px", margin: 0, fontFamily: "'Courier New', monospace", wordBreak: "break-all" }}>{mockUser.walletAddress}</p>
          </div>
          <div style={{ padding: "14px 16px" }}>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 6px" }}>UPI ID</p>
            <p style={{ color: "#fff", fontSize: "13px", margin: 0 }}>{mockUser.upiId}</p>
          </div>
        </div>
        {[["KYC Status", "✓ Verified", "#00C896"], ["Biometric Auth", "Enabled", "#00C896"], ["Daily Limit", "₹50,000", "#fff"], ["Security Level", "High 🔐", "#fff"]].map(([label, val, color]) => (
          <div key={label} style={{ background: "rgba(255,255,255,0.04)", borderRadius: "12px", padding: "14px 16px", marginBottom: "8px", display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid rgba(255,255,255,0.06)" }}>
            <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px" }}>{label}</span>
            <span style={{ color, fontSize: "13px", fontWeight: 600 }}>{val}</span>
          </div>
        ))}
        <button style={{ width: "100%", background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.2)", borderRadius: "14px", padding: "14px", color: "#FF6B6B", fontSize: "15px", fontWeight: 700, cursor: "pointer", marginTop: "8px" }}>
          Sign Out
        </button>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────

export default function BlockPayApp() {
  const [screen, setScreen] = useState("home");
  const [activeTab, setActiveTab] = useState("home");

  const navTo = (s) => {
    setScreen(s);
    if (["home", "history", "bills", "profile"].includes(s)) setActiveTab(s);
  };

  const tabs = [
    { id: "home", icon: "⊞", label: "Home" },
    { id: "send", icon: "↗", label: "Send" },
    { id: "scan", icon: "⬛", label: "Scan" },
    { id: "history", icon: "⊟", label: "History" },
    { id: "profile", icon: "◉", label: "Profile" },
  ];

  const renderScreen = () => {
    switch (screen) {
      case "home": return <HomeScreen onNav={navTo} />;
      case "send": return <SendScreen onBack={() => navTo("home")} />;
      case "scan": return <ScanScreen onBack={() => navTo("home")} />;
      case "history": return <HistoryScreen onBack={() => navTo("home")} />;
      case "profile": return <ProfileScreen onBack={() => navTo("home")} />;
      default: return <HomeScreen onNav={navTo} />;
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "linear-gradient(135deg, #080818 0%, #0f0f2a 100%)", fontFamily: "'SF Pro Display', -apple-system, sans-serif" }}>
      <style>{`
        * { box-sizing: border-box; -webkit-font-smoothing: antialiased; }
        ::-webkit-scrollbar { width: 0; }
        input::placeholder { color: rgba(255,255,255,0.25); }
        input[type=number]::-webkit-outer-spin-button, input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
        @keyframes pulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.05);opacity:0.8} }
        @keyframes scan { 0%{top:10%} 100%{top:90%} }
      `}</style>

      {/* Phone frame */}
      <div style={{ position: "relative", width: 375, height: 780, borderRadius: "44px", background: "#000", boxShadow: "0 0 0 1px rgba(255,255,255,0.15), 0 40px 100px rgba(0,0,0,0.7), 0 0 60px rgba(108,99,255,0.2)", overflow: "hidden" }}>
        {/* Status Bar */}
        <div style={{ height: 44, background: "#0d0d1a", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 24px", flexShrink: 0 }}>
          <span style={{ color: "#fff", fontSize: "12px", fontWeight: 600 }}>9:41</span>
          <div style={{ width: 80, height: 16, background: "#000", borderRadius: "10px", position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)" }} />
          <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
            <span style={{ color: "#fff", fontSize: "12px" }}>▲▲▲</span>
            <span style={{ color: "#fff", fontSize: "11px" }}>100%</span>
          </div>
        </div>

        {/* Screen content */}
        <div style={{ height: "calc(780px - 44px - 72px)", overflowY: "hidden", background: "#0d0d1a" }}>
          {renderScreen()}
        </div>

        {/* Bottom Nav */}
        <div style={{ height: 72, background: "rgba(10,10,26,0.95)", backdropFilter: "blur(20px)", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-around", padding: "0 8px" }}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id || screen === tab.id;
            const isScan = tab.id === "scan";
            return (
              <button key={tab.id} onClick={() => navTo(tab.id)} style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: isScan ? 0 : "4px",
                background: isScan ? "linear-gradient(135deg, #6C63FF, #00C896)" : "transparent",
                border: "none", cursor: "pointer", padding: isScan ? 0 : "6px 10px",
                borderRadius: isScan ? "50%" : "12px",
                width: isScan ? 52 : "auto", height: isScan ? 52 : "auto",
                justifyContent: "center",
                marginTop: isScan ? "-20px" : 0,
                boxShadow: isScan ? "0 4px 20px rgba(108,99,255,0.5)" : "none",
                transition: "all 0.2s",
              }}>
                <span style={{ fontSize: isScan ? 22 : 18, color: isScan ? "#fff" : isActive ? "#6C63FF" : "rgba(255,255,255,0.3)" }}>{tab.icon}</span>
                {!isScan && <span style={{ fontSize: "10px", fontWeight: 600, color: isActive ? "#6C63FF" : "rgba(255,255,255,0.3)", letterSpacing: "0.3px" }}>{tab.label}</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
