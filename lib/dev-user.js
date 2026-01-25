"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

const storageKey = (role) => `dev-user:${role}`;
const isEnabled = process.env.NODE_ENV !== "production";

export function useDevUser(role) {
  const [users, setUsers] = useState([]);
  const [userId, setUserId] = useState("");
  const [ready, setReady] = useState(!isEnabled);

  useEffect(() => {
    if (!isEnabled || !role) {
      setReady(true);
      return;
    }
    let active = true;
    fetch("/api/users")
      .then((response) => response.json())
      .then((data) => {
        if (!active) return;
        const allUsers = Array.isArray(data.users) ? data.users : [];
        const roleUsers = allUsers.filter((user) => user.role === role);
        setUsers(roleUsers);
        const savedId = window.localStorage.getItem(storageKey(role));
        const nextUserId =
          roleUsers.find((user) => user.id === savedId)?.id ?? roleUsers[0]?.id ?? "";
        setUserId(nextUserId);
      })
      .catch(() => {
        if (!active) return;
        setUsers([]);
        setUserId("");
      })
      .finally(() => {
        if (!active) return;
        setReady(true);
      });
    return () => {
      active = false;
    };
  }, [role]);

  useEffect(() => {
    if (!isEnabled || !role) return;
    if (userId) {
      window.localStorage.setItem(storageKey(role), userId);
    } else {
      window.localStorage.removeItem(storageKey(role));
    }
  }, [role, userId]);

  const user = useMemo(() => users.find((candidate) => candidate.id === userId) ?? null, [users, userId]);

  const selectUser = useCallback((nextId) => {
    setUserId(nextId);
  }, []);

  return {
    user,
    users,
    userId,
    selectUser,
    ready,
    isEnabled,
  };
}
