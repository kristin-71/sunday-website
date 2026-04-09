"use client"

import { useState } from "react"
import Image from "next/image"

export default function Home() {
  const [email, setEmail] = useState("")
  const [state, setState] = useState<"idle" | "loading" | "done" | "exists" | "error">("idle")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setState("loading")

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/waitlist`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          Prefer: "return=minimal",
        },
        body: JSON.stringify({ email, source: "website" }),
      }
    )

    if (res.ok) setState("done")
    else if (res.status === 409) setState("exists")
    else setState("error")
  }

  return (
    <main style={{
      background: "#F6F3EC",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 24px",
      color: "#222222",
      fontFamily: "'Sora', sans-serif",
    }}>
      <Image src="/mascot_happy.png" alt="Sunday" width={140} height={140} style={{ marginBottom: 24 }} />

      <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-1px", marginBottom: 12 }}>Sunday</div>

      <div style={{
        fontSize: 15, fontWeight: 300, color: "#888880",
        letterSpacing: "0.3px", textAlign: "center",
        lineHeight: 1.6, marginBottom: 32,
      }}>
        Something new is coming.<br />Check back soon.
      </div>

      {state === "done" ? (
        <p style={{ fontFamily: "'Sora',sans-serif", fontSize: 18, fontWeight: 700, color: "#4A7A62", textAlign: "center" }}>
          Sunday will come find you.
        </p>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: "flex", gap: 10, width: "100%", maxWidth: 380 }}>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            style={{
              flex: 1, padding: "14px 18px",
              borderRadius: 100, border: "1.5px solid #D7C9B3",
              background: "white", fontSize: 14,
              fontFamily: "'Sora', sans-serif", color: "#222222",
              outline: "none",
            }}
          />
          <button
            type="submit"
            disabled={state === "loading"}
            style={{
              padding: "14px 22px",
              background: "#222222", color: "white",
              fontSize: 14, fontWeight: 600,
              borderRadius: 100, border: "none",
              cursor: state === "loading" ? "default" : "pointer",
              fontFamily: "'Sora', sans-serif",
              whiteSpace: "nowrap",
            }}
          >
            {state === "loading" ? "Joining..." : "Notify me"}
          </button>
        </form>
      )}

      <p style={{ fontSize: 12, color: "#888880", marginTop: 12, textAlign: "center" }}>
        {state === "exists" ? "You're already on the list. Sunday hasn't forgotten you." :
         state === "error"  ? "Something went wrong. Try again." :
         "Be the first to know when Sunday launches."}
      </p>

      <p style={{ fontSize: 12, color: "#B3CCBE", marginTop: 40, letterSpacing: "0.5px" }}>
        Built by pawrents, for pawrents.
      </p>
    </main>
  )
}
