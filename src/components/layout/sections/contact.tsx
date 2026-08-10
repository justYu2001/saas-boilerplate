"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Clock, Mail, Phone } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const SUBJECTS = [
  "Web Development",
  "Mobile Development",
  "Figma Design",
  "REST API",
  "FullStack Project",
] as const;

// zod v4 deprecated `z.string().email()` in favour of the top-level `z.email()`.
const formSchema = z.object({
  firstName: z.string().min(2).max(255),
  lastName: z.string().min(2).max(255),
  email: z.email(),
  subject: z.string().min(2).max(255),
  message: z.string().min(1, "Please write a message."),
});

type ContactForm = z.infer<typeof formSchema>;

/*
 * base-nova sizes form controls at 32px; this form was designed against the
 * 40px shadcn defaults. Applying the height here keeps the landing page aligned
 * without changing the shared Input/Select primitives used elsewhere.
 */
const CONTROL_HEIGHT = "h-10";

export const ContactSection = () => {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      subject: "Web Development",
      message: "",
    },
  });

  const onSubmit = ({
    firstName,
    lastName,
    email,
    subject,
    message,
  }: ContactForm) => {
    const mailToLink = `mailto:leomirandadev@gmail.com?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(
      `Hello I am ${firstName} ${lastName}, my Email is ${email}.\n${message}`,
    )}`;

    window.location.assign(mailToLink);
  };

  return (
    <section id="contact" className="container py-24 sm:py-32">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div>
          <div className="mb-4">
            <h2 className="text-primary mb-2 text-lg tracking-wider">
              Contact
            </h2>

            <h2 className="text-3xl font-bold md:text-4xl">Connect With Us</h2>
          </div>
          <p className="text-muted-foreground mb-8 lg:w-5/6">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatum
            ipsam sint enim exercitationem ex autem corrupti quas tenetur
          </p>

          <div className="flex flex-col gap-4">
            <div>
              <div className="mb-1 flex gap-2">
                <Building2 />
                <div className="font-bold">Find us</div>
              </div>

              <div>742 Evergreen Terrace, Springfield, IL 62704</div>
            </div>

            <div>
              <div className="mb-1 flex gap-2">
                <Phone />
                <div className="font-bold">Call us</div>
              </div>

              <div>+1 (619) 123-4567</div>
            </div>

            <div>
              <div className="mb-1 flex gap-2">
                <Mail />
                <div className="font-bold">Mail us</div>
              </div>

              <div>leomirandadev@gmail.com</div>
            </div>

            <div>
              <div className="flex gap-2">
                <Clock />
                <div className="font-bold">Visit us</div>
              </div>

              <div>
                <div>Monday - Friday</div>
                <div>8AM - 4PM</div>
              </div>
            </div>
          </div>
        </div>

        <Card className="bg-muted/60 dark:bg-card [--card-spacing:--spacing(6)]">
          <CardHeader />
          <CardContent>
            {/*
             * The base-nova registry replaced the react-hook-form `<Form>`
             * wrapper with Base UI `Field` primitives, so the fields are wired
             * to react-hook-form directly here.
             */}
            <form onSubmit={handleSubmit(onSubmit)} className="w-full">
              <FieldGroup>
                <div className="flex flex-col gap-8 md:flex-row">
                  <Field data-invalid={!!errors.firstName}>
                    <FieldLabel htmlFor="firstName">First Name</FieldLabel>
                    <Input
                      id="firstName"
                      className={CONTROL_HEIGHT}
                      placeholder="Leopoldo"
                      aria-invalid={!!errors.firstName}
                      {...register("firstName")}
                    />
                    <FieldError errors={[errors.firstName]} />
                  </Field>

                  <Field data-invalid={!!errors.lastName}>
                    <FieldLabel htmlFor="lastName">Last Name</FieldLabel>
                    <Input
                      id="lastName"
                      className={CONTROL_HEIGHT}
                      placeholder="Miranda"
                      aria-invalid={!!errors.lastName}
                      {...register("lastName")}
                    />
                    <FieldError errors={[errors.lastName]} />
                  </Field>
                </div>

                <Field data-invalid={!!errors.email}>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    className={CONTROL_HEIGHT}
                    type="email"
                    placeholder="leomirandadev@gmail.com"
                    aria-invalid={!!errors.email}
                    {...register("email")}
                  />
                  <FieldError errors={[errors.email]} />
                </Field>

                <Field data-invalid={!!errors.subject}>
                  <FieldLabel htmlFor="subject">Subject</FieldLabel>
                  <Controller
                    control={control}
                    name="subject"
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        items={SUBJECTS.map((subject) => ({
                          label: subject,
                          value: subject,
                        }))}
                      >
                        <SelectTrigger
                          id="subject"
                          className={cn("w-full", CONTROL_HEIGHT)}
                        >
                          <SelectValue placeholder="Select a subject" />
                        </SelectTrigger>
                        <SelectContent>
                          {SUBJECTS.map((subject) => (
                            <SelectItem key={subject} value={subject}>
                              {subject}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <FieldError errors={[errors.subject]} />
                </Field>

                <Field data-invalid={!!errors.message}>
                  <FieldLabel htmlFor="message">Message</FieldLabel>
                  <Textarea
                    id="message"
                    rows={5}
                    placeholder="Your message..."
                    className="field-sizing-fixed resize-none"
                    aria-invalid={!!errors.message}
                    {...register("message")}
                  />
                  <FieldError errors={[errors.message]} />
                </Field>

                <Button
                  type="submit"
                  className={cn("mt-4 w-full", CONTROL_HEIGHT)}
                >
                  Send message
                </Button>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
