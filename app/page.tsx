"use client";

import { useEffect, useState } from "react";

type Envelope = {
  id: number;
  name: string;
  balance: number;
};

export default function BudgetPage() {
  const [income, setIncome] = useState<number>(0);
  const [envelopes, setEnvelopes] = useState<Envelope[]>([]);
  const [incomeInput, setIncomeInput] = useState("");
  const [newEnvelope, setNewEnvelope] = useState("");

  // ---------- LOAD DATA ----------
  const loadData = async () => {
    const incomeRes = await fetch("/api/budget?action=income");
    const incomeData = await incomeRes.json();
    setIncome((Number)(incomeData?.amount) ?? 0);

    const envRes = await fetch("/api/budget?action=envelopes");
    const envData = await envRes.json();
    setEnvelopes(envData);
  };

  useEffect(() => {
    loadData();
  }, []);

  // ---------- ACTIONS ----------
  const addIncome = async () => {
    const amount = Number(incomeInput);
    if (!amount || amount <= 0) return;

    await fetch("/api/budget", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "addIncome",
        amount,
      }),
    });

    setIncomeInput("");
    loadData();
  };

  const addEnvelope = async () => {
    if (!newEnvelope.trim()) return;

    await fetch("/api/budget", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "addEnvelope",
        name: newEnvelope,
      }),
    });

    setNewEnvelope("");
    loadData();
  };

  const moveMoney = async (envelopeId: number, amount: number) => {
    if (!amount || amount <= 0) return;

    await fetch("/api/budget", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "move",
        envelopeId,
        amount,
      }),
    });

    loadData();
  };

  const spendMoney = async (envelopeId: number, amount: number) => {
    if (!amount || amount <= 0) return;

    await fetch("/api/budget", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "spend",
        envelopeId,
        amount,
      }),
    });

    loadData();
  };

  // ---------- UI ----------
  return (
    <main className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Envelope Budgeting</h1>

      {/* INCOME */}
      <section className="border rounded-xl p-4 space-y-2">
        <h2 className="text-xl font-semibold">Income</h2>
        <p className="text-lg">Available: ${income.toFixed(2)}</p>

        <div className="flex gap-2">
          <input
            className="border rounded p-2 w-full"
            placeholder="Add income"
            value={incomeInput}
            onChange={(e) => setIncomeInput(e.target.value)}
          />
          <button
            onClick={addIncome}
            className="bg-black text-white px-4 rounded"
          >
            Add
          </button>
        </div>
      </section>

      {/* ADD ENVELOPE */}
      <section className="border rounded-xl p-4 space-y-2">
        <h2 className="text-xl font-semibold">Envelopes</h2>

        <div className="flex gap-2">
          <input
            className="border rounded p-2 w-full"
            placeholder="New envelope name"
            value={newEnvelope}
            onChange={(e) => setNewEnvelope(e.target.value)}
          />
          <button
            onClick={addEnvelope}
            className="bg-black text-white px-4 rounded"
          >
            Add
          </button>
        </div>

        {envelopes.map((env) => (
          <EnvelopeCard
            key={env.id}
            envelope={env}
            onMove={moveMoney}
            onSpend={spendMoney}
          />
        ))}
      </section>
    </main>
  );
}

// ---------- ENVELOPE CARD ----------
function EnvelopeCard({
  envelope,
  onMove,
  onSpend,
}: {
  envelope: Envelope;
  onMove: (id: number, amount: number) => void;
  onSpend: (id: number, amount: number) => void;
}) {
  const [moveAmount, setMoveAmount] = useState("");
  const [spendAmount, setSpendAmount] = useState("");

  return (
    <div className="border rounded-lg p-3 space-y-2">
      <div className="flex justify-between">
        <strong>{envelope.name}</strong>
        <span>${(Number)(envelope.balance).toFixed(2)}</span>
      </div>

      <div className="flex gap-2">
        <input
          className="border rounded p-2 w-full"
          placeholder="Move"
          value={moveAmount}
          onChange={(e) => setMoveAmount(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onMove(envelope.id, Number(moveAmount));
              setMoveAmount("");
            }
          }}
        />

        <input
          className="border rounded p-2 w-full"
          placeholder="Spend"
          value={spendAmount}
          onChange={(e) => setSpendAmount(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onSpend(envelope.id, Number(spendAmount));
              setSpendAmount("");
            }
          }}
        />
      </div>
    </div>
  );
}
