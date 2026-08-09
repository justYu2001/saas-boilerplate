"use client";

import { Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { AUTH_NAV_COPY, LOGIN_PATH } from "@/constants/auth";
import { DASHBOARD_PATH } from "@/constants/dashboard";

interface NavbarProps {
  /**
   * Whether the visitor holds a session, decided on the server before this
   * markup was sent. See `@/app/(marketing)/layout` for where it comes from.
   */
  isSignedIn: boolean;
}

interface RouteProps {
  href: string;
  label: string;
}

interface FeatureProps {
  title: string;
  description: string;
}

const routeList: RouteProps[] = [
  { href: "#testimonials", label: "Testimonials" },
  { href: "#team", label: "Team" },
  { href: "#contact", label: "Contact" },
  { href: "#faq", label: "FAQ" },
];

const featureList: FeatureProps[] = [
  {
    title: "Showcase Your Value ",
    description: "Highlight how your product solves user problems.",
  },
  {
    title: "Build Trust",
    description:
      "Leverages social proof elements to establish trust and credibility.",
  },
  {
    title: "Capture Leads",
    description:
      "Make your lead capture form visually appealing and strategically.",
  },
];

export const Navbar = ({ isSignedIn }: NavbarProps) => {
  const [isOpen, setIsOpen] = React.useState(false);

  /*
   * The marketing pages stay open to everyone, signed in or not, so the header
   * changes what it offers rather than who it lets past.
   *
   * "Log in" is the only control that goes away: it is the one word that is
   * simply untrue for someone already signed in. "Get started" survives both
   * states because it always means the same thing — take me into the product —
   * and only its destination moves, from the login page to the dashboard.
   *
   * Which state to draw is settled on the server, so both controls arrive in
   * the first HTML already pointing at the right door. This component stays a
   * client one for the mobile sheet's open state, not for the session: nothing
   * here waits on a session request, so there is no pending beat to spend
   * showing an empty header and no signed-in visitor watching "Log in" appear
   * and then be taken back.
   *
   * The prop is a snapshot of the request, not a subscription. A sign-in that
   * happens on the page — One Tap on the home page is the only one — leaves it
   * stale, which is why `@/components/auth/google-one-tap` follows its success
   * with a `router.refresh()` on the way to the dashboard.
   */
  const enterHref = isSignedIn ? DASHBOARD_PATH : LOGIN_PATH;

  return (
    <header className="border-secondary bg-card sticky top-5 z-40 mx-auto flex w-[90%] items-center justify-between rounded-2xl border p-2 inset-shadow-sm md:w-[70%] lg:w-[75%] lg:max-w-(--breakpoint-xl)">
      <Link href="/">
        <Logo />
      </Link>

      {/* Mobile */}
      <div className="flex items-center lg:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger
            render={
              <Button variant="ghost" size="icon" aria-label="Open menu" />
            }
          >
            <Menu className="size-5" />
          </SheetTrigger>

          <SheetContent
            side="left"
            className="border-secondary bg-card flex flex-col justify-between rounded-tr-2xl rounded-br-2xl"
          >
            <div>
              <SheetHeader className="mb-4 ml-4">
                <SheetTitle className="flex items-center">
                  <Link href="/">
                    <Logo />
                  </Link>
                </SheetTitle>
              </SheetHeader>

              <div className="flex flex-col gap-2">
                {routeList.map(({ href, label }) => (
                  <Button
                    key={href}
                    onClick={() => setIsOpen(false)}
                    render={<Link href={href} />}
                    nativeButton={false}
                    variant="ghost"
                    className="justify-start text-base"
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>

            {/*
              Order is inverted against the desktop header: there the primary
              CTA sits last because the eye finishes a row on the right, here
              it sits last because the thumb rests at the bottom of the sheet.
            */}
            <SheetFooter>
              {!isSignedIn && (
                <Button
                  onClick={() => setIsOpen(false)}
                  render={<Link href={LOGIN_PATH} />}
                  nativeButton={false}
                  variant="outline"
                  size="lg"
                  className="text-base"
                >
                  {AUTH_NAV_COPY.logIn}
                </Button>
              )}

              <Button
                onClick={() => setIsOpen(false)}
                render={<Link href={enterHref} />}
                nativeButton={false}
                size="lg"
                className="text-base"
              >
                {AUTH_NAV_COPY.signUp}
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop */}
      <NavigationMenu className="mx-auto hidden lg:block">
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger className="bg-card text-base">
              Features
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="grid w-[600px] grid-cols-2 gap-5 p-4">
                <Image
                  src="https://avatars.githubusercontent.com/u/75042455?v=4"
                  alt="SaaS Boilerplate"
                  className="h-full w-full rounded-md object-cover"
                  width={600}
                  height={600}
                />
                <ul className="flex flex-col gap-2">
                  {featureList.map(({ title, description }) => (
                    <li
                      key={title}
                      className="hover:bg-muted rounded-md p-3 text-sm"
                    >
                      <p className="text-foreground mb-1 leading-none font-semibold">
                        {title}
                      </p>
                      <p className="text-muted-foreground line-clamp-2">
                        {description}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>

          {routeList.map(({ href, label }) => (
            <NavigationMenuItem key={href}>
              <NavigationMenuLink
                render={<Link href={href} />}
                className="px-2 text-base"
              >
                {label}
              </NavigationMenuLink>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>

      {/*
        Signed out, two labels share one destination — a first-time visitor
        needs to see that this product will make them an account, and "Log in"
        alone never says so. Signed in, one label remains and its destination
        becomes the dashboard. Both stay text, so the filled orange is spent
        once per viewport on the hero's call to action rather than twice on the
        same one.
      */}
      <div className="hidden items-center gap-1 lg:flex">
        {!isSignedIn && (
          <Button
            render={<Link href={LOGIN_PATH} />}
            nativeButton={false}
            variant="ghost"
            size="lg"
            className="text-base"
          >
            {AUTH_NAV_COPY.logIn}
          </Button>
        )}

        <Button
          render={<Link href={enterHref} />}
          nativeButton={false}
          variant="ghost"
          size="lg"
          className="text-base"
        >
          {AUTH_NAV_COPY.signUp}
        </Button>
      </div>
    </header>
  );
};
