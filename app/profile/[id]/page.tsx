"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import { Heart, MessageSquare, Settings } from "lucide-react";

type Post = {
  id: string;
  user_id: string;
  post_type: string;
  shadow_text: string | null;
  smile_text: string | null;
  content: string | null;
  created_at: string;
};

type Profile = {
  id: string;
  handle: string | null;
  avatar_url: string | null;
  created_at: string;
};

export default function ProfilePage() {
  const { id } = useParams();
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    postCount: 0,
    likesReceived: 0,
  });

  /* ================= LOAD USER ================= */

  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      setCurrentUser(data?.user || null);
    }

    loadUser();
  }, []);

  /* ================= LOAD PROFILE ================= */

  useEffect(() => {
    async function loadProfile() {
      if (!id) return;

      const { data } = await supabase
        .from("profiles")
        .select("id, handle, avatar_url, created_at")
        .eq("id", id)
        .single();

      setProfile(data || null);
    }

    loadProfile();
  }, [id]);

  /* ================= LOAD POSTS ================= */

  useEffect(() => {
    async function loadPosts() {
      if (!id) return;

      const { data } = await supabase
        .from("posts")
        .select("*")
        .eq("user_id", id)
        .order("created_at", { ascending: false });

      const postsData = data || [];

      setPosts(postsData);

      const { data: reactions } = await supabase
        .from("reactions")
        .select("post_id, type");

      const likesReceived =
        reactions?.filter((r) => r.type === "like").length || 0;

      setStats({
        postCount: postsData.length,
        likesReceived,
      });

      setLoading(false);
    }

    loadPosts();
  }, [id]);

  /* ================= HANDLE ================= */

  const displayHandle =
    profile?.handle?.trim()
      ? `@${profile.handle}`
      : `@member${profile?.id?.slice(0, 4) || "0000"}`;

  const isOwnProfile = currentUser?.id === profile?.id;

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <div style={styles.loading}>
        Loading profile...
      </div>
    );
  }

  /* ================= UI ================= */

  return (
    <main style={styles.page}>
      {/* HEADER */}
      <div style={styles.header}>
        <button
          onClick={() => router.push("/")}
          style={styles.backButton}
        >
          ← Back
        </button>

        {isOwnProfile && (
          <button
            style={styles.settingsBtn}
            onClick={() => router.push("/settings")}
          >
            <Settings size={16} />
            Settings
          </button>
        )}
      </div>

      {/* PROFILE CARD */}
      <section style={styles.profileCard}>
        <div style={styles.avatar}>
          {displayHandle.charAt(1).toUpperCase()}
        </div>

        <h1 style={styles.handle}>
          {displayHandle}
        </h1>

        <p style={styles.memberSince}>
          Member since{" "}
          {profile?.created_at
            ? new Date(profile.created_at).toLocaleDateString()
            : "Unknown"}
        </p>
      </section>

      {/* STATS */}
      <section style={styles.stats}>
        <div style={styles.statBox}>
          <h2>{stats.postCount}</h2>
          <p>Posts</p>
        </div>

        <div style={styles.statBox}>
          <h2>{stats.likesReceived}</h2>
          <p>Likes</p>
        </div>
      </section>

      {/* POSTS */}
      <section style={styles.feed}>
        <h2 style={styles.sectionTitle}>
          Posts
        </h2>

        {posts.length === 0 ? (
          <p style={styles.emptyText}>
            No posts yet.
          </p>
        ) : (
          posts.map((p) => (
            <div key={p.id} style={styles.card}>
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

              <div style={styles.actions}>
                <button style={styles.actionBtn}>
                  <Heart size={14} />
                </button>

                <button style={styles.actionBtn}>
                  <MessageSquare size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </section>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(180deg,#0A0A0F,#0E0E14)",
    color: "#EAEAF0",
    padding: 20,
    fontFamily: "system-ui",
  },

  loading: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#0A0A0F",
    color: "#fff",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  backButton: {
    background: "#111",
    border: "1px solid #222",
    color: "#fff",
    padding: "10px 16px",
    borderRadius: 12,
    cursor: "pointer",
  },

  settingsBtn: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "linear-gradient(135deg,#7B2FFF,#39FF88)",
    border: "none",
    color: "#fff",
    padding: "10px 16px",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 700,
  },

  profileCard: {
    textAlign: "center",
    marginBottom: 24,
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: "50%",
    background: "linear-gradient(135deg,#7B2FFF,#39FF88)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    margin: "0 auto 16px",
    fontSize: 34,
    fontWeight: 900,
  },

  handle: {
    fontSize: 28,
    fontWeight: 800,
  },

  memberSince: {
    color: "#888",
    marginTop: 8,
  },

  stats: {
    display: "flex",
    gap: 12,
    marginBottom: 24,
  },

  statBox: {
    flex: 1,
    background: "#111",
    border: "1px solid #222",
    borderRadius: 20,
    padding: 20,
    textAlign: "center",
  },

  feed: {
    marginTop: 20,
  },

  sectionTitle: {
    marginBottom: 16,
  },

  emptyText: {
    color: "#777",
  },

  card: {
    background: "#111",
    border: "1px solid #222",
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
  },

  actions: {
    display: "flex",
    gap: 10,
    marginTop: 14,
  },

  actionBtn: {
    background: "#1A1A1A",
    border: "1px solid #333",
    color: "#fff",
    borderRadius: 10,
    padding: 8,
  },
};
