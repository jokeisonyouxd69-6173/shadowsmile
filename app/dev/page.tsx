"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

type User = {
  id: string;
  email?: string;
  role?: string;
};

export default function DevPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<any[]>([]);
  const [logs, setLogs] = useState<string[]>([]);

  /* ================= LOAD USER ================= */

  async function loadUser() {
    const { data } = await supabase.auth.getUser();
    setUser(data?.user as any);
    setLoading(false);
  }

  /* ================= LOAD TEST DATA ================= */

  async function loadPosts() {
    const { data, error } = await supabase.from("posts").select("*");

    if (error) {
      setLogs((prev) => [...prev, "Error loading posts: " + error.message]);
      return;
    }

    setPosts(data || []);
  }

  /* ================= INIT ================= */

  useEffect(() => {
    loadUser();
    loadPosts();
  }, []);

  /* ================= GUARD (ADMIN ONLY) ================= */

  const isAdmin = (user as any)?.user_metadata?.role === "admin";

  if (loading) {
    return <div style={styles.loading}>Loading Dev Panel...</div>;
  }

  if (!isAdmin) {
    return (
      <div style={styles.denied}>
        <h2>Access Denied</h2>
        <p>You are not an admin.</p>

        <button onClick={() => router.push("/")}>Go Home</button>
      </div>
    );
  }

  /* ================= UI ================= */

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🧪 ShadowSmile Dev Sandbox</h1>

      <button style={styles.button} onClick={loadPosts}>
        Refresh Posts
      </button>

      {/* POSTS */}
      <div style={styles.box}>
        <h3>Posts ({posts.length})</h3>

        {posts.map((p) => (
          <div key={p.id} style={styles.card}>
            <p><b>ID:</b> {p.id}</p>
            <p><b>Type:</b> {p.post_type}</p>
            <p>{p.content || p.shadow_text}</p>
          </div>
        ))}
      </div>

      {/* LOGS */}
      <div style={styles.box}>
        <h3>Logs</h3>
        {logs.map((l, i) => (
          <p key={i} style={styles.log}>
            {l}
          </p>
        ))}
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: 20,
    background: "#0A0A0F",
    color: "#fff",
    minHeight: "100vh",
  },

  loading: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "#fff",
  },

  denied: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    color: "red",
    gap: 10,
  },

  title: {
    fontSize: 24,
    fontWeight: 800,
    marginBottom: 20,
  },

  button: {
    padding: "10px 14px",
    background: "#7B2FFF",
    border: "none",
    color: "#fff",
    borderRadius: 8,
    marginBottom: 20,
  },

  box: {
    marginBottom: 20,
    padding: 12,
    border: "1px solid #333",
    borderRadius: 10,
  },

  card: {
    padding: 10,
    borderBottom: "1px solid #222",
  },

  log: {
    fontSize: 12,
    color: "#aaa",
  },
};
