import ProtectedSection from "@/components/protected-section";
export default function NewRequestLayout({children}) {return <ProtectedSection type="general" returnTo="/requests/new">{children}</ProtectedSection>;}
