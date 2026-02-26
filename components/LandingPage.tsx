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
  Quote,
  ShieldCheck,
  Sparkles,
  Twitter,
  Users,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

// ─── Animated number counter ─────────────────────────────────────────────────
function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [value, setValue] = useState(0);
  const el = useRef<HTMLSpanElement>(null);
  const done = useRef(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting || done.current) return;
        done.current = true;
        const steps = 60;
        const ms = 2000 / steps;
        let i = 0;
        const id = setInterval(() => {
          i++;
          setValue(Math.round((to / steps) * i));
          if (i >= steps) {
            setValue(to);
            clearInterval(id);
          }
        }, ms);
      },
      { threshold: 0.4 },
    );
    if (el.current) obs.observe(el.current);
    return () => obs.disconnect();
  }, [to]);

  return (
    <span ref={el}>
      {value}
      {suffix}
    </span>
  );
}

// ─── Live countdown to next intake (6 weeks out) ─────────────────────────────
function Countdown() {
  const target = useRef<Date | null>(null);
  const [t, setT] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    if (!target.current) {
      const d = new Date();
      d.setDate(d.getDate() + 42);
      d.setHours(23, 59, 59, 0);
      target.current = d;
    }
    const tick = () => {
      const diff = (target.current!.getTime() - Date.now()) / 1000;
      if (diff <= 0) return;
      setT({
        d: Math.floor(diff / 86400),
        h: Math.floor((diff % 86400) / 3600),
        m: Math.floor((diff % 3600) / 60),
        s: Math.floor(diff % 60),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex items-end justify-center gap-2 md:gap-3">
      {[
        { v: t.d, label: "days" },
        { v: t.h, label: "hours" },
        { v: t.m, label: "min" },
        { v: t.s, label: "sec" },
      ].map(({ v, label }, i) => (
        <div key={i} className="flex flex-col items-center gap-1.5">
          <div className="w-[68px] md:w-20 h-[68px] md:h-20 rounded-2xl bg-foreground text-background flex items-center justify-center text-2xl md:text-3xl font-black tabular-nums tracking-tight">
            {String(v).padStart(2, "0")}
          </div>
          <span className="text-[10px] md:text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Reusable section CTA ─────────────────────────────────────────────────────
function CTAButton({
  label,
  variant = "default",
}: {
  label: string;
  variant?: "default" | "outline" | "secondary";
}) {
  return (
    <SignInButton mode="modal" forceRedirectUrl="/dashboard">
      <Button
        size="lg"
        variant={variant}
        className="h-14 px-10 text-base font-semibold rounded-xl shadow-lg transition-all duration-300 hover:scale-[1.02]"
      >
        {label}
        <ArrowRight className="ml-2 w-4 h-4" />
      </Button>
    </SignInButton>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden">
      <main>
        {/* ── 1. HERO ─────────────────────────────────────────────────────── */}
        {/* White bg, massive black uppercase type, primary gradient accent   */}
        <section className="relative min-h-screen flex flex-col items-center justify-center px-4 py-24 overflow-hidden">
          {/* Subtle warm glow — premium feel */}
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-primary/10 blur-[140px]"
          />

          <div className="relative max-w-5xl mx-auto text-center">
            {/* Location pill */}
            <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-border bg-muted text-muted-foreground text-xs font-semibold uppercase tracking-wider mb-12">
              <MapPin className="w-3.5 h-3.5" />
              Dublin, Ireland
            </div>

            {/* Main headline */}
            <h1 className="text-[clamp(3rem,12vw,8rem)] font-black leading-[0.95] tracking-tighter uppercase mb-8">
              We Banned
              <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-primary via-pink-400 to-primary">
                Ghosting.
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed mb-10">
              MeetOnce is Dublin&apos;s strict dating app. One curated match per
              week. Real coffee dates. Zero tolerance for flakes.
            </p>

            {/* Primary CTA */}
            <div className="flex justify-center mb-6">
              <SignInButton mode="modal" forceRedirectUrl="/dashboard">
                <Button
                  size="lg"
                  className="h-14 px-12 text-lg font-bold rounded-xl shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/25 transition-all duration-300 hover:scale-[1.02]"
                >
                  Join the Founding Members
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </SignInButton>
            </div>

            {/* Micro trust line */}
            <p className="text-sm text-muted-foreground mb-12">
              500+ Dublin singles already waiting.{" "}
              <span className="font-semibold text-foreground">
                Real matches only.
              </span>
            </p>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Verified profiles
              </span>
              <span className="hidden sm:block w-px h-4 bg-border" />
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-500" />
                Dublin only
              </span>
              <span className="hidden sm:block w-px h-4 bg-border" />
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" />
                Completely free
              </span>
            </div>
          </div>
        </section>

        {/* ── 2. MANIFESTO ────────────────────────────────────────────────── */}
        {/* Light bg, editorial column, each line lands like a punch          */}
        <section className="py-24 md:py-36 bg-muted/30">
          <div className="max-w-xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-14">
              Dublin, we need to talk.
            </h2>

            <div className="space-y-5 text-lg md:text-xl text-muted-foreground leading-relaxed">
              <p>
                You matched with 200 people this year.
                <br />
                You went on three dates.
              </p>
              <p>
                Half were here for a stag weekend.
                <br />
                The other half vanished after day two.
              </p>
              <p>
                You&apos;ve been ghosted so often
                <br />
                you started doing it back.
              </p>
              <p>And somehow, this is called &ldquo;dating.&rdquo;</p>
            </div>

            <p className="mt-10 text-2xl md:text-3xl font-black text-foreground leading-tight">
              It&apos;s not a you problem.
              <br />
              It&apos;s a standards problem.
            </p>
          </div>
        </section>

        {/* ── 3. HOW IT WORKS ─────────────────────────────────────────────── */}
        {/* White bg, 3 cards side-by-side, icon + title + one-liner          */}
        <section className="py-24 md:py-36">
          <div className="max-w-5xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-3">
                How it works.
              </h2>
              <p className="text-muted-foreground text-lg">
                Three steps. No swiping.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-14">
              {[
                {
                  Icon: Sparkles,
                  title: "Confirm a date",
                  body: "One curated match per week, selected for you. No scrolling, no algorithm, no swiping.",
                },
                {
                  Icon: Coffee,
                  title: "Show up",
                  body: "Coffee arranged, time and place set. You just show up. That's the whole app.",
                },
                {
                  Icon: ShieldCheck,
                  title: "Standards enforced",
                  body: "Ghosting or no-shows mean removal. Permanently. We protect everyone's time equally.",
                },
              ].map(({ Icon, title, body }, i) => (
                <div
                  key={i}
                  className="group flex flex-col gap-5 p-8 rounded-2xl border border-border/60 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-400 bg-background"
                >
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1.5">{title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 4. ZERO TOLERANCE ───────────────────────────────────────────── */}
        {/* Dark bg, three left-bordered rules, shield icon at top            */}
        <section className="py-24 md:py-36 bg-foreground text-background relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.025] [background-image:url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+PHBhdGggZD0iTTAgMGg2MHY2MEgweiIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik0zMCAwdjYwTTAgMzBoNjAiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIuNSIvPjwvc3ZnPg==')]"
          />

          <div className="relative max-w-4xl mx-auto px-4">
            {/* Shield badge */}
            {/* <div className="flex justify-center mb-12">
              <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center">
                <ShieldCheck className="w-8 h-8 text-white/80" />
              </div>
            </div> */}

            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">
                Zero tolerance.
                <br />
                Maximum respect.
              </h2>
              <p className="text-white/50 text-lg max-w-lg mx-auto">
                This isn&apos;t a guideline. It&apos;s the contract.
              </p>
            </div>

            <div className="max-w-2xl mx-auto space-y-10 mb-14">
              {[
                {
                  title: "We don't reward flaky behavior.",
                  body: "If someone confirms a date and doesn't show up, they lose access. No appeals. No warnings. No second chances.",
                },
                {
                  title: "Your time is precious.",
                  body: "Our standards protect it. Every person who makes it through review has committed to showing up — or losing access forever.",
                },
                {
                  title: "If you meet, you're honest.",
                  body: "After every date, brief feedback from both sides. Not a review. Just honesty. It makes every future match better.",
                },
              ].map(({ title, body }, i) => (
                <div key={i} className="border-l-2 border-primary pl-8">
                  <h3 className="text-xl font-bold mb-2">{title}</h3>
                  <p className="text-white/55 leading-relaxed">{body}</p>
                </div>
              ))}
            </div>

            <div className="text-center space-y-4">
              <SignInButton mode="modal" forceRedirectUrl="/dashboard">
                <Button
                  size="lg"
                  variant="secondary"
                  className="h-14 px-10 text-base font-bold rounded-xl hover:scale-[1.02] transition-all duration-300"
                >
                  Join the Club
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </SignInButton>
              <p className="text-white/60 text-sm italic">
                We&apos;re not trying to be harsh. We&apos;re trying to be worth
                your time.
              </p>
            </div>
          </div>
        </section>

        {/* ── 5. SOCIAL PROOF ─────────────────────────────────────────────── */}
        {/* Light bg, feature quote + 2 small cards + stats bar               */}
        <section className="py-24 md:py-36 bg-muted/30">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-3">
                Real people. Real dates.
                <br />
                No games.
              </h2>
              <p className="text-muted-foreground text-lg">
                Early members. Real reactions.
              </p>
            </div>

            {/* Testimonial grid */}
            <div className="grid md:grid-cols-3 gap-6 mb-10">
              {/* Featured */}
              <div className="md:col-span-2 relative flex flex-col justify-between p-10 rounded-2xl bg-foreground text-background overflow-hidden">
                <div
                  aria-hidden
                  className="absolute top-0 right-0 w-56 h-56 bg-primary/15 rounded-full blur-[80px]"
                />
                <div className="relative">
                  <Quote className="w-9 h-9 text-white/10 mb-6" />
                  <p className="text-xl md:text-2xl font-light leading-relaxed mb-8">
                    &ldquo;Finally, a dating app where people actually show up.
                    Dublin&apos;s dating just got serious.&rdquo;
                  </p>
                  <div>
                    <p className="font-bold text-lg">Aoife, 26</p>
                    <p className="text-sm text-white/50 flex items-center gap-1.5 mt-0.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      Verified Member · Ranelagh
                    </p>
                  </div>
                </div>
              </div>

              {/* Stack of two */}
              <div className="flex flex-col gap-6">
                {[
                  {
                    quote:
                      "I can trust that my time isn't wasted. One curated match a week is perfect.",
                    name: "Sarah, 29",
                    location: "Portobello",
                  },
                  {
                    quote:
                      "No more ghosting, no more endless texting. Love this app.",
                    name: "Emma, 24",
                    location: "Smithfield",
                  },
                ].map(({ quote, name, location }, i) => (
                  <div
                    key={i}
                    className="flex-1 flex flex-col p-8 rounded-2xl bg-background border border-border/60"
                  >
                    <Quote className="w-6 h-6 text-primary/20 mb-4" />
                    <p className="text-foreground leading-relaxed mb-6 flex-1 text-sm md:text-base">
                      &ldquo;{quote}&rdquo;
                    </p>
                    <div>
                      <p className="font-semibold text-sm">{name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <ShieldCheck className="w-3 h-3 text-emerald-500" />
                        Verified · {location}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats bar */}
            <div className="rounded-2xl bg-foreground text-background p-10 md:p-14 relative overflow-hidden mb-12">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-[0.025] [background-image:url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+PHBhdGggZD0iTTAgMGg2MHY2MEgweiIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik0zMCAwdjYwTTAgMzBoNjAiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIuNSIvPjwvc3ZnPg==')]"
              />
              <div className="relative grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                {[
                  { n: 500, s: "+", label: "Dublin singles joined" },
                  { n: 100, s: "+", label: "Real dates arranged" },
                  { n: 0, s: "", label: "Ghosts tolerated" },
                  { n: 68, s: "%", label: "Second date rate" },
                ].map(({ n, s, label }, i) => (
                  <div key={i}>
                    <div className="text-3xl md:text-5xl font-black tracking-tight mb-1">
                      <Counter to={n} suffix={s} />
                    </div>
                    <div className="text-sm text-white/50 font-medium">
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── 6. SCARCITY / FOMO ──────────────────────────────────────────── */}
        {/* White bg, countdown timer, fill bar, urgency copy                 */}
        <section className="py-24 md:py-36">
          <div className="max-w-2xl mx-auto px-4 text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-10">
              <Users className="w-3.5 h-3.5" />
              Limited founding members
            </div>

            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-6 leading-[1.1]">
              Applications
              <br />
              are closing soon.
            </h2>

            <p className="text-muted-foreground text-lg leading-relaxed mb-12 max-w-md mx-auto">
              Next intake opens in 6 weeks.
              <br />
              Only serious Dublin singles allowed.
            </p>

            {/* Countdown */}
            <div className="mb-12">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-6">
                Current intake closes in
              </p>
              <Countdown />
            </div>

            {/* Spot meter */}
            <div className="max-w-sm mx-auto mb-12">
              <div className="flex justify-between text-sm font-medium mb-2.5">
                <span>
                  <span className="text-primary font-bold">50 spots</span>{" "}
                  remaining
                </span>
                <span className="text-muted-foreground">90% claimed</span>
              </div>
              <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-linear-to-r from-primary to-pink-500 transition-all duration-1000"
                  style={{ width: "90%" }}
                />
              </div>
              {/* <p className="text-xs text-muted-foreground mt-2 text-right">
                90% claimed
              </p> */}
            </div>

            <CTAButton label="Apply Now" />
          </div>
        </section>

        {/* ── 7. FAQ ──────────────────────────────────────────────────────── */}
        <section className="py-24 md:py-36 bg-muted/30">
          <div className="max-w-2xl mx-auto px-4">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-3">
                Questions people ask.
              </h2>
              <p className="text-muted-foreground">
                Fair. Here&apos;s the deal.
              </p>
            </div>

            <div className="space-y-1.5">
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
                  a: "Think of it like telling a friend what you're looking for. Five minutes, totally natural. We pick up on your values, energy and communication style — things a text bio can never capture.",
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
              ].map(({ q, a }, i) => (
                <details
                  key={i}
                  className="group rounded-xl border border-border/50 bg-background overflow-hidden"
                >
                  <summary className="flex items-center justify-between px-6 py-5 cursor-pointer list-none font-semibold text-[15px] hover:bg-muted/40 transition-colors">
                    {q}
                    <span className="shrink-0 ml-4 w-7 h-7 rounded-lg bg-muted flex items-center justify-center group-open:rotate-180 transition-transform duration-200">
                      <svg
                        width="13"
                        height="13"
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
                    </span>
                  </summary>
                  <p className="px-6 pb-5 text-muted-foreground text-sm leading-relaxed">
                    {a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── 8. FINAL CTA ────────────────────────────────────────────────── */}
        {/* Dark bg, massive uppercase headline, single button                */}
        <section className="relative min-h-[75vh] flex items-center justify-center px-4 py-24 bg-foreground text-background overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.025] [background-image:url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+PHBhdGggZD0iTTAgMGg2MHY2MEgweiIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik0zMCAwdjYwTTAgMzBoNjAiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIuNSIvPjwvc3ZnPg==')]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[180px]"
          />

          <div className="relative max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">
              Stop swiping.
              <br />
              Start showing up.
            </h2>
            <p className="text-white/50 text-lg md:text-xl leading-relaxed mb-10 max-w-xl mx-auto">
              Dublin&apos;s strict dating app. Real matches, real dates, real
              standards.
            </p>
            <SignInButton mode="modal" forceRedirectUrl="/dashboard">
              <Button
                size="lg"
                variant="secondary"
                className="h-14 px-14 text-lg font-bold rounded-xl shadow-xl hover:scale-[1.02] transition-all duration-300"
              >
                Join MeetOnce
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </SignInButton>
            <p className="text-white/60 text-sm mt-8">
              Free during Dublin launch · Verified profiles only · Founding
              spots are limited.
            </p>
          </div>
        </section>
      </main>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer className="py-12 px-4 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <span className="text-xl font-black tracking-tight">MeetOnce</span>

            <div className="flex items-center gap-8 text-sm text-muted-foreground">
              {["Terms", "Privacy", "Contact"].map((l) => (
                <a
                  key={l}
                  href="#"
                  className="hover:text-foreground transition-colors"
                >
                  {l}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-2.5">
              {[Instagram, Twitter, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="p-2.5 rounded-lg bg-muted hover:bg-muted/70 transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-border/50 text-center text-xs text-muted-foreground">
            Built in Dublin, for Dublin.
          </div>
        </div>
      </footer>
    </div>
  );
}
