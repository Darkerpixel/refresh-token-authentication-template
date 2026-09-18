"use client";

import { useState } from "react";
import { sayHello } from "./actions";

export default function GreetingButton() {
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");

  async function handleClick() {
    setMessage(null);
    setLoading(true);
    const response = await fetch("/api/greeting");
    const data = await response.json();
    setMessage(data.message);
    setLoading(false);
  }

  async function handlePost() {
    setMessage(null);
    setLoading(true);
    const response = await fetch("/api/greeting", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await response.json();
    setMessage(data.message);
    setLoading(false);
  }

  async function handleAction() {
    setMessage(null);
    setLoading(true);
    const result = await sayHello(name);
    setMessage(result);
    setLoading(false);
  }

  return (
    <div style={{ marginTop: "1rem" }}>
      <button onClick={handleClick}>Fetch greeting</button>
      <div style={{ marginTop: "1rem" }}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your Name"
        />
        <button onClick={handlePost}>Send Name</button>
      </div>
      <button onClick={handleAction}>{"Send Name (Server Action)"}</button>
      {loading && <p>Loading...</p>}
      {message && <p>{message}</p>}
    </div>
  );
}
