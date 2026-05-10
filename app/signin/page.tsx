"use client";

import React, { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const router = useRouter();

  const [mode, setMode] = useState<"signin" | "signup">("signin");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [handle, setHandle] = useState("");

  const [loading, setLoading] = useState(false);

  async function submit() {
    try {
      setLoading(true);

      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              handle,
            },
          },
        });

        if (error) {
          alert(error.message);
          return;
        }

        alert("Account created. Check your email if confirmation is enabled.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          alert(error.message);
          return;
        }

        router.push("/");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen w-full flex items-center justify-center bg-[#050505] overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-90"
        style={{
          backgroundImage: "url('/Shadowsmile.png')",
          filter: "brightness(0.8) contrast(1.1)",
        }}
      >
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-[400px] p-10 bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white">
            Shadow <span className="text-emerald-400">Smile</span>
          </h1>

          <p className="text-gray-400 text-sm mt-3 italic">
            Express the Shadow. Share the Smile.
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-2 mb-5">
          <button
            onClick={() => setMode("signin")}
            className={`flex-1 py-2 rounded-xl transition ${
              mode === "signin"
                ? "bg-emerald-400 text-black font-bold"
                : "bg-white/10 text-white"
            }`}
          >
            Sign In
          </button>

          <button
            onClick={() => setMode("signup")}
            className={`flex-1 py-2 rounded-xl transition ${
              mode === "signup"
                ? "bg-emerald-400 text-black font-bold"
                : "bg-white/10 text-white"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Handle for signup */}
        {mode === "signup" && (
          <input
            placeholder="Choose a handle"
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            className="w-full p-3 rounded-xl bg-white/10 border border-white/10 text-white mb-3 outline-none"
          />
        )}

        {/* Email */}
        <input
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 rounded-xl bg-white/10 border border-white/10 text-white mb-3 outline-none"
        />

        {/* Password */}
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 rounded-xl bg-white/10 border border-white/10 text-white mb-5 outline-none"
        />

        {/* Submit */}
        <button
          onClick={submit}
          disabled={loading}
          className="w-full py-3 bg-white text-black font-bold rounded-xl hover:opacity-90 transition"
        >
          {loading
            ? "Loading..."
            : mode === "signin"
            ? "Enter the Light"
            : "Create Account"}
        </button>
      </div>
    </main>
  );
}
