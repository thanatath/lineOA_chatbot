import type { Metadata } from "next";
import { Kanit } from "next/font/google";
import "./globals.css";

const kanit = Kanit({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-kanit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LINE Chat - Web Chat Application",
  description: "Connect and chat with LINE Official Account. Real-time messaging powered by LINE Bot SDK.",
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
