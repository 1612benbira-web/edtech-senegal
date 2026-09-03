"use server";

import { markMessageRead } from "@/lib/services/messageService";

export async function markMessageReadAction(messageId: string): Promise<void> {
  await markMessageRead(messageId);
}
