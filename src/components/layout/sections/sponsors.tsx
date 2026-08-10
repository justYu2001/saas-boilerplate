import {
  Cookie,
  Crown,
  Drama,
  Ghost,
  Puzzle,
  Squirrel,
  Vegan,
  type LucideIcon,
} from "lucide-react";

import { Marquee } from "@/components/primitives/marquee";

interface SponsorProps {
  icon: LucideIcon;
  name: string;
}

const sponsors: SponsorProps[] = [
  { icon: Crown, name: "Acmebrand" },
  { icon: Vegan, name: "Acmelogo" },
  { icon: Ghost, name: "Acmesponsor" },
  { icon: Puzzle, name: "Acmeipsum" },
  { icon: Squirrel, name: "Acme" },
  { icon: Cookie, name: "Accmee" },
  { icon: Drama, name: "Acmetech" },
];

export const SponsorsSection = () => {
  return (
    <section id="sponsors" className="mx-auto max-w-[75%] pb-24 sm:pb-32">
      <h2 className="mb-6 text-center text-lg md:text-xl">
        Our Platinum Sponsors
      </h2>

      <div className="mx-auto">
        <Marquee fade pauseOnHover>
          {sponsors.map(({ icon: Icon, name }) => (
            <div
              key={name}
              className="text-foreground flex items-center text-xl font-medium md:text-2xl"
            >
              {/* The template hardcoded `color="white"`, which is invisible in
                  light mode; `currentColor` follows the theme instead. */}
              <Icon size={32} color="currentColor" className="mr-2" />
              {name}
            </div>
          ))}
        </Marquee>
      </div>
    </section>
  );
};
