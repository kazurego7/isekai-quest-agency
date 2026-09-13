"use client";
import { appFetch } from "@/lib/app-path";
import { useState } from "react";
import { Monitor, Sun, Moon, Palette } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { useAgencyTheme } from "@/components/agency-theme";
const choices = [
  { value: "system", title: "システムデフォルト", description: "PC・スマートフォンの外観設定に合わせて、自動で切り替えます。", icon: Monitor },
  { value: "light", title: "ライトに固定", description: "陽光に包まれた王都。明るい羊皮紙と金の装飾で、冒険の支度を。", icon: Sun },
  { value: "dark", title: "ダークに固定", description: "星明かりのギルド。深い紺と落ち着いた金で、夜の冒険に備えて。", icon: Moon },
];
export default function UserSettings() {
  const { preference, setPreference } = useAgencyTheme();
  const [selected, setSelected] = useState(preference);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  async function save(event) {
    event.preventDefault(); setPending(true); setError(""); setMessage("");
    try {
      const response = await appFetch("/api/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ themePreference: selected }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "設定を保存できませんでした。");
      setPreference(data.themePreference); setMessage("外観の設定を保存しました。");
    } catch (error) { setError(error.message || "設定を保存できませんでした。もう一度お試しください。"); }
    finally { setPending(false); }
  }
  return <div className="page-wrap settings-page">
    <div className="page-heading"><div><p className="eyebrow">YOUR GUILD PREFERENCES</p><h1>ユーザー設定</h1><p>あなたに合った装いで、次の冒険へ。</p></div></div>
    <form className="guild-document" onSubmit={save}>
      <div className="document-heading"><Palette size={28}/><div><p className="eyebrow">APPEARANCE</p><h2 id="appearance-title">外観のテーマ</h2></div></div>
      <div className="document-body"><p className="quiet settings-intro">このアカウントで使うテーマを選べます。設定はログイン後も引き継がれます。</p>
        <RadioGroup aria-labelledby="appearance-title" value={selected} disabled={pending} onValueChange={value => { setSelected(value); setMessage(""); setError(""); }}>
          {choices.map(({ value, title, description, icon: Icon }) => <label key={value} className="theme-option" data-selected={selected === value} htmlFor={`theme-${value}`}>
            <Icon size={25} aria-hidden="true"/><span><strong>{title}</strong><span>{description}</span></span><RadioGroupItem id={`theme-${value}`} value={value} aria-label={title}/>
          </label>)}
        </RadioGroup>
        {error && <p role="alert" className="action-error">{error}</p>}
        <p role="status" className="settings-status">{message}</p>
      </div>
      <div className="document-actions"><Button type="submit" disabled={pending || selected === preference}>{pending ? "保存中…" : "設定を保存"}</Button></div>
    </form>
  </div>;
}
