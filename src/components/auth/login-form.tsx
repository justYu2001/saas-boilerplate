"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { LoaderCircle, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import {
  LOGIN_CODE_LENGTH,
  LOGIN_COPY,
  LOGIN_REDIRECT_PATH,
  LOGIN_RESEND_COOLDOWN_SECONDS,
  OAUTH_PROVIDERS,
} from "@/constants/auth";
import {
  loginSchema,
  verifyCodeSchema,
  type LoginInput,
  type VerifyCodeInput,
} from "@/lib/auth/login-schema";
import {
  sendLoginCode,
  signInWithProvider,
  verifyLoginCode,
} from "@/lib/auth/send-login-code";
import { cn } from "@/lib/utils";

type Status = { kind: "idle" } | { kind: "sent"; email: string };
type ResendState = "idle" | "pending" | "cooldown";

const headingClassName =
  "font-heading text-2xl leading-tight font-semibold tracking-tight text-balance";
const subheadingClassName =
  "text-muted-foreground text-sm leading-relaxed text-pretty";
/*
 * Disabled here means "not offered right now", not "unavailable to you" — so
 * the label keeps full foreground contrast and simply stops presenting itself
 * as a link. Dimming it would push a countdown the user is actively reading
 * below the contrast floor.
 *
 * The rule lives on the label rather than the control so it hugs the word
 * actually showing, not the wider box the control reserves for itself.
 */
const inlineActionClassName =
  "group text-foreground cursor-pointer font-medium disabled:cursor-default";
const inlineActionLabelClassName =
  "underline underline-offset-2 group-hover:no-underline group-disabled:no-underline";

/*
 * Leaving the flow is a different rank from staying in it: this discards the
 * code that may still be arriving. Muted and unemphasised so it reads as the
 * way out rather than a second answer to "didn't get a code?".
 */
const stepBackClassName =
  "text-muted-foreground hover:text-foreground cursor-pointer px-2 py-2 text-xs underline underline-offset-2 transition-colors hover:no-underline";

const codeSlotIndices = Array.from({ length: LOGIN_CODE_LENGTH }, (_, i) => i);

/*
 * Every shape the resend control can take. They share one grid cell, so the
 * control is always as wide as its widest state and the line never re-centres
 * around it — "Resend code" → "Sending" → "Resend in 30s" otherwise swings the
 * text on both sides by ~44px in under a second, and again when the countdown
 * drops from two digits to one. `tabular-nums` holds the digits steady; only a
 * reserved box holds the digit *count* steady. The cooldown variant measures at
 * the full duration because the count only ever shrinks from there, and the
 * pending variant carries its spinner so the reservation includes it.
 */
const resendVariants = [
  { label: LOGIN_COPY.resendAction, spinner: false },
  { label: LOGIN_COPY.resendPending, spinner: true },
  {
    label: LOGIN_COPY.resendCooldown(LOGIN_RESEND_COOLDOWN_SECONDS),
    spinner: false,
  },
];

/**
 * The label and its optional spinner, left-aligned so the word always starts at
 * the same x no matter which state is showing — the countdown digits stay put
 * and the gap after the prompt never changes. Slack from the reserved width
 * falls to the trailing edge, where nothing follows it on the line.
 *
 * `sizing` marks the hidden copies that exist only to measure: they must not
 * animate, since nothing is there to see.
 */
function ResendLabel({
  label,
  spinner,
  sizing = false,
}: {
  label: string;
  spinner: boolean;
  sizing?: boolean;
}) {
  return (
    <span className="col-start-1 row-start-1 inline-flex items-center gap-1.5 justify-self-start">
      <span className={sizing ? undefined : inlineActionLabelClassName}>
        {label}
      </span>
      {spinner && (
        <LoaderCircle
          aria-hidden="true"
          className={cn("size-3 shrink-0", !sizing && "animate-spin")}
        />
      )}
    </span>
  );
}

/**
 * The room opens first and the message settles into it a beat later, so the
 * reveal reads as one soft movement rather than a wipe. Leaving is undelayed
 * — an error should clear promptly once it no longer applies. The paragraph
 * stays mounted so screen readers announce into a live region that was
 * already there — freshly inserted alerts are missed by some of them.
 */
function AnimatedFieldError({ id, message }: { id: string; message?: string }) {
  return (
    <div
      className={cn(
        "grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] motion-reduce:transition-none",
        message ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
      )}
    >
      <p
        id={id}
        role="alert"
        className="text-destructive overflow-hidden text-sm leading-snug"
      >
        <span
          className={cn(
            "block pt-2 transition-[opacity,translate] duration-300 ease-out motion-reduce:transition-none",
            message
              ? "translate-y-0 opacity-100 delay-75"
              : "-translate-y-0.5 opacity-0",
          )}
        >
          {message}
        </span>
      </p>
    </div>
  );
}

export function LoginForm() {
  const router = useRouter();
  const emailId = useId();
  const errorId = useId();
  const helperId = useId();
  const codeId = useId();
  const codeErrorId = useId();

  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [pendingProvider, setPendingProvider] = useState<string | null>(null);
  const [resendState, setResendState] = useState<ResendState>("idle");
  const [resendSecondsLeft, setResendSecondsLeft] = useState(0);
  /*
   * The session exists but the next page has not painted yet. Without this the
   * submit button springs back to its resting label the instant the request
   * settles and then sits there, apparently idle, for the whole route
   * transition — reading as a login that quietly did nothing and inviting a
   * second press.
   */
  const [isLeaving, setIsLeaving] = useState(false);

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

  const {
    control,
    handleSubmit: handleVerifySubmit,
    setError: setVerifyError,
    clearErrors: clearVerifyErrors,
    reset: resetVerifyForm,
    formState: { errors: verifyErrors, isSubmitting: isVerifying },
  } = useForm<VerifyCodeInput>({
    resolver: zodResolver(verifyCodeSchema),
    mode: "onSubmit",
    defaultValues: { code: "" },
  });

  /** Field-level message wins over the form-level one; only one is shown. */
  const errorMessage = errors.email?.message ?? errors.root?.message;
  const verifyErrorMessage =
    verifyErrors.code?.message ?? verifyErrors.root?.message;
  const isPending = isSubmitting || isProviderPending;

  /*
   * Counts down to a fixed deadline rather than accumulating ticks, so a
   * backgrounded tab — where timers are throttled hard — returns showing the
   * time that actually remains instead of a stalled number. Polling faster
   * than once a second keeps each displayed value landing near its real
   * boundary; the control returns to its resting label at zero.
   */
  useEffect(() => {
    if (resendState !== "cooldown") return;

    const deadline = Date.now() + LOGIN_RESEND_COOLDOWN_SECONDS * 1000;

    const timer = setInterval(() => {
      const remaining = Math.ceil((deadline - Date.now()) / 1000);

      if (remaining > 0) {
        setResendSecondsLeft(remaining);
        return;
      }

      setResendSecondsLeft(0);
      setResendState("idle");
    }, 250);

    return () => clearInterval(timer);
  }, [resendState]);

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
    resetVerifyForm({ code: "" });
    setResendState("idle");
    setResendSecondsLeft(0);
    setIsLeaving(false);
  };

  /*
   * Once the code is on its way the card belongs entirely to that message:
   * the provider button and the "or continue with email" divider introduced a
   * choice that has already been made.
   */
  if (status.kind === "sent") {
    const email = status.email;

    const onVerifySubmit = handleVerifySubmit(async ({ code }) => {
      clearVerifyErrors("root");

      try {
        await verifyLoginCode(email, code);

        setIsLeaving(true);
        /*
         * `replace`, not `push`: the login page has done its job and must not
         * be somewhere the back button can return a signed-in user to.
         * `refresh` then discards the cached server render taken before the
         * session cookie existed, so the destination is rendered as the
         * logged-in user rather than as a stranger.
         */
        router.replace(LOGIN_REDIRECT_PATH);
        router.refresh();
      } catch {
        setVerifyError("root", { message: LOGIN_COPY.verifyError });
      }
    });

    const onResend = async () => {
      clearVerifyErrors("root");
      setResendState("pending");

      try {
        await sendLoginCode(email);
        resetVerifyForm({ code: "" });
        // Seeded before the state flips so the first paint of the cooldown
        // shows the full duration rather than a zero the interval corrects.
        setResendSecondsLeft(LOGIN_RESEND_COOLDOWN_SECONDS);
        setResendState("cooldown");
      } catch {
        setResendState("idle");
        setVerifyError("root", { message: LOGIN_COPY.genericError });
      }
    };

    /*
     * The cooldown locks the resend control alone. Entering the code that
     * just arrived is exactly what the user should be doing while it runs, so
     * the field itself stays live.
     */
    const isCodeBusy = isVerifying || isLeaving || resendState === "pending";
    // Once the login has landed, a new code would only invalidate the one that
    // just worked — and there is nothing left on this page to type it into.
    const isResendLocked = isLeaving || resendState !== "idle";
    const resendLabel =
      resendState === "pending"
        ? LOGIN_COPY.resendPending
        : resendState === "cooldown"
          ? LOGIN_COPY.resendCooldown(resendSecondsLeft)
          : LOGIN_COPY.resendAction;

    return (
      <>
        <CardHeader role="status" className="gap-2 text-center">
          <h1 className={headingClassName}>{LOGIN_COPY.sentTitle}</h1>
          <p className={subheadingClassName}>
            {LOGIN_COPY.sentBodyPrefix}
            <strong className="text-foreground font-semibold">
              {status.email}
            </strong>
            {LOGIN_COPY.sentBodySuffix}
          </p>
        </CardHeader>

        <CardContent className="flex flex-col gap-6">
          <form
            noValidate
            onSubmit={onVerifySubmit}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col">
              <Label htmlFor={codeId} className="mb-2">
                {LOGIN_COPY.codeLabel}
              </Label>

              <Controller
                control={control}
                name="code"
                render={({ field }) => (
                  <InputOTP
                    id={codeId}
                    maxLength={LOGIN_CODE_LENGTH}
                    pattern={REGEXP_ONLY_DIGITS}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    autoFocus
                    disabled={isCodeBusy}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    onComplete={() => onVerifySubmit()}
                    aria-invalid={verifyErrors.code ? true : undefined}
                    aria-describedby={
                      verifyErrorMessage ? codeErrorId : undefined
                    }
                    containerClassName="w-full justify-center gap-2"
                  >
                    {codeSlotIndices.map((index) => (
                      <InputOTPGroup key={index}>
                        <InputOTPSlot
                          index={index}
                          className="size-12 rounded-lg text-lg"
                        />
                      </InputOTPGroup>
                    ))}
                  </InputOTP>
                )}
              />

              <AnimatedFieldError
                id={codeErrorId}
                message={verifyErrorMessage}
              />
            </div>

            <Button
              type="submit"
              className="h-11 w-full gap-2 text-sm font-medium"
              disabled={isCodeBusy}
              aria-busy={isVerifying || isLeaving}
            >
              {(isVerifying || isLeaving) && (
                <LoaderCircle
                  aria-hidden="true"
                  className="size-4 animate-spin"
                />
              )}
              {isVerifying || isLeaving
                ? LOGIN_COPY.verifySubmitPending
                : LOGIN_COPY.verifySubmit}
            </Button>
          </form>

          <div className="flex flex-col items-center gap-1">
            <p className="text-muted-foreground text-center text-xs leading-relaxed">
              {LOGIN_COPY.resendPrompt}{" "}
              <button
                type="button"
                className={cn(
                  inlineActionClassName,
                  "inline-grid tabular-nums",
                )}
                disabled={isResendLocked}
                onClick={onResend}
              >
                <ResendLabel
                  label={resendLabel}
                  spinner={resendState === "pending"}
                />
                {/*
                  Sized, never seen. `invisible` keeps them out of the
                  accessibility tree, so the button still announces only the
                  label that is actually showing.
                */}
                {resendVariants.map((variant) => (
                  <span
                    key={variant.label}
                    aria-hidden="true"
                    className="invisible col-start-1 row-start-1 grid"
                  >
                    <ResendLabel {...variant} sizing />
                  </span>
                ))}
              </button>
            </p>

            <button
              type="button"
              className={stepBackClassName}
              disabled={isLeaving}
              onClick={startOver}
            >
              {LOGIN_COPY.sentReset}
            </button>
          </div>

          {/*
            Kept mounted and empty so the confirmation lands in a region that
            was already there — some screen readers miss an alert inserted at
            the same moment as its text.

            `aria-live` rather than `role="status"`: it is the exact expansion
            of that role, and it announces identically without putting a second
            status region in the tree beside the "Check your inbox" header. Two
            of them leaves both the user and any role query unable to say which
            one is *the* status.
          */}
          <span aria-live="polite" aria-atomic="true" className="sr-only">
            {resendState === "cooldown"
              ? LOGIN_COPY.resendSuccess(LOGIN_RESEND_COOLDOWN_SECONDS)
              : ""}
          </span>
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

            <AnimatedFieldError id={errorId} message={errorMessage} />
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
