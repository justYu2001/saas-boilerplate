import { ChevronsDownIcon } from "lucide-react";
import Link from "next/link";

import { Separator } from "@/components/ui/separator";

interface FooterColumnProps {
  title: string;
  links: string[];
}

const footerColumns: FooterColumnProps[] = [
  { title: "Contact", links: ["Github", "Twitter", "Instagram"] },
  { title: "Platforms", links: ["iOS", "Android", "Web"] },
  { title: "Help", links: ["Contact Us", "FAQ", "Feedback"] },
  { title: "Socials", links: ["Twitch", "Discord", "Dribbble"] },
];

export const FooterSection = () => {
  return (
    <footer id="footer" className="container py-24 sm:py-32">
      <div className="border-secondary bg-card rounded-2xl border p-10">
        <div className="grid grid-cols-2 gap-x-12 gap-y-8 md:grid-cols-4 xl:grid-cols-6">
          <div className="col-span-full xl:col-span-2">
            <Link href="#" className="flex items-center font-bold">
              <ChevronsDownIcon className="border-secondary from-primary via-primary/70 to-primary mr-2 size-9 rounded-lg border bg-linear-to-tr" />

              <h3 className="text-2xl">SaaS Boilerplate</h3>
            </Link>
          </div>

          {footerColumns.map(({ title, links }) => (
            <div key={title} className="flex flex-col gap-2">
              <h3 className="text-lg font-bold">{title}</h3>
              {links.map((link) => (
                <div key={link}>
                  <Link href="#" className="opacity-60 hover:opacity-100">
                    {link}
                  </Link>
                </div>
              ))}
            </div>
          ))}
        </div>

        <Separator className="my-6" />
        <section>
          <h3>
            &copy; 2026 Built by
            <Link
              target="_blank"
              href=""
              className="border-primary text-primary ml-1 transition-all hover:border-b-2"
            >
              Euan Chen
            </Link>
          </h3>
        </section>
      </div>
    </footer>
  );
};
