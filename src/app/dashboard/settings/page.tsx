import { type Metadata } from "next";

import { AccountSection } from "@/components/dashboard/account-section";
import { PageHeader } from "@/components/dashboard/page-header";
import { DASHBOARD_PAGE_COPY } from "@/constants/dashboard";
import { requireSession } from "@/server/better-auth/server";

const COPY = DASHBOARD_PAGE_COPY.settings;

export const metadata: Metadata = {
  title: COPY.title,
};

const DashboardSettingsPage = async () => {
  const { user } = await requireSession();

  /*
   * Capped, unlike the overview. Settings is a record: a label beside a value,
   * and an explanation beside the button it explains. Let the canvas run to a
   * desktop's full width and both pairs come apart — the button ends up a foot
   * from the sentence that justifies it. The rule under the heading stops at
   * the same place, so the cap reads as the page's width rather than as
   * content that failed to fill it.
   */
  return (
    <div className="max-w-3xl">
      <PageHeader title={COPY.title} description={COPY.description} />

      <AccountSection
        user={{
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
        }}
      />
    </div>
  );
};

export default DashboardSettingsPage;
