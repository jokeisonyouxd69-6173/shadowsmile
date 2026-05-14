"use client";

import { usePathname } from "next/navigation";
import BottomNav from "./BottomNav";

export default function LayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const hideNav =
    pathname === "/signin" ||
    pathname === "/reset-password";

  return (
    <>
      <main
        style={{
          paddingBottom: hideNav
            ? "0px"
            : "90px",
        }}
      >
        {children}
      </main>

      {!hideNav && <BottomNav />}
    </>
  );
}
