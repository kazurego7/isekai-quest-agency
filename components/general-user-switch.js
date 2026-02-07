import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function GeneralUserSwitch({ currentArea, size = "sm" }) {
  const isRequests = currentArea === "requests";
  const href = isRequests ? "/adventurer" : "/requests";
  const label = isRequests ? "冒険者ページへ" : "依頼者ページへ";

  return (
    <Button size={size} variant="outline" asChild>
      <Link href={href}>{label}</Link>
    </Button>
  );
}
