import ProtectedSection from "@/components/protected-section";
import UserSettings from "@/components/user-settings";
export default function SettingsPage() {
  return <ProtectedSection returnTo="/settings"><UserSettings /></ProtectedSection>;
}
