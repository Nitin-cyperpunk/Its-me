import type { ReactNode } from "react";

export type FaqItem = {
  question: string;
  // Each entry is one paragraph; paragraphs fade in one after another.
  answer: ReactNode[];
};

// Answers marked PLACEHOLDER need your real details.
export const faqItems: FaqItem[] = [
  {
    question: "Who are you?",
    answer: [
      "I'm Nitin, a software developer graduating in 2026.",
      "I like turning ideas into products people actually use.",
    ],
  },
  {
    question: "What do you build?",
    answer: [
      // PLACEHOLDER: describe the kind of work you focus on.
      "Web applications, from the interface people click on to the logic behind it.",
    ],
  },
  {
    question: "What technologies do you work with?",
    answer: [
      // PLACEHOLDER: list your actual stack.
      "Mostly TypeScript, React and Next.js.",
      "I pick the tools that fit the problem, not the other way around.",
    ],
  },
  {
    question: "How much real-world experience do you have?",
    answer: [
      "I've completed 4 onsite internships so far.",
      "They covered both product-based and service-based startups, so I've seen how products are built in-house and how client projects get delivered.",
    ],
  },
  {
    question: "What is your approach to development?",
    answer: [
      // PLACEHOLDER: put this in your own words.
      "Understand the problem first, ship something small, then improve it with real feedback.",
    ],
  },
  {
    question: "What projects have you worked on?",
    answer: [
      // PLACEHOLDER: name 1–2 projects you're proud of.
      "Internship projects across product and client work, plus freelance builds for my own clients.",
    ],
  },
  {
    question: "Do you work with teams outside your timezone?",
    answer: [
      "Yes. I keep a flexible schedule and can overlap with different time zones.",
    ],
  },
  {
    question: "Are you available for work?",
    answer: [
      "Yes! I'm open to full-time roles as a 2026 graduate, and I take on freelance projects too.",
    ],
  },
  {
    question: "How can someone contact you?",
    answer: [
      <>
        Looking to hire me? Give me a call at{" "}
        <a href="tel:9975918430">9975918430</a>.
      </>,
    ],
  },
];
