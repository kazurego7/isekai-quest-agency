import ProtectedSection from "@/components/protected-section";
export const dynamic="force-dynamic";
export default function Layout({children}) {return <ProtectedSection type="staff" returnTo="/reception">{children}</ProtectedSection>;}
