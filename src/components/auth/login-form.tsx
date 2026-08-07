"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, Mail } from "lucide-react";
import { useId, useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LOGIN_COPY, OAUTH_PROVIDERS } from "@/constants/auth";
import { loginSchema, type LoginInput } from "@/lib/auth/login-schema";
import { sendLoginCode, signInWithProvider } from "@/lib/auth/send-login-code";
import { cn } from "@/lib/utils";

type Status = { kind: "idle" } | { kind: "sent"; email: string };

const headingClassName =
  "font-heading text-2xl leading-tight font-semibold tracking-tight text-balance";
const subheadingClassName =
  "text-muted-foreground text-sm leading-relaxed text-pretty";

export function LoginForm() {
  const emailId = useId();
  const errorId = useId();
  const helperId = useId();

  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [pendingProvider, setPendingProvider] = useState<string | null>(null);

  const isProviderPending = pendingProvider !== null;
  const isBusy = isProviderPending;

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: { email: "" },
  });

  /** Field-level message wins over the form-level one; only one is shown. */
  const errorMessage = errors.email?.message ?? errors.root?.message;
  const isPending = isSubmitting || isProviderPending;

  const onSubmit = handleSubmit(async ({ email }) => {
    clearErrors("root");

    try {
      await sendLoginCode(email);
      setStatus({ kind: "sent", email });
    } catch {
      setError("root", { message: LOGIN_COPY.genericError });
    }
  });

  const onProviderClick = async (
    provider: (typeof OAUTH_PROVIDERS)[number],
  ) => {
    clearErrors("root");
    setPendingProvider(provider.id);

    try {
      await signInWithProvider(provider.id);
    } catch {
      setError("root", { message: LOGIN_COPY.genericError });
    } finally {
      setPendingProvider(null);
    }
  };

  const startOver = () => {
    setStatus({ kind: "idle" });
    reset({ email: "" });
  };

  /*
   * Once the code is on its way the card belongs entirely to that message:
   * the provider button and the "or continue with email" divider introduced a
   * choice that has already been made.
   */
  if (status.kind === "sent") {
    return (
      <>
        <CardHeader role="status" className="gap-2 text-center">
          <h1 className={headingClassName}>{LOGIN_COPY.sentTitle}</h1>
          <p className={subheadingClassName}>
            {LOGIN_COPY.sentBody(status.email)}
          </p>
        </CardHeader>
        <CardContent>
          <Button
            type="button"
            variant="outline"
            className="h-11 w-full text-sm font-medium"
            onClick={startOver}
          >
            {LOGIN_COPY.sentReset}
          </Button>
        </CardContent>
      </>
    );
  }

  return (
    <>
      <CardHeader className="gap-2 text-center">
        <h1 className={headingClassName}>{LOGIN_COPY.title}</h1>
        <p className={subheadingClassName}>{LOGIN_COPY.subtitle}</p>
      </CardHeader>

      <CardContent className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          {OAUTH_PROVIDERS.map((provider) => {
            const Icon = provider.icon;
            const isThisProviderPending = pendingProvider === provider.id;

            return (
              <Button
                key={provider.id}
                type="button"
                variant="outline"
                className="h-11 w-full gap-2.5 text-sm font-medium"
                disabled={isPending}
                aria-busy={isThisProviderPending}
                onClick={() => onProviderClick(provider)}
              >
                {isThisProviderPending ? (
                  <LoaderCircle
                    aria-hidden="true"
                    className="size-4 animate-spin"
                  />
                ) : (
                  <Icon className="size-4" />
                )}
                {provider.label}
              </Button>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="bg-border h-px flex-1" />
          <span className="text-muted-foreground text-xs">
            {LOGIN_COPY.dividerLabel}
          </span>
          <span aria-hidden="true" className="bg-border h-px flex-1" />
        </div>

        <form noValidate onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col">
            <Label htmlFor={emailId} className="mb-2">
              {LOGIN_COPY.emailLabel}
            </Label>

            <div className="relative">
              <Mail
                aria-hidden="true"
                className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2"
              />
              <Input
                id={emailId}
                type="email"
                autoComplete="email"
                inputMode="email"
                spellCheck={false}
                autoCapitalize="none"
                placeholder={LOGIN_COPY.emailPlaceholder}
                disabled={isBusy}
                aria-invalid={errors.email ? true : undefined}
                aria-describedby={errorMessage ? errorId : helperId}
                className="h-11 pl-10"
                {...register("email")}
              />
            </div>

            {/*
             * The message is revealed, not inserted. A collapsed grid row leaves
             * the resting layout untouched, fits a wrapped message without a
             * guessed height, and turns the card's re-centring into a deliberate
             * motion rather than a jump. The paragraph stays mounted so screen
             * readers announce into a live region that was already there —
             * freshly inserted alerts are missed by some of them. Padding lives
             * on the inner span so it collapses with the row.
             */}
            <div
              className={cn(
                "grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] motion-reduce:transition-none",
                errorMessage ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
              )}
            >
              <p
                id={errorId}
                role="alert"
                className="text-destructive overflow-hidden text-sm leading-snug"
              >
                {/*
                 * The room opens first and the message settles into it a beat
                 * later, so the reveal reads as one soft movement rather than a
                 * wipe. Leaving is undelayed — an error should clear promptly
                 * once it no longer applies.
                 */}
                <span
                  className={cn(
                    "block pt-2 transition-[opacity,translate] duration-300 ease-out motion-reduce:transition-none",
                    errorMessage
                      ? "translate-y-0 opacity-100 delay-75"
                      : "-translate-y-0.5 opacity-0",
                  )}
                >
                  {errorMessage}
                </span>
              </p>
            </div>
          </div>

          <Button
            type="submit"
            className="h-11 w-full gap-2 text-sm font-medium"
            disabled={isPending}
            aria-busy={isSubmitting}
          >
            {isSubmitting && (
              <LoaderCircle
                aria-hidden="true"
                className="size-4 animate-spin"
              />
            )}
            {isSubmitting ? LOGIN_COPY.submitPending : LOGIN_COPY.submit}
          </Button>

          <p
            id={helperId}
            className="text-muted-foreground text-center text-xs leading-relaxed"
          >
            {LOGIN_COPY.helper}
          </p>
        </form>
      </CardContent>
    </>
  );
}
