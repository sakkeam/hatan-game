import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ハタンゲーム",
  description: "ハタン回避3Dアクションゲーム",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <link
          rel="preload"
          as="font"
          type="font/ttf"
          href="/fonts/Noto_Sans_JP/NotoSansJP-VariableFont_wght.ttf"
          crossOrigin="anonymous"
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
