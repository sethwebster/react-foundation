/**
 * Scoring System Explanation Page
 * Explains the React Impact Score in simple, accessible language
 */

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'How Library Scoring Works | React Foundation Store',
  description: 'Understanding how we measure library impact and distribute funding fairly',
};

export default function ScoringPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="space-y-8">
        {/* Hero */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white sm:text-5xl">
            How Library Scoring Works
          </h1>
          <p className="mt-4 text-xl text-white/70">
            A simple explanation of how we measure impact and share funding fairly
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-12 rounded-3xl border border-white/10 bg-slate-900/60 p-8 sm:p-12">

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
                <p className="mt-3 text-sm italic text-white/60">
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
                <p className="mt-3 text-sm italic text-white/60">
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
                <p className="mt-3 text-sm italic text-white/60">
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
                <p className="mt-3 text-sm italic text-white/60">
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
                <p className="mt-3 text-sm italic text-white/60">
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
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6">
              <p className="mb-4">Here's the math, but explained simply:</p>
              <div className="space-y-3 text-sm">
                <FormulaStep weight={30} label="Ecosystem Footprint" />
                <FormulaStep weight={25} label="Contribution Quality" />
                <FormulaStep weight={20} label="Maintainer Health" />
                <FormulaStep weight={15} label="Community Benefit" />
                <FormulaStep weight={10} label="Mission Alignment" />
                <div className="border-t border-white/10 pt-3">
                  <p className="font-semibold text-white">
                    = <span className="text-cyan-400">Your Library's Impact Score</span> (0-100%)
                  </p>
                </div>
              </div>
            </div>
            <p className="mt-4">
              Each library gets a score from 0% to 100%. The higher the score, the bigger the impact!
            </p>
          </Section>

          {/* How We Share Money */}
          <Section
            title="How We Share Funding 💰"
            icon="🤝"
          >
            <p className="mb-4">Once we know everyone's scores, sharing money is like sharing pizza:</p>
            <div className="space-y-4 rounded-xl border border-white/10 bg-white/[0.03] p-6">
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

            <div className="mt-6 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-6">
              <p className="font-semibold text-yellow-300">⚠️ Fair Play Rules:</p>
              <ul className="mt-3 list-disc space-y-2 pl-6 text-sm text-white/80">
                <li><strong>Minimum guarantee:</strong> Every library gets at least $5,000—even small helpers matter!</li>
                <li><strong>Maximum cap:</strong> No library can take more than 12% of the total pool—we share fairly!</li>
                <li><strong>Emergency fund:</strong> We save 10% for urgent fixes and special situations</li>
              </ul>
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
          <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-8 text-center">
            <p className="text-lg font-medium text-white">
              🎯 Our goal is simple: <strong>Reward the libraries that make the biggest positive impact</strong> on the React community.
            </p>
            <p className="mt-4 text-white/70">
              By measuring impact fairly and sharing funding transparently, we help amazing open source projects thrive!
            </p>
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
      <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-white sm:text-3xl">
        <span className="text-3xl">{icon}</span>
        {title}
      </h2>
      <div className="space-y-4 text-white/80">{children}</div>
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
    blue: 'border-blue-500/30 bg-blue-500/10',
    green: 'border-green-500/30 bg-green-500/10',
    purple: 'border-purple-500/30 bg-purple-500/10',
    yellow: 'border-yellow-500/30 bg-yellow-500/10',
    pink: 'border-pink-500/30 bg-pink-500/10',
  };

  return (
    <div className={`rounded-xl border p-6 ${colorClasses[color]}`}>
      <div className="mb-3 flex items-center gap-3">
        <span className="text-2xl">{emoji}</span>
        <div>
          <span className="mr-2 text-sm font-semibold text-white/60">#{number}</span>
          <span className="text-lg font-bold text-white">{title}</span>
        </div>
      </div>
      <div className="space-y-3 text-sm text-white/80">{children}</div>
    </div>
  );
}

function FormulaStep({ weight, label }: { weight: number; label: string }) {
  return (
    <div className="flex items-center gap-2 text-white/80">
      <span className="font-mono font-semibold text-cyan-400">{weight}%</span>
      <span>×</span>
      <span>{label}</span>
    </div>
  );
}

function Step({ number, children }: { number: number; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-sm font-bold text-cyan-300">
        {number}
      </div>
      <p className="text-white/80">{children}</p>
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
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <div className="mb-2 flex items-center gap-2">
        <span className="text-2xl">{emoji}</span>
        <span className="font-semibold text-white">{title}</span>
      </div>
      <p className="text-sm text-white/70">{children}</p>
    </div>
  );
}
