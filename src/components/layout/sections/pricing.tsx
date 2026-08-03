import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface PlanProps {
  title: string;
  popular: boolean;
  price: number;
  description: string;
  buttonText: string;
  benefitList: string[];
}

const plans: PlanProps[] = [
  {
    title: "Free",
    popular: false,
    price: 0,
    description:
      "Lorem ipsum dolor sit, amet ipsum consectetur adipisicing elit.",
    buttonText: "Start Free Trial",
    benefitList: [
      "1 team member",
      "1 GB storage",
      "Upto 2 pages",
      "Community support",
      "AI assistance",
    ],
  },
  {
    title: "Premium",
    popular: true,
    price: 45,
    description:
      "Lorem ipsum dolor sit, amet ipsum consectetur adipisicing elit.",
    buttonText: "Get started",
    benefitList: [
      "4 team member",
      "8 GB storage",
      "Upto 6 pages",
      "Priority support",
      "AI assistance",
    ],
  },
  {
    title: "Enterprise",
    popular: false,
    price: 120,
    description:
      "Lorem ipsum dolor sit, amet ipsum consectetur adipisicing elit.",
    buttonText: "Contact Us",
    benefitList: [
      "10 team member",
      "20 GB storage",
      "Upto 10 pages",
      "Phone & email support",
      "AI assistance",
    ],
  },
];

export const PricingSection = () => {
  return (
    <section id="pricing" className="container py-24 sm:py-32">
      <h2 className="text-primary mb-2 text-center text-lg tracking-wider">
        Pricing
      </h2>

      <h2 className="mb-4 text-center text-3xl font-bold md:text-4xl">
        Get unlimited access
      </h2>

      <h3 className="text-muted-foreground mx-auto pb-14 text-center text-xl md:w-1/2">
        Lorem ipsum dolor sit amet consectetur adipisicing reiciendis.
      </h3>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-4">
        {plans.map(
          ({ title, popular, price, description, buttonText, benefitList }) => (
            <Card
              key={title}
              className={cn(
                "flex flex-col text-base [--card-spacing:--spacing(6)]",
                popular &&
                  "ring-primary ring-2 drop-shadow-xl lg:z-10 lg:scale-[1.1]",
              )}
            >
              <CardHeader>
                <CardTitle className="pb-2 text-2xl font-semibold">
                  {title}
                </CardTitle>

                <CardDescription className="pb-4">
                  {description}
                </CardDescription>

                <div>
                  <span className="text-3xl font-bold">${price}</span>
                  <span className="text-muted-foreground"> /month</span>
                </div>
              </CardHeader>

              <CardContent className="flex">
                <div className="space-y-4">
                  {benefitList.map((benefit) => (
                    <span key={benefit} className="flex">
                      <Check className="text-primary mr-2 shrink-0" />
                      <h3>{benefit}</h3>
                    </span>
                  ))}
                </div>
              </CardContent>

              <CardFooter className="mt-auto border-t-0 bg-transparent">
                <Button
                  size="lg"
                  variant={popular ? "default" : "secondary"}
                  className="w-full"
                >
                  {buttonText}
                </Button>
              </CardFooter>
            </Card>
          ),
        )}
      </div>
    </section>
  );
};
