import type { Metadata } from "next";
import { Kanit } from "next/font/google";
import "./globals.css";

const kanit = Kanit({
  weight: ["300", "400", "500", "600"],
  subsets: ["latin", "thai"],
  variable: "--font-kanit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TIFA — LINE Broadcast",
  description: "Broadcast messages to your LINE Official Account followers with ease.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={kanit.variable}>
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
