"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Home,
  Search,
  Plus,
  MessageSquare,
  User,
  ShieldAlert,
  Command,
  Heart,
  Share2,
  Sparkles,
  LogIn,
  LogOut,
} from "lucide-react";

import { supabase } from "../lib/supabase";
import { useRouter } from "next/navigation";

/* ================= TYPES ================= */

type Post = {
  id: string;
  user_id: string | null;
  shadow_text: string | null;
  smile_text: string | null;
  content: string | null;
  post_type: string;
  created_at: string;
  like_count?: number;
};

/* ================= COMPONENT ================= */

export default function Page() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const [mode, setMode] = useState<"structured" | "normal">("structured");

  const [shadow, setShadow] = useState("");
  const [smile, setSmile] = useState("");
  const [text, setText] = useState("");

  const [openComments, setOpenComments] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");

  /* ================= USER ================= */

  async function loadUser() {
    const { data } = await supabase.auth.getUser();

    setUser(data?.user || null);
    setLoading(false);
  }

  /* ================= POSTS ================= */

  async function loadPosts() {
    const { data: postsData, error: postError } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (postError) {
      console.error("Post error:", postError);
      return;
    }

    const { data: reactionsData } = await supabase
      .from("reactions")
      .select("post_id, type");

    const formatted = (postsData || []).map((post: any) => {
      const likes =
        reactionsData?.filter(
          (r) => r.post_id === post.id && r.type === "like"
        ).length || 0;

      return {
        ...post,
        like_count: likes,
      };
    });

    setPosts(formatted);
  }

  useEffect(() => {
    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadUser();
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      loadPosts();
    } else {
      setPosts([]);
    }
  }, [user]);

  /* ================= CREATE POST ================= */

  async function createPost() {
    if (!user) {
      router.push("/signin");
      return;
    }

    const payload =
      mode === "structured"
        ? {
            user_id: user.id,
            post_type: "flip",
            shadow_text: shadow,
            smile_text: smile,
            content: null,
          }
        : {
            user_id: user.id,
            post_type: "normal",
            content: text,
            shadow_text: null,
            smile_text: null,
          };

    const { error } = await supabase.from("posts").insert(payload);

    if (error) {
      console.error(error);
      return;
    }

    setShadow("");
    setSmile("");
    setText("");

    loadPosts();
  }

  /* ================= LIKE ================= */

  async function likePost(postId: string) {
    if (!user) {
      router.push("/signin");
      return;
    }

    await supabase.from("reactions").insert({
      post_id: postId,
      user_id: user.id,
      type: "like",
    });

    loadPosts();
  }

  /* ================= COMMENT ================= */

  async function addComment(postId: string) {
    if (!user) {
      router.push("/signin");
      return;
    }

    if (!commentText.trim()) return;

    await supabase.from("comments").insert({
      post_id: postId,
      user_id: user.id,
      content: commentText,
    });

    setCommentText("");
    setOpenComments(null);
  }

  /* ================= SHARE ================= */

  async function sharePost(postId: string) {
    const link = `${window.location.origin}/post/${postId}`;

    try {
      await navigator.clipboard.writeText(link);
      alert("Link copied to clipboard");
    } catch {
      prompt("Copy this link:", link);
    }
  }

  /* ================= SIGN OUT ================= */

  async function handleLogout() {
    await supabase.auth.signOut();
    router.refresh();
    window.location.reload();
  }

  /* ================= LOADING ================= */

  if (loading) {
    return <div style={styles.loading}>Loading ShadowSmile...</div>;
  }

  /* ================= UI ================= */

  return (
    <main style={styles.app}>
      {/* HEADER */}
      <header style={styles.header}>
        <div style={styles.left}>
          <div style={styles.logo}>
            <Command size={16} />
          </div>

          <h1 style={styles.title}>
            Shadow<span style={{ color: "#39FF88" }}>Smile</span>
          </h1>
        </div>

        <div style={styles.right}>
          {!user ? (
            <button
              style={styles.market}
              onClick={() => router.push("/signin")}
            >
              <LogIn size={14} />
              Sign In
            </button>
          ) : (
            <button
              style={styles.market}
              onClick={handleLogout}
            >
              <LogOut size={14} />
              Sign Out
            </button>
          )}

          <button
            style={styles.market}
            onClick={() => router.push("/marketplace")}
          >
            Marketplace
          </button>

          <button
            style={styles.market}
            onClick={() => router.push("/dev")}
          >
            Dev
          </button>

          <button style={styles.shield}>
            <ShieldAlert size={18} />
          </button>
        </div>
      </header>

      {/* HERO */}
      <section style={styles.hero}>
        <div style={styles.badge}>
          <Sparkles size={12} />
          Platform Core
        </div>

        <h2 style={styles.heroTitle}>
          Express the Shadow.
          <br />
          Share the Smile.
        </h2>

        <p style={styles.heroText}>
          A safe social space for honesty, support, healing, and connection.
        </p>

        {!user && (
          <button
            style={styles.enterBtn}
            onClick={() => router.push("/signin")}
          >
            Enter the Light
          </button>
        )}

        <div style={styles.toggleRow}>
          <button
            onClick={() => setMode("structured")}
            style={{
              ...styles.toggleBtn,
              background:
                mode === "structured" ? "#7B2FFF" : "transparent",
            }}
          >
            Shadow / Smile
          </button>

          <button
            onClick={() => setMode("normal")}
            style={{
              ...styles.toggleBtn,
              background:
                mode === "normal" ? "#39FF88" : "transparent",
              color:
                mode === "normal"
                  ? "#0A0A0F"
                  : "#EAEAF0",
            }}
          >
            Normal
          </button>
        </div>
      </section>

      {/* CREATE POST */}
      {user && (
        <section style={styles.createBox}>
          {mode === "structured" ? (
            <>
              <input
                placeholder="Shadow thought..."
                value={shadow}
                onChange={(e) => setShadow(e.target.value)}
                style={styles.input}
              />

              <input
                placeholder="What helped?"
                value={smile}
                onChange={(e) => setSmile(e.target.value)}
                style={styles.input}
              />
            </>
          ) : (
            <textarea
              placeholder="What's on your mind?"
              value={text}
              onChange={(e) => setText(e.target.value)}
              style={styles.input}
            />
          )}

          <button onClick={createPost} style={styles.postBtn}>
            Post
          </button>
        </section>
      )}

      {/* FEED */}
      <section style={styles.feed}>
        {!user ? (
          <div style={styles.lockedBox}>
            <h2>Members Only</h2>
            <p>Sign in to view Shadows and Smiles.</p>

            <button
              style={styles.enterBtn}
              onClick={() => router.push("/signin")}
            >
              Sign In
            </button>
          </div>
        ) : (
          posts.map((p) => (
            <div
              key={p.id}
              style={styles.card}
              onClick={() => router.push(`/post/${p.id}`)}
            >
              <Link
                href={`/profile/${p.user_id}`}
                style={styles.profileLink}
                onClick={(e) => e.stopPropagation()}
              >
                View Profile
              </Link>

              {p.post_type === "flip" ? (
                <>
                  <p>
                    <b>Shadow:</b> {p.shadow_text}
                  </p>

                  <p style={{ color: "#39FF88" }}>
                    <b>Smile:</b> {p.smile_text}
                  </p>
                </>
              ) : (
                <p>{p.content}</p>
              )}

              <div
                style={styles.actions}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  style={styles.actionBtn}
                  onClick={() => likePost(p.id)}
                >
                  <Heart size={14} /> {p.like_count || 0}
                </button>

                <button
                  style={styles.actionBtn}
                  onClick={() =>
                    setOpenComments(
                      openComments === p.id ? null : p.id
                    )
                  }
                >
                  <MessageSquare size={14} /> Comment
                </button>

                <button
                  style={styles.actionBtn}
                  onClick={() => sharePost(p.id)}
                >
                  <Share2 size={14} /> Share
                </button>
              </div>

              {openComments === p.id && (
                <div style={styles.commentBox}>
                  <input
                    value={commentText}
                    onChange={(e) =>
                      setCommentText(e.target.value)
                    }
                    placeholder="Write comment..."
                    style={styles.commentInput}
                  />

                  <button
                    onClick={() => addComment(p.id)}
                    style={styles.commentBtn}
                  >
                    Send
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </section>
    </main>
  );
}

/* ================= STYLES ================= */

const styles: Record<string, React.CSSProperties> = {
  app: {
    minHeight: "100vh",
    background: "linear-gradient(180deg,#0A0A0F,#0E0E14)",
    color: "#EAEAF0",
    fontFamily: "system-ui",
    paddingBottom: 120,
  },

  loading: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    padding: 16,
    borderBottom: "1px solid #222",
    alignItems: "center",
  },

  left: { display: "flex", gap: 10, alignItems: "center" },
  right: { display: "flex", gap: 10, alignItems: "center" },

  logo: {
    width: 34,
    height: 34,
    borderRadius: 10,
    background: "linear-gradient(135deg,#7B2FFF,#39FF88)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  title: { fontSize: 18, fontWeight: 800 },

  shield: {
    width: 42,
    height: 42,
    borderRadius: "50%",
    border: "1px solid #333",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  market: {
    padding: "8px 12px",
    borderRadius: 999,
    border: "1px solid #39FF88",
    color: "#39FF88",
    background: "transparent",
    display: "flex",
    gap: 6,
    alignItems: "center",
  },

  hero: {
    padding: 20,
    textAlign: "center",
  },

  heroTitle: {
    fontSize: 34,
    fontWeight: 900,
  },

  heroText: {
    color: "#aaa",
    marginTop: 10,
  },

  badge: {
    display: "inline-flex",
    gap: 6,
    marginBottom: 10,
    border: "1px solid #333",
    padding: "4px 10px",
    borderRadius: 999,
  },

  enterBtn: {
    marginTop: 20,
    padding: "12px 24px",
    borderRadius: 999,
    border: "none",
    background:
      "linear-gradient(135deg,#7B2FFF,#39FF88)",
    color: "#fff",
    fontWeight: 700,
  },

  lockedBox: {
    textAlign: "center",
    padding: 40,
  },

  profileLink: {
    color: "#39FF88",
    textDecoration: "none",
    fontSize: 12,
    marginBottom: 10,
    display: "inline-block",
  },

  toggleRow: {
    display: "flex",
    gap: 10,
    marginTop: 20,
  },

  toggleBtn: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    border: "1px solid #333",
  },

  createBox: {
    maxWidth: 600,
    margin: "0 auto",
    padding: 16,
  },

  input: {
    width: "100%",
    padding: 10,
    marginBottom: 10,
    borderRadius: 10,
    background: "#111",
    border: "1px solid #222",
    color: "#fff",
  },

  postBtn: {
    width: "100%",
    padding: 12,
    borderRadius: 12,
    background:
      "linear-gradient(135deg,#7B2FFF,#39FF88)",
    fontWeight: 800,
  },

  feed: {
    maxWidth: 600,
    margin: "0 auto",
    padding: 16,
  },

  card: {
    background: "#111",
    border: "1px solid #222",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },

  actions: {
    display: "flex",
    gap: 10,
    marginTop: 10,
  },

  actionBtn: {
    display: "flex",
    gap: 5,
    alignItems: "center",
    padding: "6px 10px",
    borderRadius: 8,
    background: "#1a1a1a",
  },

  commentBox: {
    display: "flex",
    gap: 10,
    marginTop: 10,
  },

  commentInput: {
    flex: 1,
    padding: 8,
    borderRadius: 8,
    background: "#111",
    border: "1px solid #222",
    color: "#fff",
  },

  commentBtn: {
    padding: "8px 12px",
    borderRadius: 8,
    background: "#39FF88",
    border: "none",
  },
};
