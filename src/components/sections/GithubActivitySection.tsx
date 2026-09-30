import { github } from "@/content/portfolio";
import { siteConfig } from "@/lib/site";
import FloatingObject from "@/components/ui/FloatingObject";
import GlassCard from "@/components/ui/GlassCard";
import SectionLabel from "@/components/ui/SectionLabel";
import SplitHeading from "@/components/ui/SplitHeading";
import Scene from "./Scene";
import s from "./scenes.module.css";
import styles from "./github.module.css";

// ---- The shape real data will arrive in (e.g. from the GitHub GraphQL API) ----
export type ContributionDay = { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 };

export type GithubActivityData = {
  totalContributions: number;
  /** Oldest week first; each week Sunday → Saturday. */
  weeks: ContributionDay[][];
  publicRepos: number;
  topLanguages: { name: string; share: number }[];
  recentRepos: { name: string; url: string; description: string | null; pushedAt: string }[];
};

const WEEKS = 53;
const profile = siteConfig.socials.find((url) => new URL(url).hostname.endsWith("github.com"));

// Pass `data` once it's fetched; until then every cell is empty and every
// number is a dash — nothing is made up.
export default function GithubActivitySection({ data }: { data?: GithubActivityData }) {
  const weeks =
    data?.weeks ?? Array.from({ length: WEEKS }, () => Array.from({ length: 7 }, () => null));

  const stats = [
    { label: "Contributions this year", value: data?.totalContributions },
    { label: "Public repositories", value: data?.publicRepos },
    { label: "Top language", value: data?.topLanguages[0]?.name },
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

          <div
            className={styles.grid}
            role="img"
            aria-label={data ? `${data.totalContributions} contributions in the last year` : "Contribution graph, not connected yet"}
          >
            {weeks.map((week, w) =>
              week.map((day, d) => (
                <span key={`${w}-${d}`} className={styles.cell} data-level={day?.level ?? "empty"} />
              )),
            )}
          </div>

          <div className={styles.footer}>
            <p className={s.soon}>{data ? "Last 12 months" : "GitHub data will be connected"}</p>
            {profile && (
              <a className={`${styles.profile} ${s.focusable}`} href={profile} target="_blank" rel="noopener noreferrer">
                View profile ↗
              </a>
            )}
          </div>
        </GlassCard>
      </div>
    </Scene>
  );
}
