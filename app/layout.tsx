import type { Metadata } from "next";
import { Noto_Sans_Thai } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const notoSansThai = Noto_Sans_Thai({
  variable: "--font-noto-sans-thai",
  subsets: ["thai", "latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "สถาบันพัฒนาการตรวจเงินแผ่นดิน",
  description: "สถาบันพัฒนาการตรวจเงินแผ่นดิน",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let siteLogo = null;
  try {
    const settings = await prisma.siteSetting.findUnique({
      where: { id: "1" }
    });
    siteLogo = settings?.logo || null;
  } catch (e) {
    console.error("Failed to load settings:", e);
  }

  return (
    <html lang="en">
      <body
        className={`${notoSansThai.variable} font-sans antialiased`}
      >
        <Header logoUrl={siteLogo} />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer logoUrl={siteLogo} />
      </body>
    </html>
  );
}
