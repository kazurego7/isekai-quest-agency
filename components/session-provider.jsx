"use client";
import { createContext, useContext } from "react";
const SessionContext=createContext(null);
export default function AppSessionProvider({user,children}) { return <SessionContext.Provider value={user}>{children}</SessionContext.Provider>; }
export function useCurrentUser() { return useContext(SessionContext); }
