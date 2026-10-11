// Contact form rules and the EmailJS payload, kept free of React so they're easy to test.

export const TOPICS = [
  "Just saying hi",
  "Chit-chat",
  "Hangout / Coffee chat",
  "Project / Collaboration",
  "Job / Internship",
  "Mentorship / Guidance",
  "Freelance enquiry",
  "Something else",
] as const;

export const LIMITS = { name: 100, email: 254, message: 1000 } as const;

export type ContactFields = { name: string; email: string; topic: string; message: string };
export type ContactErrors = Partial<Record<keyof ContactFields, string>>;

// Deliberately simple: something@something.tld, no spaces. EmailJS / the inbox does the rest.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateContact(fields: ContactFields): ContactErrors {
  const errors: ContactErrors = {};
  const name = fields.name.trim();
  const email = fields.email.trim();
  const message = fields.message.trim();

  if (!name) errors.name = "Tell me what to call you.";
  else if (name.length > LIMITS.name) errors.name = `Keep it under ${LIMITS.name} characters.`;

  if (!email) errors.email = "I'll need an email to reply to.";
  else if (email.length > LIMITS.email || !EMAIL.test(email)) errors.email = "That email doesn't look quite right.";

  if (!(TOPICS as readonly string[]).includes(fields.topic)) errors.topic = "Pick whichever fits best.";

  if (!message) errors.message = "Write a line or two.";
  else if (message.length > LIMITS.message) errors.message = `Keep it under ${LIMITS.message} characters.`;

  return errors;
}

/*
  Variable names used by the EmailJS template (see .env.example for setup):
    {{name}} {{email}} {{title}} {{message}} {{time}}  — and Reply-To: {{reply_to}}
  These match EmailJS's default "Contact Us" template, plus reply_to.
*/
export function toTemplateParams(fields: ContactFields, timeZone: string, now = new Date()) {
  const email = fields.email.trim();
  return {
    name: fields.name.trim(),
    email,
    reply_to: email,
    title: fields.topic,
    message: fields.message.trim(),
    time: now.toLocaleString("en-IN", { timeZone, dateStyle: "medium", timeStyle: "short" }) + ` (${timeZone})`,
  };
}

export const emailjsConfig = () => {
  const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
  const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
  const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
  return serviceId && templateId && publicKey ? { serviceId, templateId, publicKey } : null;
};
