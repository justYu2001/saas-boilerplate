import { type Metadata } from "next";

import { PageHeader } from "@/components/dashboard/page-header";
import { SourceNote } from "@/components/dashboard/source-note";
import { DASHBOARD_PAGE_COPY } from "@/constants/dashboard";

const COPY = DASHBOARD_PAGE_COPY.overview;

export const metadata: Metadata = {
  title: COPY.title,
};

const DashboardOverviewPage = () => {
  return (
    <>
      <PageHeader title={COPY.title} description={COPY.description} />
      <SourceNote path={COPY.source} />
    </>
  );
};

export default DashboardOverviewPage;
