"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronsDown, Menu } from "lucide-react";

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
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

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

export const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <header className="border-secondary bg-card sticky top-5 z-40 mx-auto flex w-[90%] items-center justify-between rounded-2xl border p-2 inset-shadow-sm md:w-[70%] lg:w-[75%] lg:max-w-(--breakpoint-xl)">
      <Link href="/" className="flex items-center text-lg font-bold">
        <ChevronsDown className="border-secondary from-primary via-primary/70 to-primary mr-2 size-9 rounded-lg border bg-linear-to-tr text-white" />
        Shadcn
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
                  <Link href="/" className="flex items-center">
                    <ChevronsDown className="border-secondary from-primary via-primary/70 to-primary mr-2 size-9 rounded-lg border bg-linear-to-tr text-white" />
                    Shadcn
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
                  alt="Shadcn"
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
    </header>
  );
};
