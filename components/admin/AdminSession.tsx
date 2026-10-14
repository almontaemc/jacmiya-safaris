"use client";

import { createContext, useContext } from "react";
import type { AdminUser } from "@/types/admin";

export type SessionUser = Omit<AdminUser, "password">;

const AdminSessionContext = createContext<SessionUser | null>(null);

export const AdminSessionProvider = AdminSessionContext.Provider;

/** The signed-in account. Only null on the login page — AdminShell renders nothing else until it knows. */
export function useAdminUser(): SessionUser | null {
  return useContext(AdminSessionContext);
}
