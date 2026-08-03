import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ServiceProps {
  title: string;
  pro: boolean;
  description: string;
}

const serviceList: ServiceProps[] = [
  {
    title: "Custom Domain Integration",
    description:
      "Lorem ipsum dolor sit, amet consectetur adipisicing elit adipisicing.",
    pro: false,
  },
  {
    title: "Social Media Integrations",
    description:
      "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Molestiae, dicta.",
    pro: false,
  },
  {
    title: "Email Marketing Integrations",
    description: "Lorem dolor sit amet adipisicing.",
    pro: false,
  },
  {
    title: "SEO Optimization",
    description: "Lorem ipsum dolor sit amet consectetur.",
    pro: true,
  },
];

export const ServicesSection = () => {
  return (
    <section id="services" className="container py-24 sm:py-32">
      <h2 className="text-primary mb-2 text-center text-lg tracking-wider">
        Services
      </h2>

      <h2 className="mb-4 text-center text-3xl font-bold md:text-4xl">
        Grow Your Business
      </h2>
      <h3 className="text-muted-foreground mx-auto mb-8 text-center text-xl md:w-1/2">
        From marketing and sales to operations and strategy, we have the
        expertise to help you achieve your goals.
      </h3>

      <div className="mx-auto grid w-full gap-4 sm:grid-cols-2 lg:w-[60%] lg:grid-cols-2">
        {serviceList.map(({ title, description, pro }) => (
          <Card
            key={title}
            /* `overflow-visible` is required here: the base-nova Card clips its
               children, which would hide the negatively-offset PRO badge. */
            className="bg-muted/60 dark:bg-card relative h-full overflow-visible [--card-spacing:--spacing(6)]"
          >
            <CardHeader>
              <CardTitle className="text-2xl font-semibold">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            {pro && (
              <Badge variant="secondary" className="absolute -top-2 -right-3">
                PRO
              </Badge>
            )}
          </Card>
        ))}
      </div>
    </section>
  );
};
