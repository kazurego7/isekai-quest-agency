"use client";
import { useId } from "react";
export default function MobileSectionSelect({ label, value, onChange, groups }) {
  const id = useId();
  return <div className="mobile-section-select"><label htmlFor={id}>{label}</label><select id={id} value={value} onChange={event => onChange(event.target.value)}>{groups.map(group => <option key={group.id} value={group.id}>{group.label}（{group.items.length}件）</option>)}</select></div>;
}
