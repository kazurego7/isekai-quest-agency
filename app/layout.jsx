import "./globals.css";
import { isLocalRuntime } from "@/lib/local-runtime";
import { appPath } from "@/lib/app-path";
import "./mobile-workspace.css";
import { themeBootstrap } from "@/lib/theme-bootstrap";
import AgencyShell from "@/components/agency-shell";
import { AgencyThemeProvider } from "@/components/agency-theme";
import AppSessionProvider from "@/components/session-provider";
import { getSessionUser } from "@/lib/session";
export const dynamic = "force-dynamic";
export const metadata = { title: "異世界クエスト斡旋アプリ", description: "依頼の受付から冒険者の選定、写真付き完了報告まで。", icons: { icon: [{ url: appPath("/favicon.ico") }, { url: appPath("/icon.png"), type: "image/png" }], apple: appPath("/apple-icon.png") } };
export default async function RootLayout({ children }) {
    let user = null, unavailable = false;
    try {
        user = await getSessionUser();
    }
    catch (error) {
        console.error(error);
        unavailable = true;
    }
    return <html lang="ja" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: themeBootstrap(user?.themePreference) }} /></head><body className="min-h-screen bg-background text-foreground antialiased">
    <AgencyThemeProvider key={user?.id || "anonymous"} initialPreference={user?.themePreference || "system"}>
    <AppSessionProvider user={user}>
      {unavailable ? <div role="alert" className="p-6">データを読み込めません。時間をおいて再読み込みしてください。</div> : <>
        {isLocalRuntime && <nav aria-label="ローカル検証" className="dev-toolbar"><span>ローカル検証</span><a href={appPath("/__test/signin?actor=reception")}>受付</a><a href={appPath("/__test/signin?actor=general")}>冒険者A</a><a href={appPath("/__test/signin?actor=general2")}>冒険者B</a><a href={appPath("/__test/signout")}>未ログイン</a></nav>}
        <AgencyShell user={user}>{children}</AgencyShell>
      </>}
    </AppSessionProvider>
    </AgencyThemeProvider>
  </body></html>;
}
