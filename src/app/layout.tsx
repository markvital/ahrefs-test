import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";

import SiteChrome from "@/components/layout/SiteChrome";
import ThemeRegistry from "@/components/ThemeRegistry";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Food additives catalogue",
  description:
    "Explore a clean catalogue of food additives to learn about their roles and properties.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={roboto.className}>
        <ThemeRegistry>
          <SiteChrome>{children}</SiteChrome>
        </ThemeRegistry>
      </body>
    </html>
  );
}
