import { db } from "$lib/db/index.js";
import { itemsTable, watchlistTable } from "$lib/db/schema";
import { redirect } from "@sveltejs/kit";
import { and, desc, eq } from "drizzle-orm";

export const load = async ({ locals }) => {
  const user = locals.user;

  if (!user) redirect(302, "/login");
  const items = await db
    .select()
    .from(watchlistTable)
    .where(
      and(
        eq(watchlistTable.userId, user.id),
        eq(watchlistTable.status, "watched")
      )
    )
    .innerJoin(itemsTable, eq(watchlistTable.itemId, itemsTable.id))
    .orderBy(desc(watchlistTable.addedAt));

  return {
    items,
  };
};

export const actions = {
  unwatch: async ({ request }) => {
    const data = await request.formData();
    const itemId = data.get("id");

    if (!itemId) return;

    await db
      .update(watchlistTable)
      .set({
        status: "unwatched",
      })
      .where(eq(watchlistTable.watchlistId, +itemId));
  },
};
