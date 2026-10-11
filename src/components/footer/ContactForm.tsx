"use client";

import { useEffect, useId, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { siteConfig } from "@/lib/site";
import {
  LIMITS,
  TOPICS,
  emailjsConfig,
  toTemplateParams,
  validateContact,
  type ContactErrors,
  type ContactFields,
} from "./contact";
import styles from "./contact-form.module.css";

type Status = "idle" | "sending" | "sent" | "error";

const EMPTY: ContactFields = { name: "", email: "", topic: "", message: "" };
// One message a minute per browser; enforced by EmailJS's own rate limiter.
const THROTTLE_MS = 60_000;

const config = emailjsConfig();

export default function ContactForm() {
  const id = useId();
  const [fields, setFields] = useState<ContactFields>(EMPTY);
  const [touched, setTouched] = useState<Partial<Record<keyof ContactFields, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [statusText, setStatusText] = useState("");
  // guards against double submits (the button is only aria-disabled, and state updates are async)
  const inFlight = useRef(false);

  useEffect(() => {
    if (!config && process.env.NODE_ENV === "development") {
      console.warn(
        "[contact form] EmailJS isn't configured: set NEXT_PUBLIC_EMAILJS_SERVICE_ID, NEXT_PUBLIC_EMAILJS_TEMPLATE_ID and NEXT_PUBLIC_EMAILJS_PUBLIC_KEY in .env.local (see .env.example).",
      );
    }
  }, []);

  const errors: ContactErrors = validateContact(fields);
  const visibleError = (field: keyof ContactFields) => (submitted || touched[field] ? errors[field] : undefined);

  const update =
    (field: keyof ContactFields) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setFields((f) => ({ ...f, [field]: e.target.value }));
      if (status === "sent" || status === "error") setStatus("idle");
    };
  const blur = (field: keyof ContactFields) => () => setTouched((t) => ({ ...t, [field]: true }));

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (inFlight.current) return;
    setSubmitted(true);

    const form = e.currentTarget;
    const firstInvalid = (Object.keys(fields) as (keyof ContactFields)[]).find((name) => errors[name]);
    if (firstInvalid) {
      // take the visitor to the first field that needs attention (by name: the
      // aria-invalid markers only appear on the next render)
      (form.elements.namedItem(firstInvalid) as HTMLElement | null)?.focus();
      return;
    }

    // honeypot: people never see this field, bots fill everything in
    if ((new FormData(form).get("company") as string | null)?.trim()) {
      setStatus("error");
      setStatusText("Something went wrong sending that. Please try again in a moment.");
      return;
    }

    if (!config) {
      setStatus("error");
      setStatusText("The form isn't connected just yet — please reach out on LinkedIn or GitHub instead.");
      return;
    }

    inFlight.current = true;
    setStatus("sending");
    setStatusText("Sending…");
    try {
      // loaded on first send, so the SDK never weighs down the page
      const { default: emailjs } = await import("@emailjs/browser");
      await emailjs.send(config.serviceId, config.templateId, toTemplateParams(fields, siteConfig.timeZone), {
        publicKey: config.publicKey,
        blockHeadless: true,
        limitRate: { id: "nitinverse-contact", throttle: THROTTLE_MS },
      });
      // only now, with EmailJS's confirmation in hand
      setFields(EMPTY);
      setTouched({});
      setSubmitted(false);
      setStatus("sent");
      setStatusText("Message sent. Thanks for reaching out — I'll get back to you.");
    } catch (err) {
      const code = (err as { status?: number } | null)?.status;
      setStatus("error");
      setStatusText(
        code === 429
          ? "You've just sent a message — give it a minute before sending another."
          : "That didn't go through. Please check your connection and try again.",
      );
    } finally {
      inFlight.current = false;
    }
  }

  const sending = status === "sending";
  const field = (name: keyof ContactFields) => {
    const error = visibleError(name);
    return {
      id: `${id}-${name}`,
      name,
      value: fields[name],
      onChange: update(name),
      onBlur: blur(name),
      required: true,
      "aria-invalid": error ? true : undefined,
      "aria-describedby": [error && `${id}-${name}-error`, name === "message" && `${id}-count`].filter(Boolean).join(" ") || undefined,
    } as const;
  };
  const errorText = (name: keyof ContactFields) => {
    const error = visibleError(name);
    return error ? (
      <p id={`${id}-${name}-error`} className={styles.error}>
        {error}
      </p>
    ) : null;
  };

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate aria-busy={sending} aria-label="Contact form">
      <div className={styles.row}>
        <div className={styles.field} data-invalid={visibleError("name") ? "" : undefined}>
          <label className={styles.label} htmlFor={`${id}-name`}>
            Name
          </label>
          <input {...field("name")} className={styles.control} type="text" autoComplete="name" maxLength={LIMITS.name} placeholder="Your name" />
          {errorText("name")}
        </div>

        <div className={styles.field} data-invalid={visibleError("email") ? "" : undefined}>
          <label className={styles.label} htmlFor={`${id}-email`}>
            Email
          </label>
          <input
            {...field("email")}
            className={styles.control}
            type="email"
            inputMode="email"
            autoComplete="email"
            spellCheck={false}
            maxLength={LIMITS.email}
            placeholder="you@domain.com"
          />
          {errorText("email")}
        </div>
      </div>

      <div className={styles.field} data-invalid={visibleError("topic") ? "" : undefined}>
        <label className={styles.label} htmlFor={`${id}-topic`}>
          What&apos;s this about?
        </label>
        <div className={styles.selectWrap}>
          <select {...field("topic")} className={`${styles.control} ${styles.select}`} data-empty={fields.topic ? undefined : ""}>
            <option value="" disabled>
              Choose one
            </option>
            {TOPICS.map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </select>
          <svg className={styles.chevron} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        {errorText("topic")}
      </div>

      <div className={styles.field} data-invalid={visibleError("message") ? "" : undefined}>
        <label className={styles.label} htmlFor={`${id}-message`}>
          Message
        </label>
        <textarea
          {...field("message")}
          className={`${styles.control} ${styles.textarea}`}
          rows={4}
          maxLength={LIMITS.message}
          placeholder="A few lines about what you have in mind"
        />
        <div className={styles.meta}>
          {errorText("message")}
          <span id={`${id}-count`} className={styles.count} data-near={fields.message.length > LIMITS.message * 0.9 ? "" : undefined}>
            {fields.message.length} / {LIMITS.message}
            <span className={styles.srOnly}> characters</span>
          </span>
        </div>
      </div>

      {/* honeypot — hidden from people and assistive tech; bots tend to fill it */}
      <div className={styles.honeypot} aria-hidden="true">
        <label htmlFor={`${id}-company`}>Company</label>
        <input id={`${id}-company`} name="company" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>

      <div className={styles.actions}>
        {/* aria-disabled rather than disabled: a disabled button drops keyboard focus to <body>.
            Repeat submits are blocked by the in-flight guard in onSubmit. */}
        <button type="submit" className={styles.submit} aria-disabled={sending} data-state={status}>
          <span>{sending ? "Sending…" : "Send it my way"}</span>
          {!sending && (
            <span className={styles.arrow} aria-hidden="true">
              ↗
            </span>
          )}
          {sending && <span className={styles.spinner} aria-hidden="true" />}
        </button>

        <p className={styles.note}>
          <svg viewBox="0 0 60 40" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
            <path d="M56 34C40 36 20 30 10 10" />
            <path d="M5 16 10 9l7 3" strokeLinejoin="round" />
          </svg>
          <span>I usually reply within a day or two :)</span>
        </p>
      </div>

      <p className={styles.status} role="status" aria-live="polite" data-state={status}>
        {status === "sent" || status === "error" ? statusText : ""}
      </p>
    </form>
  );
}
