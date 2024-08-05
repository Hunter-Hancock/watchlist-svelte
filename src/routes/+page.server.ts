import { GOOGLE_KEY } from "$env/static/private";
import { db } from "$lib/db/index";
import {
  genresTable,
  itemsTable,
  typesTable,
  watchlistTable,
} from "$lib/db/schema.js";
import { redirect } from "@sveltejs/kit";
import { and, desc, eq } from "drizzle-orm";
import { fail, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { addFormSchema } from "./schema.js";

export const load = async (event) => {
  event.depends("custom:items");

  const user = event.locals.user;

  let type = event.url.searchParams.get("test");

  if (!user) {
    redirect(302, "/login");
  }

  const types = await db.query.typesTable.findMany();
  const genres = await db.query.genresTable.findMany();

  let items;
  let the_type;

  if (type) {
    the_type = await db.query.typesTable.findFirst({
      where: eq(typesTable.name, type),
    });
  }

  if (the_type) {
    items = await db
      .select()
      .from(watchlistTable)
      .where(eq(watchlistTable.userId, user.id))
      .innerJoin(
        itemsTable,
        and(
          eq(watchlistTable.itemId, itemsTable.id),
          eq(itemsTable.typeId, the_type.id),
          eq(watchlistTable.status, "unwatched")
        )
      )
      .innerJoin(genresTable, eq(itemsTable.genreId, genresTable.id))
      .innerJoin(typesTable, eq(itemsTable.typeId, typesTable.id))
      .orderBy(desc(watchlistTable.addedAt));
  } else {
    items = await db
      .select()
      .from(watchlistTable)
      .where(
        and(
          eq(watchlistTable.userId, user.id),
          eq(watchlistTable.status, "unwatched")
        )
      )
      .innerJoin(itemsTable, eq(watchlistTable.itemId, itemsTable.id))
      .innerJoin(genresTable, eq(itemsTable.genreId, genresTable.id))
      .innerJoin(typesTable, eq(itemsTable.typeId, typesTable.id))
      .orderBy(desc(watchlistTable.addedAt));
  }

  const form = await superValidate(event, zod(addFormSchema));

  return {
    form,
    types,
    genres,
    user,
    items,
  };
};

export const actions = {
  add: async ({ request, locals, fetch }) => {
    const user = locals.user;

    if (!user) {
      return fail(404, {});
    }

    let form = await superValidate(request, zod(addFormSchema));

    const { title, type, genre } = form.data;

    const type_name = await db.query.typesTable.findFirst({
      where: eq(typesTable.id, type),
    });

    if (!type_name) return;

    const req = await fetch(
      `https://customsearch.googleapis.com/customsearch/v1?key=${GOOGLE_KEY}&cx=d33879e09d50c4c43&q=${title}%20${type_name.name}&searchType=image`
    );

    const response = await req.json();

    const image = response.items[0].link;

    const result = await db
      .insert(itemsTable)
      .values({
        title,
        typeId: type,
        genreId: genre,
        image,
      })
      .returning({ insertedId: itemsTable.id });

    await db.insert(watchlistTable).values({
      itemId: result[0].insertedId,
      userId: user.id,
    });

    return {
      form,
    };
  },

  watch: async ({ request, locals }) => {
    const user = locals.user;
    const data = await request.formData();
    const itemId = data.get("id");

    if (!itemId) return;

    await db
      .update(watchlistTable)
      .set({
        status: "watched",
      })
      .where(eq(watchlistTable.watchlistId, +itemId));
  },
};
