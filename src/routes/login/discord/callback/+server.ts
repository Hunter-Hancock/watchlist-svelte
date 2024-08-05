import { discord, lucia } from "$lib/server/auth";
import { OAuth2RequestError } from "arctic";
import { generateIdFromEntropySize } from "lucia";

import { db } from "$lib/db";
import { userTable } from "$lib/db/schema";
import type { RequestEvent } from "@sveltejs/kit";
import { eq } from "drizzle-orm";

export async function GET(event: RequestEvent): Promise<Response> {
  const code = event.url.searchParams.get("code");
  const state = event.url.searchParams.get("state");
  const storedState = event.cookies.get("discord_oauth_state") ?? null;

  if (!code || !state || !storedState || state !== storedState) {
    return new Response(null, {
      status: 400,
    });
  }

  try {
    const tokens = await discord.validateAuthorizationCode(code);
    const discordUserResponse = await fetch(
      "https://discord.com/api/users/@me",
      {
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      }
    );

    const user: DiscordUser = await discordUserResponse.json();

    const existingUser = await db.query.userTable.findFirst({
      where: eq(userTable.discord_id, user.id),
    });

    if (existingUser) {
      const session = await lucia.createSession(existingUser.id, {});
      const sessionCookie = lucia.createSessionCookie(session.id);
      event.cookies.set(sessionCookie.name, sessionCookie.value, {
        path: ".",
        ...sessionCookie.attributes,
      });
    } else {
      const userId = generateIdFromEntropySize(10); // 16 characters long

      await db.insert(userTable).values({
        id: userId,
        discord_id: user.id,
        username: user.global_name,
        avatar:
          "https://cdn.discordapp.com/avatars/" +
          user.id +
          "/" +
          user.avatar +
          ".png",
      });

      const session = await lucia.createSession(userId, {});
      const sessionCookie = lucia.createSessionCookie(session.id);
      event.cookies.set(sessionCookie.name, sessionCookie.value, {
        path: ".",
        ...sessionCookie.attributes,
      });
    }
    return new Response(null, {
      status: 302,
      headers: {
        Location: "/",
      },
    });
  } catch (e) {
    console.log(e);
    // the specific error message depends on the provider
    if (e instanceof OAuth2RequestError) {
      // invalid code
      return new Response(null, {
        status: 400,
      });
    }
    return new Response(null, {
      status: 500,
    });
  }
}

export interface DiscordUser {
  id: string;
  global_name: string;
  avatar: string;
  email: string;
}
