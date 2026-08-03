import Image from "next/image";
import Link from "next/link";

import LinkedInIcon from "@/components/icons/linkedin-icon";
import XIcon from "@/components/icons/x-icon";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SocialNetworkProps {
  name: string;
  url: string;
}

interface TeamProps {
  imageUrl: string;
  firstName: string;
  lastName: string;
  positions: string[];
  socialNetworks: SocialNetworkProps[];
}

const teamList: TeamProps[] = [
  {
    imageUrl: "https://i.pravatar.cc/250?img=58",
    firstName: "Leo",
    lastName: "Miranda",
    positions: ["Vue Fronted Developer", "Creator Of This Website"],
    socialNetworks: [
      {
        name: "LinkedIn",
        url: "https://www.linkedin.com/in/leopoldo-miranda/",
      },
      { name: "Github", url: "https://github.com/leoMirandaa" },
      { name: "X", url: "https://x.com/leo_mirand4" },
    ],
  },
  {
    imageUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1528&auto=format&fit=crop",
    firstName: "Elizabeth",
    lastName: "Moore",
    positions: ["UI/UX Designer"],
    socialNetworks: [
      {
        name: "LinkedIn",
        url: "https://www.linkedin.com/in/leopoldo-miranda/",
      },
      { name: "X", url: "https://x.com/leo_mirand4" },
    ],
  },
  {
    imageUrl:
      "https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=1760&auto=format&fit=crop",
    firstName: "David",
    lastName: "Diaz",
    positions: ["Machine Learning Engineer", "TensorFlow Tinkerer"],
    socialNetworks: [
      {
        name: "LinkedIn",
        url: "https://www.linkedin.com/in/leopoldo-miranda/",
      },
      { name: "Github", url: "https://github.com/leoMirandaa" },
    ],
  },
  {
    imageUrl:
      "https://images.unsplash.com/photo-1573497161161-c3e73707e25c?q=80&w=1587&auto=format&fit=crop",
    firstName: "Sarah",
    lastName: "Robinson",
    positions: ["Cloud Native Developer", "Kubernetes Orchestrator"],
    socialNetworks: [
      {
        name: "LinkedIn",
        url: "https://www.linkedin.com/in/leopoldo-miranda/",
      },
      { name: "Github", url: "https://github.com/leoMirandaa" },
      { name: "X", url: "https://x.com/leo_mirand4" },
    ],
  },
  {
    imageUrl:
      "https://images.unsplash.com/photo-1616805765352-beedbad46b2a?q=80&w=1887&auto=format&fit=crop",
    firstName: "Michael",
    lastName: "Holland",
    positions: ["DevOps Engineer", "CI/CD Pipeline Mastermind"],
    socialNetworks: [
      {
        name: "LinkedIn",
        url: "https://www.linkedin.com/in/leopoldo-miranda/",
      },
    ],
  },
  {
    imageUrl:
      "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=1587&auto=format&fit=crop",
    firstName: "Zoe",
    lastName: "Garcia",
    positions: ["JavaScript Evangelist", "Deno Champion"],
    socialNetworks: [
      {
        name: "LinkedIn",
        url: "https://www.linkedin.com/in/leopoldo-miranda/",
      },
      { name: "Github", url: "https://github.com/leoMirandaa" },
    ],
  },
  {
    imageUrl:
      "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=1480&auto=format&fit=crop",
    firstName: "Evan",
    lastName: "James",
    positions: ["Backend Developer"],
    socialNetworks: [
      {
        name: "LinkedIn",
        url: "https://www.linkedin.com/in/leopoldo-miranda/",
      },
      { name: "Github", url: "https://github.com/leoMirandaa" },
      { name: "X", url: "https://x.com/leo_mirand4" },
    ],
  },
  {
    imageUrl:
      "https://images.unsplash.com/photo-1573497019236-17f8177b81e8?q=80&w=1740&auto=format&fit=crop",
    firstName: "Pam",
    lastName: "Taylor",
    positions: ["Fullstack Developer", "UX Researcher"],
    socialNetworks: [{ name: "X", url: "https://x.com/leo_mirand4" }],
  },
];

const socialIcon = (socialName: string) => {
  switch (socialName) {
    case "LinkedIn":
      return <LinkedInIcon />;
    case "X":
      return <XIcon />;
    default:
      return null;
  }
};

export const TeamSection = () => {
  return (
    <section id="team" className="container py-24 sm:py-32 lg:w-[75%]">
      <div className="mb-8 text-center">
        <h2 className="text-primary mb-2 text-center text-lg tracking-wider">
          Team
        </h2>

        <h2 className="text-center text-3xl font-bold md:text-4xl">
          The Company Dream Team
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {teamList.map(
          ({ imageUrl, firstName, lastName, positions, socialNetworks }) => (
            /*
             * `gap-0` + `text-base`: base-nova's Card gaps every child by
             * --card-spacing and sets text-sm, where this layout expects the
             * classic card that spaces purely through padding at body size.
             */
            <Card
              key={`${firstName}-${lastName}`}
              className="group/hoverimg bg-muted/60 dark:bg-card flex h-full flex-col gap-0 pt-0 text-base [--card-spacing:--spacing(6)]"
            >
              <CardHeader className="gap-0 p-0">
                <div className="h-full overflow-hidden">
                  <Image
                    src={imageUrl}
                    alt={`${firstName} ${lastName}`}
                    width={300}
                    height={300}
                    className="aspect-square size-full w-full object-cover saturate-0 transition-all duration-200 ease-linear group-hover/hoverimg:scale-[1.01] group-hover/hoverimg:saturate-100"
                  />
                </div>
                <CardTitle className="px-6 pt-6 pb-4 text-2xl font-semibold">
                  {firstName}
                  <span className="text-primary ml-2">{lastName}</span>
                </CardTitle>
              </CardHeader>

              {positions.map((position, index) => (
                <CardContent
                  key={position}
                  className={cn(
                    "text-muted-foreground",
                    index === positions.length - 1 && "pb-6",
                  )}
                >
                  {position}
                  {index < positions.length - 1 && <span>,</span>}
                </CardContent>
              ))}

              <CardFooter className="mt-auto space-x-4 border-t-0 bg-transparent px-6 pt-0 pb-6">
                {socialNetworks.map(({ name, url }) => (
                  <Link
                    key={name}
                    href={url}
                    target="_blank"
                    aria-label={`${firstName} ${lastName} on ${name}`}
                    className="transition-all hover:opacity-80"
                  >
                    {socialIcon(name)}
                  </Link>
                ))}
              </CardFooter>
            </Card>
          ),
        )}
      </div>
    </section>
  );
};
