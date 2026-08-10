import { DeleteAccountDialog } from "@/components/dashboard/delete-account-dialog";
import { ACCOUNT_COPY } from "@/constants/account";
import { resolveAccountName, type AccountIdentity } from "@/lib/account";

export interface AccountSectionUser extends AccountIdentity {
  /** When the account was created, straight from the `user` row. */
  createdAt: Date;
}

interface AccountSectionProps {
  user: AccountSectionUser;
}

/**
 * A fixed locale rather than the server's.
 *
 * This renders once, on a machine whose regional settings are a deployment
 * detail, and the string it produces is baked into the HTML. Reading the
 * host's locale would make the date format depend on which container answered.
 * A localised product replaces this with the visitor's own locale, resolved
 * from a header or a preference — not from `Intl`'s default.
 */
const memberSinceFormat = new Intl.DateTimeFormat("en-US", {
  dateStyle: "long",
});

/**
 * One labelled fact about the account.
 *
 * Label and value share a row from `sm` up and stack below it, so the label
 * column can be wide enough to read without squeezing an email address onto
 * two lines on a phone.
 */
function AccountRow({ label, children }: { label: string; children: string }) {
  return (
    <div className="grid gap-0.5 py-3 sm:grid-cols-[9rem_1fr] sm:items-baseline sm:gap-4">
      <dt className="text-muted-foreground text-sm">{label}</dt>
      <dd className="text-foreground text-sm font-medium wrap-break-word">
        {children}
      </dd>
    </div>
  );
}

/**
 * The account's own record, and the one control that ends it.
 *
 * Rows on the flat canvas rather than in a card, following the page header's
 * lead: the rail already draws the only border this layout needs, and boxing a
 * three-line record would put a second frame inside it for nothing.
 *
 * What separates the destructive block from the record above is the colour of
 * a single rule. Everything on this page is bordered in `--border` except that
 * one line, which is the destructive hue — enough to mark a change of register
 * on the way down the page, and much less than the red-bordered panel the
 * pattern usually attracts. The button carries the rest.
 */
export function AccountSection({ user }: AccountSectionProps) {
  /*
   * `resolveAccountName` answers with the address when the stored name is one
   * Better Auth derived from it, which is what the email-code flow leaves
   * behind. A row reading "Name: ada" above "Email: ada@example.com" would be
   * presenting that guess as something the user chose, so the row only appears
   * when there is a real name to put in it.
   */
  const name = resolveAccountName(user);
  const hasChosenName = name !== user.email;

  return (
    // A fixed id rather than a generated one: this is a server component, so
    // `useId` is not available, and the section is meant to appear once per
    // page. It doubles as the fragment a link to this section would target.
    <section aria-labelledby="account-heading" className="mt-10">
      <h2
        id="account-heading"
        className="font-heading text-foreground text-base font-medium"
      >
        {ACCOUNT_COPY.sectionTitle}
      </h2>

      <dl className="divide-border mt-5 divide-y">
        <AccountRow label={ACCOUNT_COPY.emailLabel}>{user.email}</AccountRow>

        {hasChosenName && (
          <AccountRow label={ACCOUNT_COPY.nameLabel}>{name}</AccountRow>
        )}

        <AccountRow label={ACCOUNT_COPY.memberSinceLabel}>
          {memberSinceFormat.format(user.createdAt)}
        </AccountRow>
      </dl>

      {/*
        The button holds its own width and the explanation takes what is left,
        down to a 20rem floor — below that it drops to its own line rather than
        squeezing "Delete this account" onto three.
      */}
      <div className="border-destructive/25 mt-10 flex flex-wrap items-start justify-between gap-x-10 gap-y-5 border-t pt-6">
        <div className="min-w-0 flex-1 basis-80">
          <h3 className="text-foreground text-sm font-medium">
            {ACCOUNT_COPY.deleteHeading}
          </h3>

          <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">
            {ACCOUNT_COPY.deleteDescription}
          </p>
        </div>

        <DeleteAccountDialog />
      </div>
    </section>
  );
}
