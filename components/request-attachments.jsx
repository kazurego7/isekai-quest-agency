"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { FileText, Paperclip, Eye, X, ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/quest-ui/button";
import { appPath } from "@/lib/app-path";
import { REQUEST_FILE_COUNT, REQUEST_FILE_BYTES, REQUEST_TOTAL_BYTES } from "@/lib/request-options";

function PdfAttachmentLink({ file }) {
  const localUrl=useRef(null);
  useEffect(()=>()=>{
    if(localUrl.current){URL.revokeObjectURL(localUrl.current);localUrl.current=null;}
  },[file.url]);
  function prepareLink(event){
    if(!file.url.startsWith("data:"))return;
    // Browsers block top-level data URLs. Unsaved PDFs use a local Blob URL.
    if(!localUrl.current){
      const binary=atob(file.url.slice(file.url.indexOf(",")+1));
      const bytes=Uint8Array.from(binary,c=>c.charCodeAt(0));
      localUrl.current=URL.createObjectURL(new Blob([bytes],{type:"application/pdf"}));
    }
    event.currentTarget.href=localUrl.current;
  }
  return <a className="attachment-preview-button" href={appPath(file.url)} target="_blank" rel="noopener noreferrer" onClick={prepareLink} aria-label={`${file.name}を別タブで開く`}><FileText size={30}/><span><strong>{file.name}</strong><small>PDF · {Math.ceil(file.bytes/1024).toLocaleString()} KB · 別タブで開く</small></span><ExternalLink size={18}/></a>;
}

export default function RequestAttachments({files=[],onChange,disabled=false,onBusyChange,reservedFiles=[]}) {
  const [active,setActive]=useState(null),[error,setError]=useState(""),[busy,setBusy]=useState(false);
  const working=useRef(false);
  async function select(event){
    const chosen=Array.from(event.target.files||[]);event.target.value="";
    if(!chosen.length||working.current)return;
    setError("");
    if(reservedFiles.length+files.length+chosen.length>REQUEST_FILE_COUNT){setError("添付は5件までです。");return;}
    if(chosen.some(f=>!["image/jpeg","image/png","image/webp","application/pdf"].includes(f.type))){setError("JPEG・PNG・WebP画像またはPDFを選んでください。");return;}
    if(chosen.some(f=>f.size>REQUEST_FILE_BYTES)){setError("1件5MBまでのファイルを選んでください。");return;}
    if([...reservedFiles,...files,...chosen].reduce((total,f)=>total+(f.bytes??f.size??0),0)>REQUEST_TOTAL_BYTES){setError("添付は合計10MBまでです。");return;}
    working.current=true;setBusy(true);onBusyChange?.(true);
    try{
      const added=await Promise.all(chosen.map(file=>new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve({id:crypto.randomUUID(),name:file.name,type:file.type,bytes:file.size,url:reader.result});reader.onerror=()=>reject(new Error("ファイルを読み込めませんでした。"));reader.readAsDataURL(file);})));onChange([...files,...added]);
    }catch(e){setError(e.message);}finally{working.current=false;setBusy(false);onBusyChange?.(false);}
  }
  return <div className="request-attachments">
    {onChange && <><label className="attachment-upload"><Paperclip size={20}/><span>{busy?"読み込み中…":"画像・PDFを追加"}</span><input type="file" multiple accept="image/jpeg,image/png,image/webp,application/pdf" aria-label="添付ファイルを追加" disabled={disabled||busy||reservedFiles.length+files.length>=5} onChange={select}/></label><p className="attachment-help">最大5件・1件5MB・合計10MBまで。画像はプレビュー、PDFは別タブで開きます。</p></>}
    {error && <p className="action-error" role="alert">{error}</p>}
    {files.length ? <ul className="attachment-list">{files.map(file=><li key={file.id}>{file.type==="application/pdf"?<PdfAttachmentLink file={file}/>:<button type="button" className="attachment-preview-button" onClick={()=>setActive(file)} aria-label={`${file.name}をプレビュー`}><Image src={appPath(file.url)} width={48} height={48} alt="" unoptimized/><span><strong>{file.name}</strong><small>画像 · {Math.ceil(file.bytes/1024).toLocaleString()} KB</small></span><Eye size={18}/></button>}{onChange && <Button type="button" size="icon" variant="ghost" aria-label={`${file.name}を削除`} disabled={disabled||busy} onClick={()=>onChange(files.filter(x=>x.id!==file.id))}><X size={18}/></Button>}</li>)}</ul>:!onChange&&<p className="quiet">添付なし</p>}
    <Dialog open={Boolean(active)} onOpenChange={open=>{if(!open)setActive(null);}}><DialogContent className="guild-dialog attachment-dialog"><DialogTitle>{active?.name||"添付ファイル"}</DialogTitle><DialogDescription>添付ファイルのプレビュー</DialogDescription>{active && <><div className="attachment-preview-body"><Image src={appPath(active.url)} width={1400} height={1000} alt={active.name} unoptimized className="attachment-full-image"/></div><a className="attachment-open-link" href={appPath(active.url)} target="_blank" rel="noopener noreferrer">ファイルを別画面で開く</a></>}</DialogContent></Dialog>
  </div>;
}
