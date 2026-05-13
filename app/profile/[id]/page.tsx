"use client";

  import React, {
    useEffect,
    useState,
  } from "react";

  import Image from "next/image";

  import {
    useParams,
    useRouter,
  } from "next/navigation";

  import { supabase }
    from "../../../lib/supabase";

  import {
    Heart,
    MessageSquare,
    Settings,
  } from "lucide-react";

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
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  role: string | null;
  created_at: string;
};

export default function ProfilePage() {
  const params = useParams();

  const id =
    typeof params.id === "string"
      ? params.id
      : params.id?.[0];

  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
const [editing, setEditing] =
  useState(false);

const [editName, setEditName] =
  useState("");

const [editBio, setEditBio] =
  useState("");

const [saving, setSaving] =
  useState(false);

const [avatarFile, setAvatarFile] =
  useState<File | null>(null);

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

    const { data, error } =
      await supabase
        .from("profiles")
        .select(`
          id,
          handle,
          display_name,
          bio,
          avatar_url,
          role,
          created_at
        `)
        .eq("id", id)
        .single();
    if (error) {
      console.error(error);
      return;
    }

    setProfile(data || null);

    console.log(
      "Profile role:",
      data?.role
    );

    console.log(
      "Avatar URL:",
      data?.avatar_url
    );

    setEditName(
      data?.display_name || ""
    );

    setEditBio(
      data?.bio || ""
    );
  }

  loadProfile();
}, [id]);

  /* ================= LOAD POSTS ================= */

  useEffect(() => {
  async function loadPosts() {
    try {
      if (!id) return;

    const { data, error } =
      await supabase
        .from("posts")
        .select("*")
        .eq("user_id", id)
        .order("created_at", {
          ascending: false,
        });

    if (error) {
      console.error(error);
      return;
    }

      const postsData = data || [];

      setPosts(postsData);

      const postIds =
        postsData.map((p) => p.id);

      let likesReceived = 0;

      if (postIds.length > 0) {
        const { data: reactions } =
          await supabase
            .from("reactions")
            .select("post_id, type")
            .in("post_id", postIds);

        likesReceived =
          reactions?.filter(
            (r) => r.type === "like"
          ).length || 0;
      }

      setStats({
        postCount:
          postsData.length,
        likesReceived,
      });
    } finally {
      setLoading(false);
    }
  }

    loadPosts();
  }, [id]);

async function saveProfile() {
  if (!profile?.id) return;

  try {
    setSaving(true);

let avatarUrl =
  profile?.avatar_Url || null;

if (avatarFile) {
  const fileExt =
    avatarFile.name
      .split(".")
      .pop();

  const fileName =
    `${profile.id}-${Date.now()}.${fileExt}`;

  const { error: uploadError } =
    await supabase.storage
      .from("avatars")
      .upload(
        fileName,
        avatarFile,
        {
          upsert: true,
        }
      );

  if (uploadError) {
    console.error(uploadError);
    alert(
      "Failed to upload avatar"
    );
    return;
  }

  const {
    data: publicUrlData,
  } = supabase.storage
    .from("avatars")
    .getPublicUrl(
      fileName
    );

  avatarUrl =
    publicUrlData.publicUrl;
}

    const { error } =
      await supabase
        .from("profiles")
        .update({
          display_name:
            editName.trim(),

          bio:
            editBio.trim(),

          avatar_Url:
            avatarUrl,
        })
        .eq(
          "id",
          profile.id
        );

    if (error) {
      console.error(error);
      alert(
        "Failed to save profile"
      );
      return;
    }

    setProfile((prev) =>
      prev
        ? {
            ...prev,
            display_name:
              editName.trim(),

            bio:
              editBio.trim(),

            avatar_Url:
              avatarUrl,
          }
        : prev
    );

    setEditing(false);
  } finally {
    setSaving(false);
  }
}

  /* ================= HANDLE ================= */

const displayName =
  profile?.display_name?.trim()
    ? profile.display_name
    : "ShadowSmile Member";

const profileBio =
  profile?.bio?.trim()
    ? profile.bio
    : "No bio yet.";

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
  {profile?.avatar_Url ? (
    <Image
      src={profile.avatar_Url}
      alt="avatar"
      fill
      style={styles.avatarImage}
    />
  ) : (
    displayHandle
      .charAt(1)
      .toUpperCase()
  )}
</div>

  {profile?.role === "admin" && (
    <div style={styles.adminBadge}>
      Founder
    </div>
  )}

  <h1 style={styles.displayName}>
    {displayName}
  </h1>

  <h2 style={styles.handle}>
    {displayHandle}
  </h2>

{!editing && (
  <p style={styles.bio}>
    {profileBio}
  </p>
)}

{isOwnProfile && !editing && (
  <button
    style={styles.editButton}
    onClick={() =>
      setEditing(true)
    }
  >
    Edit Profile
  </button>
)}

{isOwnProfile && editing && (
  <div style={styles.editBox}>
   
    <label style={styles.uploadLabel}>
      Choose Avatar

      <input
        type="file"
        accept="image/*"
        onChange={(e) =>
          setAvatarFile(
            e.target.files?.[0] || null
          )
        }
        style={styles.hiddenInput}
      />
    </label>

    <input
      value={editName}
      onChange={(e) =>
        setEditName(
          e.target.value
        )
      }
      placeholder="Display name"
      style={styles.input}
    />

    <textarea
      value={editBio}
      onChange={(e) =>
        setEditBio(
          e.target.value
        )
      }
      placeholder="Tell people about yourself"
      style={styles.textarea}
    />

    <div style={styles.editActions}>
      <button
        style={styles.cancelButton}
        onClick={() => {
          setEditName(
            profile?.display_name || ""
          );

          setEditBio(
            profile?.bio || ""
          );

          setEditing(false);
        }}
      >
        Cancel
      </button>

      <button
        style={styles.saveButton}
        onClick={saveProfile}
        disabled={saving}
      >
        {saving
          ? "Saving..."
          : "Save"}
      </button>
    </div>
  </div>
)}

<p style={styles.memberSince}>
  Member since{" "}
  {profile?.created_at
    ? new Date(
        profile.created_at
      ).toLocaleDateString()
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
  background:
    "linear-gradient(180deg,#0A0A0F,#0E0E14)",
  color: "#EAEAF0",
  padding: 20,
  paddingBottom: 120,
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
    position: "relative",
    overflow: "hidden",
    width: 90,
    height: 90,
    borderRadius: "50%",
    background:
      "linear-gradient(135deg,#7B2FFF,#39FF88)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    margin: "0 auto 16px",
    fontSize: 34,
    fontWeight: 900,
  },

avatarImage: {
  objectFit: "cover",
},

  handle: {
    fontSize: 18,
    fontWeight: 600,
    color: "#888",
  },

displayName: {
  fontSize: 28,
  fontWeight: 800,
  marginBottom: 6,
},

bio: {
  color: "#AAA",
  maxWidth: 420,
  margin: "12px auto",
  lineHeight: 1.5,
},

adminBadge: {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "8px 14px",
  borderRadius: 999,
  background:
    "linear-gradient(135deg,#7B2FFF,#39FF88)",
  fontSize: 12,
  fontWeight: 800,
  color: "#0A0A0F",
  marginBottom: 12,
  boxShadow:
    "0 6px 20px rgba(123,47,255,0.35)",
},

  memberSince: {
  color: "#888",
  marginTop: 8,
},

editButton: {
  marginTop: 18,
  background:
    "linear-gradient(135deg,#7B2FFF,#39FF88)",
  border: "none",
  color: "#0A0A0F",
  padding: "12px 18px",
  borderRadius: 14,
  fontWeight: 800,
  cursor: "pointer",
},

editBox: {
  marginTop: 24,
  display: "flex",
  flexDirection: "column",
  gap: 12,
},

input: {
  background: "#111",
  border: "1px solid #222",
  borderRadius: 14,
  padding: 14,
  color: "#fff",
  fontSize: 16,
},

textarea: {
  background: "#111",
  border: "1px solid #222",
  borderRadius: 14,
  padding: 14,
  color: "#fff",
  minHeight: 120,
  resize: "none" as const,
  fontSize: 16,
},

editActions: {
  display: "flex",
  gap: 12,
},

cancelButton: {
  flex: 1,
  background: "#222",
  border: "none",
  color: "#fff",
  padding: 14,
  borderRadius: 14,
  cursor: "pointer",
},

saveButton: {
  flex: 1,
  background:
    "linear-gradient(135deg,#7B2FFF,#39FF88)",
  border: "none",
  color: "#0A0A0F",
  padding: 14,
  borderRadius: 14,
  fontWeight: 800,
  cursor: "pointer",
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

  uploadLabel: {
    background:
      "linear-gradient(135deg,#7B2FFF,#39FF88)",
    color: "#0A0A0F",
    padding: 14,
    borderRadius: 14,
    fontWeight: 800,
    textAlign: "center",
    cursor: "pointer",
  },

  hiddenInput: {
    display: "none",
  },

};
