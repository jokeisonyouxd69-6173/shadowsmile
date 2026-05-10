"use client";

import React from "react";
import {
  Home,
  Search,
  Plus,
  MessageSquare,
  User,
} from "lucide-react";

type Props = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  router: any;
  user: any;
};

export default function Navbar({
  activeTab,
  setActiveTab,
  router,
  user,
}: Props) {
  return (
    <nav
      style={{
        position: "fixed",
        bottom: 18,
        left: "50%",
        transform: "translateX(-50%)",
        width: "calc(100% - 40px)",
        maxWidth: 520,
        height: 74,
        borderRadius: 999,
        background: "rgba(26,26,34,0.88)",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        zIndex: 100,
        backdropFilter: "blur(14px)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {/* HOME */}
      <button
        style={navBtn(activeTab === "home")}
        onClick={() => {
          setActiveTab("home");
          router.push("/");
        }}
      >
        <Home size={22} />
      </button>

      {/* SEARCH */}
      <button
        style={navBtn(activeTab === "search")}
        onClick={() => {
          setActiveTab("search");
          alert("Search coming next");
        }}
      >
        <Search size={22} />
      </button>

      {/* CREATE */}
      <button
        style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          border: "none",
          background:
            "linear-gradient(135deg,#7B2FFF,#39FF88)",
          color: "#0A0A0F",
          cursor: "pointer",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginTop: -18,
        }}
        onClick={() => {
          setActiveTab("create");
          router.push("/create");
        }}
      >
        <Plus size={24} />
      </button>

      {/* MESSAGES */}
      <button
        style={navBtn(activeTab === "messages")}
        onClick={() => {
          setActiveTab("messages");
          alert("Messages coming later");
        }}
      >
        <MessageSquare size={22} />
      </button>

      {/* PROFILE */}
      <button
        style={navBtn(activeTab === "profile")}
        onClick={() => {
          setActiveTab("profile");

          if (!user?.id) {
            router.push("/signin");
            return;
          }

          router.push(`/profile/${user.id}`);
        }}
      >
        <User size={22} />
      </button>
    </nav>
  );
}

/* ================= HELPERS ================= */

function navBtn(active: boolean): React.CSSProperties {
  return {
    background: "transparent",
    border: "none",
    color: active ? "#39FF88" : "#EAEAF0",
    cursor: "pointer",
    transition: "0.2s ease",
  };
}
