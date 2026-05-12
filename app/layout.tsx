import "./globals.css";
import Providers from "./providers";
import BottomNav from "./components/BottomNav";

export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          background: "#0b0b12",
          color: "white",
          fontFamily:
            "system-ui, Arial, sans-serif",
        }}
      >
        <Providers>
          <main
            style={{
              paddingBottom: "90px",
            }}
          >
            {children}
          </main>

          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}
