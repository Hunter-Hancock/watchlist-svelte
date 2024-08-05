import { dev } from "$app/environment";
import { DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET } from "$env/static/private";
import { adapter } from "$lib/db";
import { Discord } from "arctic";
import { Lucia } from "lucia";

const baseUrl = process.env.VERCEL_URL
  ? `https://sfquiz-svelte.vercel.app`
  : "http://localhost:5173";

export const discord = new Discord(
  DISCORD_CLIENT_ID,
  DISCORD_CLIENT_SECRET,
  `${baseUrl}/login/discord/callback`
);

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      secure: !dev,
    },
  },
  getUserAttributes: (attributes) => {
    return {
      username: attributes.username,
      avatar: attributes.avatar,
    };
  },
});

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
}

interface DatabaseUserAttributes {
  username: string;
  avatar: string;
}
