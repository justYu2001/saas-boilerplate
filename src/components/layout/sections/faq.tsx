import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQProps {
  question: string;
  answer: string;
  value: string;
}

const FAQList: FAQProps[] = [
  {
    question: "Is this template free?",
    answer: "Yes. It is a free NextJS SaaS Boilerplate template.",
    value: "item-1",
  },
  {
    question: "Duis aute irure dolor in reprehenderit in voluptate velit?",
    answer:
      "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Sint labore quidem quam consectetur sapiente, iste rerum reiciendis animi nihil nostrum sit quo, modi quod.",
    value: "item-2",
  },
  {
    question:
      "Lorem ipsum dolor sit amet Consectetur natus dolor minus quibusdam?",
    answer:
      "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Labore qui nostrum reiciendis veritatis.",
    value: "item-3",
  },
  {
    question: "Excepteur sint occaecat cupidata non proident sunt?",
    answer: "Lorem ipsum dolor sit amet consectetur, adipisicing elit.",
    value: "item-4",
  },
  {
    question:
      "Enim ad minim veniam, quis nostrud exercitation ullamco laboris?",
    answer: "consectetur adipisicing elit. Sint labore.",
    value: "item-5",
  },
];

export const FAQSection = () => {
  return (
    <section id="faq" className="container py-24 sm:py-32 md:w-175">
      <div className="mb-8 text-center">
        <h2 className="text-primary mb-2 text-center text-lg tracking-wider">
          FAQS
        </h2>

        <h2 className="text-center text-3xl font-bold md:text-4xl">
          Common Questions
        </h2>
      </div>

      {/* Base UI's Accordion is single-open and collapsible by default, so the
          template's `type="single" collapsible` props are no longer needed. */}
      {/* `gap-4` rather than a margin per item: base-nova's accordion root is a
          flex column, so sibling margins would not collapse and would double. */}
      <Accordion className="gap-4">
        {FAQList.map(({ question, answer, value }) => (
          /*
           * The template styles each item as a standalone rounded card in its
           * own accordion.tsx; base-nova instead separates items with a single
           * bottom rule, so the card treatment is applied here.
           */
          <AccordionItem
            key={value}
            value={value}
            className="border-secondary bg-muted/50 dark:bg-card rounded-lg border px-4"
          >
            <AccordionTrigger className="py-4 text-left text-base">
              {question}
            </AccordionTrigger>

            <AccordionContent className="text-muted-foreground">
              {answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
};
