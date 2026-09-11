export function resolveRoleHome(userType, role) {
  if (userType === "staff" && role === "reception") {
    return "/reception";
  }
  if (userType === "general") {
    return "/requests";
  }
  return "/";
}

export function canAccessPath(userType, role, pathname) {
  if (!userType || !pathname) return false;

  if (pathname.startsWith("/api/")) {
    return true;
  }

  if (userType === "staff" && role === "reception") {
    return pathname.startsWith("/reception") || pathname.startsWith("/requests");
  }

  if (userType === "general") {
    if (pathname.startsWith("/requests/reception")) {
      return false;
    }
    return pathname.startsWith("/requests") || pathname.startsWith("/adventurer");
  }

  return false;
}
