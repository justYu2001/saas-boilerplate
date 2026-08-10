import { type Metadata } from "next";

import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { APP_NAME } from "@/constants/app";
import { LOGIN_COPY } from "@/constants/auth";

export const metadata: Metadata = {
  title: `Log in · ${APP_NAME}`,
  description: LOGIN_COPY.subtitle,
  // Authentication surfaces carry no public content and should never be
  // indexed; they are deliberately absent from the sitemap for the same reason.
  robots: { index: false, follow: false },
};

const LoginPage = () => {
  return (
    <AuthShell>
      <LoginForm />
    </AuthShell>
  );
};

export default LoginPage;
