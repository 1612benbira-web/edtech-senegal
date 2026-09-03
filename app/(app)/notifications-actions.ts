"use server";

import { revalidatePath } from "next/cache";
import { markNotificationRead, markAllNotificationsRead } from "@/lib/services/notificationService";

export async function markNotificationReadAction(notificationId: string): Promise<{ error?: string }> {
  try {
    await markNotificationRead(notificationId);
    revalidatePath("/", "layout");
    return {};
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export async function markAllNotificationsReadAction(): Promise<{ error?: string }> {
  try {
    await markAllNotificationsRead();
    revalidatePath("/", "layout");
    return {};
  } catch (e) {
    return { error: (e as Error).message };
  }
}
