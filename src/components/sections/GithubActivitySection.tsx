import { github } from "@/content/portfolio";
import { getGithubActivity, githubLogin, type GithubActivityData } from "@/lib/github";
import { findProfile } from "@/lib/site";
import FloatingObject from "@/components/ui/FloatingObject";
import GlassCard from "@/components/ui/GlassCard";
import SectionLabel from "@/components/ui/SectionLabel";
import SplitHeading from "@/components/ui/SplitHeading";
import Scene from "./Scene";
import s from "./scenes.module.css";
import styles from "./github.module.css";

const profile = findProfile("github.com");
const login = profile && githubLogin(profile);

const dayLabel = (count: number, date: string) => {
  const day = new Date(`${date}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
  return `${count === 0 ? "No" : count} contribution${count === 1 ? "" : "s"} on ${day}`;
};

// Server-rendered from GitHub's public data (lib/github.ts, cached for hours).
// Anything that couldn't be loaded shows as "—" or a plain fallback — never made up.
export default async function GithubActivitySection() {
  const data: GithubActivityData | null = login ? await getGithubActivity(login) : null;
  const calendar = data?.calendar ?? null;

  const stats = [
    { label: "Contributions, last 12 months", value: calendar?.totalContributions.toLocaleString("en-IN") },
    { label: "Public repositories", value: data?.publicRepos },
    { label: "Most-used language", value: data?.topLanguage },
  ];

  return (
    <Scene id="github" labelledBy="github-title" className={styles.github}>
      <FloatingObject shape="prism" className={styles.prism} from="top" depth={0.6} float={10} desktopOnly />

      <div className={s.content} data-scene-content>
        <SectionLabel index="06">GitHub activity</SectionLabel>
        <SplitHeading id="github-title" lines={github.heading} className={styles.title} />

        <GlassCard className={styles.panel} data-reveal="item">
          <dl className={styles.stats}>
            {stats.map((stat) => (
              <div key={stat.label}>
                <dt className={s.soon}>{stat.label}</dt>
                <dd className={styles.value}>{stat.value ?? "—"}</dd>
              </div>
            ))}
          </dl>

          {calendar ? (
            // row-reverse: on narrow screens the scroller opens on the most recent weeks
            <div className={styles.scroller} tabIndex={0} aria-label="Contribution graph, scrollable">
              <div
                className={styles.grid}
                role="img"
                aria-label={`${calendar.totalContributions} contributions on GitHub in the last 12 months, by ${login}`}
              >
                {calendar.weeks.map((week, w) =>
                  week.map((day, d) =>
                    day ? (
                      <span
                        key={`${w}-${d}`}
                        className={styles.cell}
                        data-level={day.level}
                        title={dayLabel(day.count, day.date)}
                      />
                    ) : (
                      <span key={`${w}-${d}`} className={styles.cell} data-level="none" />
                    ),
                  ),
                )}
              </div>
            </div>
          ) : (
            <p className={styles.fallback} role="status">
              The contribution graph couldn&apos;t be loaded from GitHub right now — it&apos;s always up to date on the
              profile.
            </p>
          )}

          <div className={styles.footer}>
            {calendar ? (
              <div className={styles.legend} aria-hidden="true">
                <span className={s.soon}>Less</span>
                {[0, 1, 2, 3, 4].map((level) => (
                  <span key={level} className={styles.cell} data-level={level} />
                ))}
                <span className={s.soon}>More</span>
              </div>
            ) : (
              <span />
            )}
            {profile && (
              <a className={`${styles.profile} ${s.focusable}`} href={profile} target="_blank" rel="noopener noreferrer">
                View GitHub profile ↗
              </a>
            )}
          </div>
        </GlassCard>
      </div>
    </Scene>
  );
}
