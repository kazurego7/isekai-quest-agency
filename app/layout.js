import { Shippori_Mincho, Zen_Kaku_Gothic_New } from "next/font/google";
import "./globals.css";

const mincho = Shippori_Mincho({
  variable: "--font-mincho",
  weight: ["400", "500", "600"],
  subsets: ["latin", "japanese"],
});

const gothic = Zen_Kaku_Gothic_New({
  variable: "--font-gothic",
  weight: ["400", "500", "700"],
  subsets: ["latin", "japanese"],
});

export const metadata = {
  title: "異世界クエスト斡旋アプリ",
  description: "ギルド運営の依頼・クエスト・報酬管理を一元化する業務基盤。",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body className={`${mincho.variable} ${gothic.variable}`}>
        {children}
      </body>
    </html>
  );
}
