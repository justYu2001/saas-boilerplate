import {
  BadgeCheck,
  Goal,
  MousePointerClick,
  Newspaper,
  PictureInPicture,
  TabletSmartphone,
  type LucideIcon,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FeatureProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

const featureList: FeatureProps[] = [
  {
    icon: TabletSmartphone,
    title: "Mobile Friendly",
    description:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. A odio velit cum aliquam, consectetur.",
  },
  {
    icon: BadgeCheck,
    title: "Social Proof",
    description:
      "Lorem ipsum dolor sit amet consectetur. Natus consectetur, odio ea accusamus aperiam.",
  },
  {
    icon: Goal,
    title: "Targeted Content",
    description:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. odio ea accusamus aperiam.",
  },
  {
    icon: PictureInPicture,
    title: "Strong Visuals",
    description:
      "Lorem elit. A odio velit cum aliquam. Natus consectetur dolores, odio ea accusamus aperiam.",
  },
  {
    icon: MousePointerClick,
    title: "Clear CTA",
    description:
      "Lorem ipsum dolor sit amet consectetur adipisicing. odio ea accusamus consectetur.",
  },
  {
    icon: Newspaper,
    title: "Clear Headline",
    description:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. A odio velit cum aliquam. Natus consectetur.",
  },
];

export const FeaturesSection = () => {
  return (
    <section id="features" className="container py-24 sm:py-32">
      <h2 className="text-primary mb-2 text-center text-lg tracking-wider">
        Features
      </h2>

      <h2 className="mb-4 text-center text-3xl font-bold md:text-4xl">
        What Makes Us Different
      </h2>

      <h3 className="text-muted-foreground mx-auto mb-8 text-center text-xl md:w-1/2">
        Lorem ipsum dolor, sit amet consectetur adipisicing elit. Voluptatem
        fugiat, odit similique quasi sint reiciendis quidem iure veritatis optio
        facere tenetur.
      </h3>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {featureList.map(({ icon: Icon, title, description }) => (
          <div key={title}>
            <Card className="bg-background h-full text-base ring-0 [--card-spacing:--spacing(6)]">
              <CardHeader className="flex flex-col items-center justify-center">
                <div className="bg-primary/20 ring-primary/10 mb-4 rounded-full p-2 ring-8">
                  <Icon
                    size={24}
                    color="var(--primary)"
                    className="text-primary"
                  />
                </div>

                <CardTitle className="text-2xl font-semibold">
                  {title}
                </CardTitle>
              </CardHeader>

              <CardContent className="text-muted-foreground text-center">
                {description}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </section>
  );
};
