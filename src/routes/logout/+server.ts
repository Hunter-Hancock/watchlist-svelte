import { lucia } from "$lib/server/auth";
import { fail, redirect } from "@sveltejs/kit";

export const GET = async (event) => {
  if (!event.locals.session) {
    fail(401);
  }
  const session = event.locals.session;
  if (session) {
    await lucia.invalidateSession(session.id);
    const sessionCookie = lucia.createBlankSessionCookie();
    event.cookies.set(sessionCookie.name, sessionCookie.value, {
      path: ".",
      ...sessionCookie.attributes,
    });
  }
  redirect(302, "/");
};
