/* eslint-disable react/no-unescaped-entities */
/**
 * Scoring System Explanation Page
 * Explains the React Impact Score in simple, accessible language
 */

import { Metadata } from 'next';
import { InstallationStatusDashboard } from '@/components/ris/InstallationStatusDashboard';
import { ScoringWeightsPieChart } from '@/components/ris/ScoringWeightsPieChart';

export const metadata: Metadata = {
  title: 'How Library Scoring Works | React Foundation Store',
  description: 'Understanding how we measure library impact and distribute funding fairly',
};

export default function ScoringPage() {
  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <div className="space-y-8">
          {/* Hero */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground sm:text-5xl">
              How Library Scoring Works
            </h1>
            <p className="mt-4 text-xl text-foreground/70">
              A simple explanation of how we measure impact and share funding fairly
            </p>
          </div>

          {/* Main Content */}
          <div className="space-y-12 rounded-3xl border border-border bg-card p-8 sm:p-12">

          {/* The Big Idea */}
          <Section
            title="The Big Idea 💡"
            icon="🎯"
          >
            <p>
              Imagine you and your friends are working together to build the coolest treehouse in the neighborhood.
              Some friends bring the wood, others bring the tools, some help with the design, and some teach everyone how to build safely.
            </p>
            <p className="mt-4">
              <strong>Everyone helps in different ways, but everyone is important!</strong>
            </p>
            <p className="mt-4">
              Our scoring system is like a fair way to thank each friend based on how much they helped.
              Instead of just counting how many nails someone hammered, we look at the <em>full picture</em> of their contribution.
            </p>
          </Section>

          {/* What We Measure */}
          <Section
            title="What We Measure 📊"
            icon="🔍"
          >
            <p className="mb-6">
              We look at <strong>5 different things</strong> to understand how important a library is to the React community.
              Think of these like different subjects in school—you get grades in each one!
            </p>

            <div className="space-y-6">
              <ScoreComponent
                number={1}
                title="Ecosystem Footprint (30%)"
                color="blue"
                emoji="🌍"
              >
                <p><strong>This measures: How many people use this library?</strong></p>
                <p className="mt-2">Just like how a popular book gets borrowed from the library more often, we count:</p>
                <ul className="mt-2 list-disc space-y-1 pl-6">
                  <li>How many times it gets downloaded</li>
                  <li>How many other projects depend on it</li>
                  <li>How often it appears in big, important projects</li>
                </ul>
                <p className="mt-3 text-sm italic text-foreground/60">
                  Why it matters: If lots of people rely on something, it's super important to keep it working!
                </p>
              </ScoreComponent>

              <ScoreComponent
                number={2}
                title="Contribution Quality (25%)"
                color="green"
                emoji="✨"
              >
                <p><strong>This measures: Are the changes high quality and helpful?</strong></p>
                <p className="mt-2">It's not just about doing <em>more</em> work—it's about doing <em>good</em> work! We check:</p>
                <ul className="mt-2 list-disc space-y-1 pl-6">
                  <li>Do the fixes actually solve real problems?</li>
                  <li>How quickly do maintainers help people who need support?</li>
                  <li>How many different people contribute ideas?</li>
                </ul>
                <p className="mt-3 text-sm italic text-foreground/60">
                  Why it matters: Quality beats quantity! One awesome fix is better than 100 tiny, unhelpful changes.
                </p>
              </ScoreComponent>

              <ScoreComponent
                number={3}
                title="Maintainer Health (20%)"
                color="purple"
                emoji="💪"
              >
                <p><strong>This measures: Is the team healthy and sustainable?</strong></p>
                <p className="mt-2">Imagine trying to take care of a garden all by yourself—it's hard! A healthy team:</p>
                <ul className="mt-2 list-disc space-y-1 pl-6">
                  <li>Has multiple people helping (not just one burned-out person)</li>
                  <li>Releases updates regularly (like watering plants on schedule)</li>
                  <li>Responds to problems quickly</li>
                </ul>
                <p className="mt-3 text-sm italic text-foreground/60">
                  Why it matters: We want libraries to last for years, not crash and burn because one person gets tired.
                </p>
              </ScoreComponent>

              <ScoreComponent
                number={4}
                title="Community Benefit (15%)"
                color="yellow"
                emoji="🎓"
              >
                <p><strong>This measures: Does this help people learn and grow?</strong></p>
                <p className="mt-2">The best libraries don't just work—they teach! We look for:</p>
                <ul className="mt-2 list-disc space-y-1 pl-6">
                  <li>Clear, easy-to-read documentation (like instruction manuals)</li>
                  <li>Tutorials that help beginners get started</li>
                  <li>Helpful answers to people's questions</li>
                </ul>
                <p className="mt-3 text-sm italic text-foreground/60">
                  Why it matters: When people help others learn, everyone in the community gets smarter!
                </p>
              </ScoreComponent>

              <ScoreComponent
                number={5}
                title="Mission Alignment (10%)"
                color="pink"
                emoji="🎯"
              >
                <p><strong>This measures: Does this match React's goals for the future?</strong></p>
                <p className="mt-2">React has some big goals, like making apps faster and more accessible. We check if libraries:</p>
                <ul className="mt-2 list-disc space-y-1 pl-6">
                  <li>Work for people with disabilities (accessibility)</li>
                  <li>Are fast and efficient</li>
                  <li>Use modern best practices (like TypeScript)</li>
                  <li>Work with new React features</li>
                </ul>
                <p className="mt-3 text-sm italic text-foreground/60">
                  Why it matters: We want to support libraries that help React's vision for the future!
                </p>
              </ScoreComponent>
            </div>
          </Section>

          {/* How We Calculate */}
          <Section
            title="How We Calculate the Score 🧮"
            icon="📐"
          >
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Pie Chart */}
              <div className="rounded-xl border border-border/10 bg-background/[0.03] p-6">
                <p className="mb-4 text-center font-semibold text-foreground">Component Weights</p>
                <ScoringWeightsPieChart />
              </div>

              {/* Formula */}
              <div className="rounded-xl border border-border/10 bg-background/[0.03] p-6">
                <p className="mb-4 font-semibold text-foreground">The Math, Simplified:</p>
                <div className="space-y-3 text-sm">
                  <FormulaStep weight={30} label="Ecosystem Footprint" />
                  <FormulaStep weight={25} label="Contribution Quality" />
                  <FormulaStep weight={20} label="Maintainer Health" />
                  <FormulaStep weight={15} label="Community Benefit" />
                  <FormulaStep weight={10} label="Mission Alignment" />
                  <div className="border-t border-border/10 pt-3">
                    <p className="font-semibold text-foreground">
                      = <span className="text-cyan-400">Your Library's Impact Score</span> (0-100%)
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <p className="mt-4 text-center">
              Each library gets a score from 0% to 100%. The higher the score, the bigger the impact!
            </p>
          </Section>

          {/* How We Share Money */}
          <Section
            title="How We Share Funding 💰"
            icon="🤝"
          >
            <p className="mb-4">Once we know everyone's scores, sharing money is like sharing pizza:</p>
            <div className="space-y-4 rounded-xl border border-border/10 bg-background/[0.03] p-6">
              <Step number={1}>
                <strong>Add up all the scores</strong> from every library
              </Step>
              <Step number={2}>
                <strong>Figure out each library's "slice"</strong> by dividing their score by the total
              </Step>
              <Step number={3}>
                <strong>Multiply by the total funding pool</strong> to get their dollar amount
              </Step>
            </div>

            <div className="mt-6 rounded-xl border border-warning/30 bg-warning/10 p-6">
              <p className="font-semibold text-yellow-300">⚠️ Fair Play Rules:</p>
              <ul className="mt-3 list-disc space-y-2 pl-6 text-sm text-foreground/80">
                <li><strong>Eligibility threshold:</strong> Only libraries with meaningful impact qualify for funding—quality over quantity!</li>
                <li><strong>Minimum score:</strong> Must have a RIS score above the baseline threshold to receive any allocation</li>
                <li><strong>Maximum cap:</strong> No library can take more than 12% of the total pool—we share fairly!</li>
                <li><strong>Emergency fund:</strong> We save 10% for urgent fixes and special situations</li>
              </ul>
              <p className="mt-4 text-sm italic text-foreground/70">
                💡 <strong>Why no guaranteed minimum?</strong> With limited funds, we focus on libraries making the biggest impact.
                This ensures funds go where they create the most value for the ecosystem, not spread thin across everyone.
              </p>
            </div>
          </Section>

          {/* Why This Is Fair */}
          <Section
            title="Why This System Is Fair 🌟"
            icon="⚖️"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <BenefitCard
                emoji="📏"
                title="Measures What Matters"
              >
                We don't just count stars or downloads. We look at the real value a library brings.
              </BenefitCard>
              <BenefitCard
                emoji="🛡️"
                title="Prevents Gaming"
              >
                You can't cheat by making lots of tiny, useless changes. We measure quality, not quantity!
              </BenefitCard>
              <BenefitCard
                emoji="🔍"
                title="Totally Transparent"
              >
                Anyone can see the scores and how we calculated them. No secrets!
              </BenefitCard>
              <BenefitCard
                emoji="🌱"
                title="Rewards Sustainability"
              >
                We care about libraries that will be around for years, not just flash-in-the-pan projects.
              </BenefitCard>
            </div>
          </Section>

          {/* Final Thought */}
          <div className="rounded-2xl border border-primary/30 bg-primary/10 p-8 text-center">
            <p className="text-lg font-medium text-foreground">
              🎯 Our goal is simple: <strong>Reward the libraries that make the biggest positive impact</strong> on the React community.
            </p>
            <p className="mt-4 text-foreground/70">
              By measuring impact fairly and sharing funding transparently, we help amazing open source projects thrive!
            </p>
          </div>

          <div className="border-t border-border/20 pt-12"></div>

          {/* GitHub App Installation Section */}
          <Section
            title="Want Your Library Included? 📲"
            icon="🚀"
          >
            <div className="space-y-6">
              <p className="text-lg">
                <strong>Maintainers:</strong> Install our GitHub App to get <em>real-time score updates</em> and increase your library's visibility for funding opportunities!
              </p>

              {/* Benefits */}
              <div className="grid gap-4 sm:grid-cols-2">
                <BenefitCard
                  emoji="⚡"
                  title="Real-time Updates"
                >
                  See your score update immediately when you merge PRs, close issues, or publish releases. No waiting for monthly collection!
                </BenefitCard>
                <BenefitCard
                  emoji="💰"
                  title="Funding Opportunities"
                >
                  Higher scores mean larger funding allocations. Track your progress and optimize your impact!
                </BenefitCard>
                <BenefitCard
                  emoji="🔍"
                  title="Full Transparency"
                >
                  See exactly how your work impacts your score. Verify all calculations yourself!
                </BenefitCard>
                <BenefitCard
                  emoji="🎯"
                  title="Public Visibility"
                >
                  Show up on the libraries dashboard and demonstrate your project's impact to the community!
                </BenefitCard>
              </div>

              {/* Install Button */}
              <div className="text-center">
                <a
                  href={process.env.NEXT_PUBLIC_GITHUB_APP_INSTALL_URL || 'https://github.com/apps/react-foundation-ris-collector/installations/new'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-lg font-semibold text-primary-foreground transition-transform hover:scale-105"
                >
                  <span>📲</span>
                  Install React Foundation RIS Collector
                </a>
                <p className="mt-3 text-sm text-foreground/60">
                  Free • 2-minute setup • Read-only access
                </p>
              </div>

              {/* Privacy & Data Transparency */}
              <div className="rounded-xl border border-border/10 bg-background/30 p-6">
                <h4 className="mb-4 font-semibold text-foreground">🔒 Privacy & Data Transparency</h4>
                <div className="space-y-3 text-sm text-foreground/80">
                  <div>
                    <strong className="text-foreground">What we collect:</strong>
                    <ul className="mt-1 list-disc pl-6 text-foreground/70">
                      <li>Pull requests (title, state, merged date, size)</li>
                      <li>Issues (title, state, created/closed dates, labels)</li>
                      <li>Commits (date, author, message)</li>
                      <li>Releases (version, publish date)</li>
                    </ul>
                  </div>
                  <div>
                    <strong className="text-foreground">What we DON'T collect:</strong>
                    <ul className="mt-1 list-disc pl-6 text-foreground/70">
                      <li>Your code or file contents</li>
                      <li>Secrets, credentials, or environment variables</li>
                      <li>Private repository data</li>
                      <li>Personal information beyond public GitHub profiles</li>
                    </ul>
                  </div>
                  <div>
                    <strong className="text-foreground">How it's used:</strong>
                    <p className="mt-1 text-foreground/70">
                      All data is used solely to calculate RIS scores and distribute funding fairly.
                      Historical activity is cached for score calculation over 12-month windows.
                    </p>
                  </div>
                  <div>
                    <strong className="text-foreground">Your control:</strong>
                    <p className="mt-1 text-foreground/70">
                      You can uninstall the app at any time. We'll stop collecting new data immediately,
                      though historical data remains for score calculation consistency.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Section>
        </div>

        {/* Live Status Dashboard */}
        <div className="mt-12">
          <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-foreground sm:text-3xl">
            <span className="text-3xl">📊</span>
            Live Library Status
          </h2>
          <p className="mb-6 text-foreground/70">
            See which React ecosystem libraries have real-time updates enabled and their current scores.
          </p>
          <InstallationStatusDashboard />
        </div>
      </div>
    </div>
    </div>
  );
}

// Helper Components

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-foreground sm:text-3xl">
        <span className="text-3xl">{icon}</span>
        {title}
      </h2>
      <div className="space-y-4 text-foreground/80">{children}</div>
    </section>
  );
}

function ScoreComponent({
  number,
  title,
  color,
  emoji,
  children,
}: {
  number: number;
  title: string;
  color: 'blue' | 'green' | 'purple' | 'yellow' | 'pink';
  emoji: string;
  children: React.ReactNode;
}) {
  const colorClasses = {
    blue: 'border-primary/30 bg-primary/10',
    green: 'border-success/30 bg-success/10',
    purple: 'border-accent/30 bg-accent/10',
    yellow: 'border-warning/30 bg-warning/10',
    pink: 'border-pink-500/30 bg-accent/10',
  };

  return (
    <div className={`rounded-xl border p-6 ${colorClasses[color]}`}>
      <div className="mb-3 flex items-center gap-3">
        <span className="text-2xl">{emoji}</span>
        <div>
          <span className="mr-2 text-sm font-semibold text-foreground/60">#{number}</span>
          <span className="text-lg font-bold text-foreground">{title}</span>
        </div>
      </div>
      <div className="space-y-3 text-sm text-foreground/80">{children}</div>
    </div>
  );
}

function FormulaStep({ weight, label }: { weight: number; label: string }) {
  return (
    <div className="flex items-center gap-2 text-foreground/80">
      <span className="font-mono font-semibold text-cyan-400">{weight}%</span>
      <span>×</span>
      <span>{label}</span>
    </div>
  );
}

function Step({ number, children }: { number: number; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-cyan-300">
        {number}
      </div>
      <p className="text-foreground/80">{children}</p>
    </div>
  );
}

function BenefitCard({
  emoji,
  title,
  children,
}: {
  emoji: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border/10 bg-background/[0.03] p-4">
      <div className="mb-2 flex items-center gap-2">
        <span className="text-2xl">{emoji}</span>
        <span className="font-semibold text-foreground">{title}</span>
      </div>
      <p className="text-sm text-foreground/70">{children}</p>
    </div>
  );
}
