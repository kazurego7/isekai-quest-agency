import "./globals.css";
import { cn } from "@/lib/utils";
import SessionToolbar from "@/components/session-toolbar";
import AppSessionProvider from "@/components/session-provider";

export const metadata = {
  title: "異世界クエスト斡旋アプリ",
  description: "ギルド運営の依頼・クエスト・報酬管理を一元化する業務基盤。",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background text-foreground antialiased")} suppressHydrationWarning>
        <AppSessionProvider>
          <SessionToolbar />
          {children}
        </AppSessionProvider>
      </body>
    </html>
  );
}
