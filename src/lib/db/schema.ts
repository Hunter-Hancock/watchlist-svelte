import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const userTable = sqliteTable("user", {
  id: text("id").primaryKey(),
  discord_id: text("discord_id").notNull(),
  username: text("username").notNull(),
  avatar: text("avatar").notNull(),
});

export const sessionTable = sqliteTable("session", {
  id: text("id").notNull().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id),
  expiresAt: integer("expires_at").notNull(),
});

export const typesTable = sqliteTable("types", {
  id: integer("id", { mode: "number" }).primaryKey({
    autoIncrement: true,
  }),
  name: text("name").notNull(),
});

export const genresTable = sqliteTable("genres", {
  id: integer("id", { mode: "number" }).primaryKey({
    autoIncrement: true,
  }),
  name: text("name").notNull(),
});

export const itemsTable = sqliteTable("items", {
  id: integer("id", { mode: "number" }).primaryKey({
    autoIncrement: true,
  }),
  title: text("title").notNull(),
  typeId: integer("type_id")
    .notNull()
    .references(() => typesTable.id),
  genreId: integer("genre_id")
    .notNull()
    .references(() => genresTable.id),
  image: text("image").notNull(),
  description: text("description"),
});

export const watchlistTable = sqliteTable("watchlist", {
  watchlistId: integer("watchlist_id", { mode: "number" }).primaryKey({
    autoIncrement: true,
  }),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id),
  itemId: integer("item_id")
    .notNull()
    .references(() => itemsTable.id),
  status: text("status", { enum: ["watched", "unwatched"] }).default(
    "unwatched"
  ),
  addedAt: integer("added_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});
