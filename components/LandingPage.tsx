"use client";

import { Button } from "@/components/ui/button";
import { SignInButton } from "@clerk/nextjs";
import {
  ArrowRight,
  Check,
  Coffee,
  Instagram,
  Linkedin,
  MapPin,
  Mic,
  Quote,
  ShieldCheck,
  Sparkles,
  Twitter,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

function AnimatedCounter({
  target,
  suffix = "",
}: {
  target: number;
  suffix?: string;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 2000;
          const steps = 60;
          const increment = target / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.3 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20 overflow-x-hidden">
      <main>
        {/* ================================================ */}
        {/* HERO — "We banned ghosting." Dark, massive, minimal */}
        {/* Visual: Full viewport, near-black bg, centered type */}
        {/* Font: text-8xl font-black, maximum visual weight */}
        {/* Whitespace: Very generous, content breathes */}
        {/* ================================================ */}
        <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-4 py-20 bg-foreground text-background overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMC4xNSIvPjwvc3ZnPg==')]" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/20 rounded-full blur-[120px]" />

          <div className="relative max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 text-white/80 text-sm font-medium mb-10 backdrop-blur-sm">
              <MapPin className="w-4 h-4" />
              <span>Now Live in Dublin</span>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-8 leading-[1.05]">
              We banned
              <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-primary via-pink-500 to-primary">
                ghosting.
              </span>
            </h1>

            <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-12 leading-relaxed font-light">
              MeetOnce is Dublin&apos;s dating app with standards. One curated
              match per week. Real coffee dates. And a zero-tolerance policy for
              people who waste your time.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-14">
              <SignInButton mode="modal" forceRedirectUrl="/dashboard">
                <Button
                  size="lg"
                  className="h-14 px-10 text-lg rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 font-semibold"
                >
                  Apply to Join
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </SignInButton>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-white/60">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-green-500/80" />
                <span>Verified profiles only</span>
              </div>
              <div className="hidden sm:block w-px h-4 bg-white/20" />
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-green-500/80" />
                <span>Dublin only</span>
              </div>
              <div className="hidden sm:block w-px h-4 bg-white/20" />
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500/80" />
                <span>Free during launch</span>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================ */}
        {/* THE PROBLEM — Editorial manifesto, Dublin-specific */}
        {/* Visual: Light bg, centered column, stacked statements */}
        {/* Font: text-xl regular weight, muted, building tension */}
        {/* Final line: Bold, full foreground color, the kicker */}
        {/* ================================================ */}
        <section className="py-20 md:py-32">
          <div className="max-w-2xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black mb-6 leading-tight tracking-tight">
                Dublin, we need to talk.
              </h2>
            </div>

            <div className="space-y-6 text-center">
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                You matched with 200 people this year.
                <br />
                You went on three dates.
              </p>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                Half were here for a stag weekend.
                <br />
                The other half vanished after day two.
              </p>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                You&apos;ve been ghosted so many times
                <br />
                you&apos;ve started doing it back.
              </p>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                And somehow, this is called "dating".
              </p>
              <p className="text-xl md:text-2xl font-bold text-foreground pt-6">
                It&apos;s not a you problem. It&apos;s a standards problem.
              </p>
            </div>
          </div>
        </section>

        {/* ================================================ */}
        {/* THE MEETONCE STANDARD — The key differentiator */}
        {/* Visual: Dark bg, left-border accent on each rule */}
        {/* Font: Rule titles text-2xl bold, body text-base light */}
        {/* Whitespace: Generous vertical spacing between rules */}
        {/* Feels like a code of conduct carved in stone */}
        {/* ================================================ */}
        <section className="py-20 md:py-32 bg-foreground text-background relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMC4xNSIvPjwvc3ZnPg==')]" />
          <div className="relative max-w-4xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black mb-6 tracking-tight">
                The MeetOnce Standard
              </h2>
              <p className="text-lg text-white/60 max-w-2xl mx-auto font-light">
                This isn&apos;t a suggestion. It&apos;s how it works.
              </p>
            </div>

            <div className="space-y-10 max-w-3xl mx-auto">
              <div className="border-l-2 border-primary pl-8">
                <h3 className="text-xl md:text-2xl font-bold mb-3">
                  If you match, you respond.
                </h3>
                <p className="text-white/60 leading-relaxed">
                  You get one match per week. One. The least you can do is say
                  yes or no. Silence isn&apos;t an option here.
                </p>
              </div>

              <div className="border-l-2 border-primary pl-8">
                <h3 className="text-xl md:text-2xl font-bold mb-3">
                  If you confirm, you show up.
                </h3>
                <p className="text-white/60 leading-relaxed">
                  Confirm a date and don&apos;t show? You&apos;re removed.
                  Permanently. No warnings. No second chances. We respect
                  everyone&apos;s time equally.
                </p>
              </div>

              <div className="border-l-2 border-primary pl-8">
                <h3 className="text-xl md:text-2xl font-bold mb-3">
                  If you meet, you&apos;re honest.
                </h3>
                <p className="text-white/60 leading-relaxed">
                  After every date, both people share brief feedback. Not a
                  review. Just honesty. It makes every future match better.
                </p>
              </div>
            </div>

            <div className="text-center mt-16">
              <p className="text-lg text-white/50 font-light italic">
                We&apos;re not trying to be harsh. We&apos;re trying to be worth
                your time.
              </p>
            </div>
          </div>
        </section>

        {/* ================================================ */}
        {/* HOW IT WORKS — 3 steps, outcome-focused, minimal */}
        {/* Visual: Light bg, 3-column grid, numbered cards */}
        {/* Font: Step numbers text-5xl muted, titles text-lg bold */}
        {/* CTA placement: Below steps, centered */}
        {/* ================================================ */}
        <section className="py-20 md:py-32">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tight">
                How it works.
              </h2>
              <p className="text-lg text-muted-foreground font-light">
                Three steps. No swiping involved.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Mic,
                  step: "01",
                  title: "Have a Conversation",
                  desc: "Five minutes. No forms, no quizzes. Just talk about what you actually want. We listen for the things a profile can't capture.",
                },
                {
                  icon: Sparkles,
                  step: "02",
                  title: "Get Your Match",
                  desc: "Every week, one person. Selected on values, lifestyle, and what you said matters. Not an algorithm guessing from swipe patterns.",
                },
                {
                  icon: Coffee,
                  step: "03",
                  title: "Show Up for Coffee",
                  desc: "Both interested? We pick the spot. You show up. That's it. That's the whole app.",
                },
              ].map((step, i) => (
                <div
                  key={i}
                  className="group relative flex flex-col p-8 rounded-2xl bg-background border border-border/50 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500"
                >
                  {/* <span className="text-5xl font-black text-primary/10 group-hover:text-primary/20 transition-colors mb-4">
                    {step.step}
                  </span> */}
                  <div className="w-12 h-12 rounded-xl bg-linear-to-br from-primary/20 to-pink-500/20 flex items-center justify-center mb-5 text-primary group-hover:scale-110 transition-transform">
                    <step.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================ */}
        {/* SOCIAL PROOF — Editorial testimonials + stats */}
        {/* Visual: Muted bg, asymmetric grid (3+2 cols) */}
        {/* Featured testimonial: Dark card, large quote */}
        {/* Stats bar: Dark bg, 4 columns, animated counters */}
        {/* ================================================ */}
        <section className="py-20 md:py-32 bg-muted/20">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tight">
                Dublin&apos;s already talking.
              </h2>
              <p className="text-lg text-muted-foreground font-light">
                Early members. Real reactions.
              </p>
            </div>

            <div className="grid md:grid-cols-5 gap-6 mb-14">
              <div className="md:col-span-3 flex flex-col justify-between p-10 rounded-2xl bg-foreground text-background relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-[80px]" />
                <div className="relative">
                  <Quote className="w-10 h-10 text-white/15 mb-6" />
                  <p className="text-xl md:text-2xl leading-relaxed mb-8 font-light">
                    &ldquo;He showed up on time, knew the plan, and we actually
                    talked for two hours. I&apos;d forgotten what that felt
                    like. Turns out dating is easy when both people actually
                    want to be there.&rdquo;
                  </p>
                  <div>
                    <p className="font-semibold text-lg">Sarah, 29</p>
                    <p className="text-sm text-white/60">Portobello</p>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 flex flex-col gap-6">
                <div className="flex-1 flex flex-col p-8 rounded-2xl bg-background border border-border/50">
                  <Quote className="w-7 h-7 text-primary/20 mb-4" />
                  <p className="text-foreground leading-relaxed mb-6 flex-1">
                    &ldquo;The no-tolerance thing isn&apos;t harsh. It&apos;s
                    the most respectful thing a dating app has ever done. It
                    means everyone there is actually serious.&rdquo;
                  </p>
                  <div>
                    <p className="font-semibold">Cian, 32</p>
                    <p className="text-sm text-muted-foreground">Smithfield</p>
                  </div>
                </div>
                <div className="flex-1 flex flex-col p-8 rounded-2xl bg-background border border-border/50">
                  <Quote className="w-7 h-7 text-primary/20 mb-4" />
                  <p className="text-foreground leading-relaxed mb-6 flex-1">
                    &ldquo;Deleted Hinge the day I signed up. If an app
                    won&apos;t even hold people accountable for showing up, why
                    would I trust it to find me someone good?&rdquo;
                  </p>
                  <div>
                    <p className="font-semibold">Aoife, 27</p>
                    <p className="text-sm text-muted-foreground">Ranelagh</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-foreground text-background p-10 md:p-14 relative overflow-hidden">
              <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMC4xNSIvPjwvc3ZnPg==')]" />
              <div className="relative grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                {[
                  { label: "Dublin Singles Joined", value: 475, suffix: "+" },
                  { label: "Real Dates Arranged", value: 100, suffix: "+" },
                  {
                    label: "Ghosts Tolerated",
                    value: 0,
                    suffix: "",
                  },
                  { label: "Second Date Rate", value: 68, suffix: "%" },
                ].map((stat, i) => (
                  <div key={i}>
                    <div className="text-3xl md:text-5xl font-black mb-2 tracking-tight text-white">
                      <AnimatedCounter
                        target={stat.value}
                        suffix={stat.suffix}
                      />
                    </div>
                    <div className="text-sm md:text-base text-white/60 font-medium">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ================================================ */}
        {/* SCARCITY — Dublin-only launch, founding members */}
        {/* Visual: Light bg, centered, progress bar accent */}
        {/* Creates urgency without desperation */}
        {/* ================================================ */}
        {/* <section className="py-20 md:py-32">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-10">
              <MapPin className="w-4 h-4" />
              Dublin-Only Launch
            </div>
            <h2 className="text-3xl md:text-5xl font-black mb-6 leading-tight tracking-tight">
              This is a Dublin thing.
              <br />
              <span className="text-muted-foreground">For now.</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed font-light">
              We&apos;re not trying to be everywhere. We&apos;re fixing dating
              in one city first. The first 1,000 members get founding access for
              life.
            </p>

            <div className="max-w-md mx-auto">
              <div className="flex justify-between text-sm mb-3">
                <span className="font-semibold">
                  <span className="text-primary">475</span> / 1,000 Founding
                  Members
                </span>
                <span className="text-muted-foreground">47.5% claimed</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-primary to-pink-500 rounded-full transition-all duration-1000"
                  style={{ width: "47.5%" }}
                />
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                Less than 525 founding spots remaining
              </p>
            </div>
          </div>
        </section> */}

        {/* ================================================ */}
        {/* FAQ — Clean accordion, skepticism-aware */}
        {/* Visual: Light bg, max-w-3xl, bordered details */}
        {/* ================================================ */}
        <section className="py-20 md:py-32 bg-muted/20">
          <div className="max-w-3xl mx-auto px-4">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tight">
                Questions people actually ask.
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-light">
                Fair. Here&apos;s the deal.
              </p>
            </div>
            <div className="space-y-2">
              {[
                {
                  q: "How is this different from Hinge or Bumble?",
                  a: "Those apps give you hundreds of options and hope you figure it out. We give you one. Every week, one match based on deep compatibility. And if someone confirms a date and doesn't show, they're gone. No other app does that.",
                },
                {
                  q: "Why only one match per week?",
                  a: "Because choice overload kills good decisions. One match forces intention. You pay attention. You show up. And if it doesn't work out, there's another one next week.",
                },
                {
                  q: "What happens if someone ghosts?",
                  a: "They're removed. Permanently. Confirm a date and don't show? Gone. No warnings, no second chances. That's the whole point of MeetOnce.",
                },
                {
                  q: "What's the voice conversation about?",
                  a: "Think of it like telling a friend what you're looking for. Five minutes, totally natural. We pick up on your values, energy and communication style. Things a text bio can never capture.",
                },
                {
                  q: "Where do the dates happen?",
                  a: "Public coffee spots across Dublin that we've vetted. Safe, casual, zero pressure. You show up, have a coffee, and see if there's something there.",
                },
                {
                  q: "What if I don't like my match?",
                  a: "Pass and you'll get a new one next week. No penalty for passing. The penalty is for confirming a date and not showing up. There's a difference.",
                },
                {
                  q: "Is it actually free?",
                  a: "Completely free during the Dublin launch. The first 1,000 members get founding access for life. After that, we'll see.",
                },
              ].map((item, i) => (
                <details
                  key={i}
                  className="group rounded-xl overflow-hidden border border-border/50 bg-background"
                >
                  <summary className="flex items-center justify-between p-5 cursor-pointer list-none font-semibold text-[15px] hover:bg-muted/30 transition-colors">
                    {item.q}
                    <div className="shrink-0 ml-4 w-7 h-7 rounded-lg bg-muted flex items-center justify-center transition-transform group-open:rotate-180">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-muted-foreground"
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </div>
                  </summary>
                  <div className="px-5 pb-5 text-muted-foreground text-sm leading-relaxed">
                    {item.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================ */}
        {/* FINAL CTA — Identity-based, movement-driven */}
        {/* Visual: Dark bg, full viewport height, centered */}
        {/* Font: text-7xl font-black headline */}
        {/* CTA: Large secondary button, centered */}
        {/* ================================================ */}
        <section className="min-h-[70vh] flex items-center justify-center px-4 bg-foreground text-background relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMC4xNSIvPjwvc3ZnPg==')]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px]" />
          <div className="relative max-w-3xl mx-auto text-center py-20">
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 tracking-tight leading-[1.1]">
              For people who
              <br />
              actually show up.
            </h2>
            <p className="text-lg md:text-xl text-white/60 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
              Dublin&apos;s dating app with standards. One match. One coffee.
              And the kind of accountability that makes the whole thing actually
              work.
            </p>
            <SignInButton mode="modal" forceRedirectUrl="/dashboard">
              <Button
                size="lg"
                variant="secondary"
                className="h-14 px-12 text-lg rounded-xl shadow-lg font-semibold"
              >
                Apply to Join
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </SignInButton>
            <p className="text-sm text-white/50 mt-8">
              Free during Dublin launch. Verified profiles only. Founding member
              spots are limited.
            </p>
          </div>
        </section>
      </main>

      {/* Footer — Minimal, clean */}
      <footer className="py-12 px-4 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold">MeetOnce</span>
            </div>

            <div className="flex items-center gap-8">
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Terms
              </a>
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Privacy
              </a>
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Contact
              </a>
            </div>

            <div className="flex items-center gap-3">
              <a
                href="#"
                className="p-2.5 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="p-2.5 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="p-2.5 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>
          <div className="mt-8 pt-8 text-center text-sm text-muted-foreground border-t border-border/50">
            <p>Built in Dublin, for Dublin.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
