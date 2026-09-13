"use client";
import { appPath } from "@/lib/app-path";
import Image from "next/image";
import { useState } from "react";
import { Trash2, ImageIcon } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/quest-ui/button";
export default function QuestPhotos({ photos = [], onRemove, disabled = false }) { const [active, setActive] = useState(null); return <>{photos.length ? <div className="photo-grid">{photos.map((p, i) => <figure key={p.id || i}><button type="button" onClick={() => setActive(p)} aria-label={`${p.name || p.label || "成果写真"}を拡大`}><Image src={appPath(p.url)} alt={p.name || p.label || "成果写真"} width={400} height={280} unoptimized/></button><figcaption><span>{p.name || p.label || "成果写真"}</span>{onRemove && <Button variant="ghost" size="icon" disabled={disabled} aria-label={`${p.name || p.label || "写真"}を削除`} onClick={() => onRemove(p.id)}><Trash2 size={16}/></Button>}</figcaption></figure>)}</div> : <div className="photo-empty"><ImageIcon size={28} strokeWidth={1}/><p>成果写真はまだありません</p></div>}<Dialog open={Boolean(active)} onOpenChange={open => { if (!open)
    setActive(null); }}><DialogContent className="guild-dialog sm:max-w-3xl"><DialogTitle>{active?.name || active?.label || "成果写真"}</DialogTitle><DialogDescription className="sr-only">成果写真の拡大表示</DialogDescription>{active && <Image src={appPath(active.url)} alt={active.name || active.label || "成果写真"} width={1200} height={900} unoptimized className="max-h-[70vh] w-full object-contain"/>}</DialogContent></Dialog></>; }
