import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GetBachat.com ⚡ | India's #1 Price History & Additional Rewards Platform",
  description: "Get all store discounts + earn additional Bachat Reward Points on Amazon India, Flipkart, Myntra & 500+ stores! Track price history and save more on every purchase.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

