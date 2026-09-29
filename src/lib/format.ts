import { siteConfig } from "@/lib/site";

const ordinalRules = new Intl.PluralRules("en-US", { type: "ordinal" });
const ORDINAL_SUFFIX: Record<Intl.LDMLPluralRule, string> = {
  zero: "th",
  one: "st",
  two: "nd",
  few: "rd",
  many: "th",
  other: "th",
};

/** 1 → "1st", 12 → "12th", 1699 → "1,699th" */
export function ordinal(n: number) {
  return `${n.toLocaleString("en-US")}${ORDINAL_SUFFIX[ordinalRules.select(n)]}`;
}

const dateFormat = new Intl.DateTimeFormat("en-US", {
  timeZone: siteConfig.timeZone,
  weekday: "short",
  month: "short",
  day: "numeric",
  year: "numeric",
});

const timeFormat = new Intl.DateTimeFormat("en-US", {
  timeZone: siteConfig.timeZone,
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
  timeZoneName: "shortOffset",
});

/** "Wed, Sep 30, 2026 | 02:14:03 GMT+5:30", in the site's timezone */
export function formatSiteDateTime(date: Date) {
  return `${dateFormat.format(date)} | ${timeFormat.format(date)}`;
}
