import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ping / Pong — Demo API",
  description: "Une petite app Next.js qui parle à une API Python. Vercel + Railway.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fr"><body>{children}</body></html>;
}
