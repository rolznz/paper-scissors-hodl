import type { Metadata } from "next";
import "./globals.css";
import React from "react";
import { APP_NAME } from "./types";

export const metadata: Metadata = {
  title: APP_NAME,
  description: "Paper Scissors Rock with sats at stake",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex flex-col justify-center items-center w-full h-full">
        {children}
      </body>
    </html>
  );
}
