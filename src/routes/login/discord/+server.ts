import { discord } from "$lib/server/auth";
import { redirect } from "@sveltejs/kit";
import { generateState } from "arctic";

import type { RequestEvent } from "@sveltejs/kit";

export async function GET(event: RequestEvent): Promise<Response> {
  const state = generateState();
  const scopes = ["identify", "email"];
  const url = await discord.createAuthorizationURL(state, { scopes });

  event.cookies.set("discord_oauth_state", state, {
    path: "/",
    secure: import.meta.env.PROD,
    httpOnly: true,
    maxAge: 60 * 1350,
    sameSite: "lax",
  });

  redirect(302, url.toString());
}
