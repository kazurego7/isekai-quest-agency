import { redirect } from "next/navigation";
import { appPath } from "@/lib/app-path";
import { Compass, ArrowRight, ScrollText, Swords, CircleCheck } from "lucide-react";
import { getSessionUser } from "@/lib/session";
import { chatGPTSignInPath } from "@/app/chatgpt-auth";
import { resolveRoleHome } from "@/lib/role-route";
export const dynamic = "force-dynamic";
export default async function Home() { const user = await getSessionUser(); if (user)
    redirect(resolveRoleHome(user.userType, user.role)); return <main className="login-layout"><section className="login-story"><div className="agency-brand"><Compass size={40}/><span>QUEST<span className="brand-sub">ISEKAI QUEST AGENCY</span></span></div><div className="login-title"><p className="eyebrow">YOUR NEXT CHAPTER AWAITS</p><h1>まだ見ぬ世界へ。<br />次の冒険は、ここから。</h1><p>誰かの願いが、あなたのクエストになる。<br />依頼と冒険者をつなぐ、異世界のギルドへようこそ。</p></div><div className="login-steps">{[[ScrollText, "01", "依頼を届ける"], [Swords, "02", "クエストに挑む"], [CircleCheck, "03", "成果を報告する"]].map(([Icon, n, label]) => <div key={n}><Icon size={22}/><span>{n}</span><strong>{label}</strong></div>)}</div></section><section className="login-entry"><div><p className="eyebrow">ENTER THE GUILD</p><h2>ギルドへ入る</h2><p>依頼の確認も、新たな冒険の準備も。<br />あなたのアカウントで始めましょう。</p><a href={appPath(chatGPTSignInPath("/"))} target="_top" className="login-button">ChatGPTでログイン<ArrowRight size={20}/></a><p className="login-note">ChatGPTアカウントで利用できます。</p></div><span className="login-footer">異世界クエスト斡旋所</span></section></main>; }
