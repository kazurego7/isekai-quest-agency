export function isGeneralUser(user) {
  return user?.userType === "general";
}

export function isReceptionStaff(user) {
  return user?.userType === "staff" && user?.role === "reception";
}

export function assertAuthenticatedSession(session) {
  if (!session?.user?.id) {
    return null;
  }
  return {
    id: String(session.user.id),
    name: String(session.user.name ?? ""),
    role: String(session.user.role ?? ""),
    userType: String(session.user.userType ?? ""),
  };
}
