export interface AccountIdentity {
  name?: string | null;
  email: string;
}

const localPart = (email: string) => email.split("@")[0] ?? email;

/**
 * The one name to put in front of a signed-in user.
 *
 * The two login routes populate `user.name` differently. Google hands over a
 * real display name; the email code flow has nothing to work with, so Better
 * Auth derives one from the address — which means a `name` of "yu" beside an
 * email of "yu@example.com" is not a name the user chose, it is the address
 * repeated back with the domain missing. Showing it would spend a line of the
 * sidebar saying less than the email already says.
 *
 * So a derived name is discarded and the address wins. A genuine display name
 * survives, and {@link isDerivedFromEmail} decides which one this is.
 *
 * This is the whole identity the sidebar prints — the address is a fallback,
 * not a subtitle, so an account with a real name never shows one.
 */
export const resolveAccountName = ({
  name,
  email,
}: AccountIdentity): string => {
  const trimmed = name?.trim() ?? "";

  if (!trimmed || isDerivedFromEmail(trimmed, email)) {
    return email;
  }

  return trimmed;
};

const isDerivedFromEmail = (name: string, email: string): boolean => {
  const normalized = name.toLowerCase();

  return (
    normalized === email.toLowerCase() ||
    normalized === localPart(email).toLowerCase()
  );
};
