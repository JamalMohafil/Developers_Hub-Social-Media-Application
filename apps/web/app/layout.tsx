import type React from "react";
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Header from "../components/Header";
import { getSession } from "../lib/session";
import { SessionType } from "@/lib/type";
import { ToastContainer, toast } from "react-toastify";
import Footer from "@/components/Footer";
import { FollowProvider } from "@/context/followContext";

// Load Poppins font for all text with various weights
const poppins = Poppins({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-poppins", // استخدام المتغير في CSS
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"], // جميع الأوزان
});

export const metadata: Metadata = {
  title: "Developers Hub",
  description: "A platform for developers to connect, share, and grow",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session: SessionType | null = await getSession();
  console.log(session);
  return (
    <html lang="en">
      <body className={`${poppins.variable} dark`} suppressHydrationWarning>
        <Header serverSession={session} />
        <FollowProvider>{children}</FollowProvider>
        <Footer />
        <ToastContainer />
      </body>
    </html>
  );
}
