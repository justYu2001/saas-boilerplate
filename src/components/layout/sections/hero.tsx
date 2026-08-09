import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AUTH_NAV_COPY, LOGIN_PATH } from "@/constants/auth";

export const HeroSection = () => {
  return (
    <section className="container w-full">
      <div className="mx-auto grid place-items-center gap-8 py-20 md:py-32 lg:max-w-(--breakpoint-xl)">
        <div className="space-y-8 text-center">
          <Badge variant="outline" className="h-auto py-2 text-sm">
            <span className="text-primary mr-2">
              <Badge>New</Badge>
            </span>
            <span>Design is out now!</span>
          </Badge>

          <div className="mx-auto max-w-(--breakpoint-md) text-center text-4xl font-bold md:text-6xl">
            <h1>
              Experience the
              <span className="to-primary bg-linear-to-r from-[#D247BF] bg-clip-text px-2 text-transparent">
                SaaS Boilerplate
              </span>
              landing page
            </h1>
          </div>

          <p className="text-muted-foreground mx-auto max-w-(--breakpoint-sm) text-xl">
            {`We're more than just a tool, we're a community of passionate
            creators. Get access to exclusive resources, tutorials, and support.`}
          </p>

          <div className="space-y-4 md:space-y-0 md:space-x-4">
            <Button
              render={<Link href={LOGIN_PATH} />}
              nativeButton={false}
              size="lg"
              className="group/arrow w-5/6 font-bold md:w-1/4"
            >
              {AUTH_NAV_COPY.signUp}
              <ArrowRight className="ml-2 size-5 transition-transform group-hover/arrow:translate-x-1" />
            </Button>

            <Button
              render={
                <Link
                  href="https://github.com/nobruf/shadcn-landing-page.git"
                  target="_blank"
                />
              }
              nativeButton={false}
              size="lg"
              variant="secondary"
              className="w-5/6 font-bold md:w-1/4"
            >
              Github repository
            </Button>
          </div>
        </div>

        <div className="group relative mt-14">
          <div className="bg-primary/50 absolute top-2 left-1/2 mx-auto h-24 w-[90%] -translate-x-1/2 rounded-full blur-3xl lg:-top-8 lg:h-80"></div>

          {/*
           * The template swapped these with `useTheme()`, which forces a client
           * component and flashes the wrong image before hydration. Toggling
           * with CSS keeps the section server-rendered and mismatch-free.
           */}
          <Image
            width={1200}
            height={1200}
            priority
            className="border-secondary border-t-primary/30 relative mx-auto flex w-full items-center rounded-lg border leading-none md:w-300 dark:hidden"
            src="/hero-image-light.jpeg"
            alt="Dashboard preview"
          />
          <Image
            width={1200}
            height={1200}
            priority
            className="border-secondary border-t-primary/30 relative mx-auto hidden w-full items-center rounded-lg border leading-none md:w-300 dark:flex"
            src="/hero-image-dark.jpeg"
            alt="Dashboard preview"
          />

          <div className="from-background/0 via-background/50 to-background absolute bottom-0 left-0 h-20 w-full rounded-lg bg-linear-to-b md:h-28"></div>
        </div>
      </div>
    </section>
  );
};
