"use server";

import { logoutAdmin } from "./auth-actions";

// Action untuk logout dari dashboard - void return type untuk form action
export async function handleLogout(formData: FormData): Promise<void> {
  await logoutAdmin();
  // Tidak perlu return karena logoutAdmin sudah melakukan redirect
} 