import Link from "next/link";

import DiscordIcon from "@/components/icons/discord-icon";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const CommunitySection = () => {
  return (
    <section id="community" className="py-12">
      <hr className="border-secondary" />
      <div className="container py-20 sm:py-20">
        <div className="mx-auto lg:w-[60%]">
          {/*
           * The card is deliberately not `items-center`: that would size every
           * child to fit-content, and base-nova's grid-based CardHeader
           * collapses to its padding when shrink-wrapped, spilling the title
           * out of the card. Full-width children + `text-center` centre the
           * same way without depending on intrinsic sizing.
           */}
          <Card className="bg-background flex flex-col justify-center text-center ring-0 [--card-spacing:--spacing(6)]">
            <CardHeader>
              <CardTitle className="flex flex-col items-center text-4xl font-bold md:text-5xl">
                <DiscordIcon />
                <div>
                  Ready to join this
                  <span className="to-primary bg-linear-to-r from-[#D247BF] bg-clip-text pl-2 text-transparent">
                    Community?
                  </span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground mx-auto text-xl lg:w-[80%]">
              Join our vibrant Discord community! Connect, share, and grow with
              like-minded enthusiasts. Click to dive in! 🚀
            </CardContent>

            <CardFooter className="justify-center border-t-0 bg-transparent">
              <Button
                size="lg"
                render={<Link href="https://discord.com/" target="_blank" />}
                nativeButton={false}
              >
                Join Discord
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
      <hr className="border-secondary" />
    </section>
  );
};
