import ProtectedSection from "@/components/protected-section";
export const dynamic="force-dynamic";
export default function Layout({children}) {return <ProtectedSection returnTo="/requests">{children}</ProtectedSection>;}
