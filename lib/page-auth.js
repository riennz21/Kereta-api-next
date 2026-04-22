import { getSafeAdminPath, isAdminRequest } from "./auth";

export function requireAdminPage(context, fallback = "/admin/dashboard") {
  if (isAdminRequest(context.req)) {
    return null;
  }

  return {
    redirect: {
      destination: `/admin?next=${encodeURIComponent(getSafeAdminPath(context.resolvedUrl, fallback))}`,
      permanent: false,
    },
  };
}

export function redirectAdminHome(context, fallback = "/admin/dashboard") {
  if (!isAdminRequest(context.req)) {
    return null;
  }

  return {
    redirect: {
      destination: getSafeAdminPath(context.query.next, fallback),
      permanent: false,
    },
  };
}
