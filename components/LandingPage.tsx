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
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

// ─── Animated number counter ──────────────────────────────────────────────────
function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [value, setValue] = useState(0);
  const el = useRef<HTMLSpanElement>(null);
  const fired = useRef(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting || fired.current) return;
        fired.current = true;
        const STEPS = 60;
        const INTERVAL = 2000 / STEPS;
        let i = 0;
        const id = setInterval(() => {
          i++;
          setValue(i >= STEPS ? to : Math.round((to / STEPS) * i));
          if (i >= STEPS) clearInterval(id);
        }, INTERVAL);
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

// ─── Live countdown clock ─────────────────────────────────────────────────────
function Countdown() {
  const deadline = useRef<number>(0);
  const [t, setT] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    if (!deadline.current) {
      const d = new Date();
      d.setDate(d.getDate() + 42);
      d.setHours(23, 59, 59, 0);
      deadline.current = d.getTime();
    }
    const tick = () => {
      const rem = Math.max(0, (deadline.current - Date.now()) / 1000);
      setT({
        d: Math.floor(rem / 86400),
        h: Math.floor((rem % 86400) / 3600),
        m: Math.floor((rem % 3600) / 60),
        s: Math.floor(rem % 60),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex items-end justify-center gap-2 md:gap-3">
      {(
        [
          { v: t.d, label: "days" },
          { v: t.h, label: "hours" },
          { v: t.m, label: "min" },
          { v: t.s, label: "sec" },
        ] as const
      ).map(({ v, label }, i) => (
        <div key={i} className="flex flex-col items-center gap-1.5">
          <div className="w-[66px] md:w-20 h-[66px] md:h-20 rounded-2xl bg-foreground text-background flex items-center justify-center text-2xl md:text-3xl font-black tabular-nums tracking-tight">
            {String(v).padStart(2, "0")}
          </div>
          <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Reusable CTA wrapper ─────────────────────────────────────────────────────
function JoinButton({
  label,
  variant = "default",
  size = "lg",
  className = "",
}: {
  label: string;
  variant?: "default" | "outline" | "secondary";
  size?: "sm" | "default" | "lg";
  className?: string;
}) {
  return (
    <SignInButton mode="modal" forceRedirectUrl="/dashboard">
      <Button
        size={size}
        variant={variant}
        className={`font-bold rounded-xl transition-all duration-300 hover:scale-[1.02] ${className}`}
      >
        {label}
        <ArrowRight className="ml-2 w-4 h-4" />
      </Button>
    </SignInButton>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export function LandingPage() {
  const [bannerVisible, setBannerVisible] = useState(true);
  const [stickyNav, setStickyNav] = useState(false);
  const [mobileCTA, setMobileCTA] = useState(false);
  const heroRef = useRef<HTMLElement>(null);

  // Show sticky elements after scrolling past the hero
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        const past = !e.isIntersecting;
        setStickyNav(past);
        setMobileCTA(past);
      },
      { threshold: 0 },
    );
    obs.observe(hero);
    return () => obs.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden">

      {/* ── URGENCY BANNER ─────────────────────────────────────────────── */}
      {bannerVisible && (
        <div className="relative bg-foreground text-background text-xs md:text-sm font-semibold text-center py-2.5 px-10">
          <span className="text-primary">⚡</span>{" "}
          Applications for women closing soon · Only{" "}
          <span className="underline underline-offset-2">50 spots left</span> ·{" "}
          <SignInButton mode="modal" forceRedirectUrl="/dashboard">
            <button className="underline underline-offset-2 hover:no-underline cursor-pointer">
              Apply free →
            </button>
          </SignInButton>
          <button
            onClick={() => setBannerVisible(false)}
            aria-label="Dismiss"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 opacity-60 hover:opacity-100 transition-opacity"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ── STICKY NAV (appears after hero scrolls out) ──────────────── */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border transition-all duration-300 ${
          stickyNav
            ? "translate-y-0 opacity-100 pointer-events-auto"
            : "-translate-y-full opacity-0 pointer-events-none"
        }`}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
          <span className="text-lg font-black tracking-tight">MeetOnce</span>
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-xs text-muted-foreground">
              50 spots left
            </span>
            <JoinButton label="Join Free" size="sm" className="h-9 px-5 text-sm" />
          </div>
        </div>
      </div>

      <main>
        {/* ── 1. HERO ─────────────────────────────────────────────────── */}
        <section
          ref={heroRef}
          className="relative min-h-screen flex flex-col items-center justify-center px-4 py-24 overflow-hidden"
        >
          {/* Warm glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-[900px] h-[450px] rounded-full bg-primary/8 blur-[160px]"
          />

          <div className="relative max-w-5xl mx-auto text-center">
            {/* Location pill */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-border bg-muted text-muted-foreground text-xs font-bold uppercase tracking-wider mb-10">
              <MapPin className="w-3 h-3" />
              Dublin, Ireland
            </div>

            {/* Headline */}
            <h1 className="text-[clamp(2.8rem,11vw,7.5rem)] font-black leading-[0.93] tracking-tighter uppercase mb-7">
              We Banned
              <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-primary via-pink-400 to-primary">
                Ghosting.
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-lg mx-auto leading-relaxed mb-9">
              MeetOnce is Dublin&apos;s strict dating app. One curated match per
              week. Real coffee dates. Zero tolerance for flakes.
            </p>

            {/* Primary CTA */}
            <div className="flex justify-center mb-5">
              <JoinButton
                label="Join the Founding Members"
                className="h-14 px-12 text-lg shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/25"
              />
            </div>

            {/* Micro trust line */}
            <p className="text-sm text-muted-foreground mb-11">
              500+ Dublin singles already waiting.{" "}
              <span className="font-bold text-foreground">
                Real matches only.
              </span>
            </p>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Verified profiles only
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

          {/* Scroll nudge */}
          <div
            aria-hidden
            className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 opacity-30"
          >
            <div className="w-px h-8 bg-foreground animate-bounce" />
            <span className="text-[10px] font-bold uppercase tracking-widest">
              Scroll
            </span>
          </div>
        </section>

        {/* ── 2. MANIFESTO ────────────────────────────────────────────── */}
        <section className="py-24 md:py-36 bg-muted/30">
          <div className="max-w-xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-14">
              Dublin, we need to talk.
            </h2>

            <div className="space-y-6 text-lg md:text-xl text-muted-foreground leading-relaxed">
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

            <p className="mt-10 text-2xl md:text-3xl font-black text-foreground leading-snug">
              It&apos;s not a you problem.
              <br />
              It&apos;s a standards problem.
            </p>

            <div className="mt-12">
              <JoinButton
                label="See How We Do It"
                variant="outline"
                className="h-13 px-9 text-base border-foreground/20 hover:bg-foreground hover:text-background"
              />
            </div>
          </div>
        </section>

        {/* ── 3. HOW IT WORKS ─────────────────────────────────────────── */}
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
              {(
                [
                  {
                    Icon: Sparkles,
                    n: "01",
                    title: "Confirm a date",
                    body: "One curated match per week, selected for you. No scrolling, no algorithm, no swiping.",
                  },
                  {
                    Icon: Coffee,
                    n: "02",
                    title: "Show up",
                    body: "Coffee arranged, time and place set. You just show up. That's it. That's the whole app.",
                  },
                  {
                    Icon: ShieldCheck,
                    n: "03",
                    title: "Standards enforced",
                    body: "Ghosting or no-shows mean removal. Permanently. No warnings. We protect everyone's time.",
                  },
                ] as const
              ).map(({ Icon, n, title, body }, i) => (
                <div
                  key={i}
                  className="group flex flex-col gap-5 p-8 rounded-2xl border border-border/60 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 bg-background"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-4xl font-black text-muted/40 tabular-nums">
                      {n}
                    </span>
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

            <div className="text-center">
              <JoinButton
                label="Get Your Match"
                className="h-14 px-10 text-base shadow-lg shadow-primary/20"
              />
            </div>
          </div>
        </section>

        {/* ── 4. ZERO TOLERANCE ───────────────────────────────────────── */}
        <section className="py-24 md:py-36 bg-foreground text-background relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.022] [background-image:repeating-linear-gradient(0deg,transparent,transparent_39px,rgba(255,255,255,0.3)_39px,rgba(255,255,255,0.3)_40px),repeating-linear-gradient(90deg,transparent,transparent_39px,rgba(255,255,255,0.3)_39px,rgba(255,255,255,0.3)_40px)]"
          />

          <div className="relative max-w-4xl mx-auto px-4">
            {/* Shield */}
            <div className="flex justify-center mb-12">
              <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center">
                <ShieldCheck className="w-7 h-7 text-white/75" />
              </div>
            </div>

            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">
                Zero tolerance.
                <br />
                Maximum respect.
              </h2>
              <p className="text-white/50 text-lg max-w-md mx-auto">
                This isn&apos;t a guideline. It&apos;s the contract.
              </p>
            </div>

            <div className="max-w-2xl mx-auto space-y-10 mb-14">
              {(
                [
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
                ] as const
              ).map(({ title, body }, i) => (
                <div key={i} className="border-l-2 border-primary pl-8">
                  <h3 className="text-xl font-bold mb-2">{title}</h3>
                  <p className="text-white/55 leading-relaxed">{body}</p>
                </div>
              ))}
            </div>

            <div className="text-center space-y-3">
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
              <p className="text-white/35 text-sm italic">
                We&apos;re not trying to be harsh. We&apos;re trying to be
                worth your time.
              </p>
            </div>
          </div>
        </section>

        {/* ── 5. SOCIAL PROOF ─────────────────────────────────────────── */}
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

            {/* Featured + two stacked */}
            <div className="grid md:grid-cols-3 gap-6 mb-10">
              <div className="md:col-span-2 relative flex flex-col justify-between p-10 rounded-2xl bg-foreground text-background overflow-hidden">
                <div
                  aria-hidden
                  className="absolute top-0 right-0 w-60 h-60 bg-primary/12 rounded-full blur-[90px]"
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

              <div className="flex flex-col gap-6">
                {(
                  [
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
                  ] as const
                ).map(({ quote, name, location }, i) => (
                  <div
                    key={i}
                    className="flex-1 flex flex-col p-7 rounded-2xl bg-background border border-border/60"
                  >
                    <Quote className="w-6 h-6 text-primary/20 mb-4" />
                    <p className="text-foreground leading-relaxed mb-5 flex-1 text-sm">
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
                className="pointer-events-none absolute inset-0 opacity-[0.022] [background-image:repeating-linear-gradient(0deg,transparent,transparent_39px,rgba(255,255,255,0.3)_39px,rgba(255,255,255,0.3)_40px),repeating-linear-gradient(90deg,transparent,transparent_39px,rgba(255,255,255,0.3)_39px,rgba(255,255,255,0.3)_40px)]"
              />
              <div className="relative grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                {(
                  [
                    { n: 500, s: "+", label: "Dublin singles joined" },
                    { n: 100, s: "+", label: "Real dates arranged" },
                    { n: 0, s: "", label: "Ghosts tolerated" },
                    { n: 68, s: "%", label: "Second date rate" },
                  ] as const
                ).map(({ n, s, label }, i) => (
                  <div key={i}>
                    <div className="text-3xl md:text-5xl font-black tracking-tight mb-1.5">
                      <Counter to={n} suffix={s} />
                    </div>
                    <div className="text-xs md:text-sm text-white/50 font-medium leading-snug">
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center">
              <JoinButton
                label="Request Access"
                className="h-14 px-10 text-base shadow-lg shadow-primary/20"
              />
            </div>
          </div>
        </section>

        {/* ── 6. SCARCITY / FOMO ──────────────────────────────────────── */}
        <section className="py-24 md:py-36">
          <div className="max-w-xl mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-10">
              <Users className="w-3.5 h-3.5" />
              Limited founding members
            </div>

            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-6 leading-[1.1]">
              Applications for women
              <br />
              are closing soon.
            </h2>

            <p className="text-muted-foreground text-lg leading-relaxed mb-12">
              Next intake in 6 weeks.
              <br />
              Only serious Dublin singles allowed.
            </p>

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
                  className="h-full rounded-full bg-linear-to-r from-primary to-pink-500"
                  style={{ width: "90%" }}
                />
              </div>
            </div>

            <JoinButton
              label="Apply Now"
              className="h-14 px-12 text-base shadow-lg shadow-primary/20"
            />
          </div>
        </section>

        {/* ── 7. FAQ ──────────────────────────────────────────────────── */}
        <section className="py-24 md:py-36 bg-muted/30">
          <div className="max-w-2xl mx-auto px-4">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-3">
                Questions people actually ask.
              </h2>
              <p className="text-muted-foreground">
                Fair. Here&apos;s the deal.
              </p>
            </div>

            <div className="space-y-1.5 mb-14">
              {(
                [
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
                ] as const
              ).map(({ q, a }, i) => (
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

            {/* FAQ-bottom CTA — catches skeptics who read everything */}
            <div className="text-center">
              <p className="text-muted-foreground mb-6">
                Still not sure?{" "}
                <span className="font-semibold text-foreground">
                  The first date is free. What do you have to lose?
                </span>
              </p>
              <JoinButton
                label="Give It a Shot"
                variant="outline"
                className="h-12 px-8 text-sm border-foreground/20 hover:bg-foreground hover:text-background"
              />
            </div>
          </div>
        </section>

        {/* ── 8. FINAL CTA ────────────────────────────────────────────── */}
        <section className="relative min-h-[80vh] flex items-center justify-center px-4 py-24 bg-foreground text-background overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.022] [background-image:repeating-linear-gradient(0deg,transparent,transparent_39px,rgba(255,255,255,0.3)_39px,rgba(255,255,255,0.3)_40px),repeating-linear-gradient(90deg,transparent,transparent_39px,rgba(255,255,255,0.3)_39px,rgba(255,255,255,0.3)_40px)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary/8 rounded-full blur-[200px]"
          />

          <div className="relative max-w-3xl mx-auto text-center">
            <h2 className="text-[clamp(2.5rem,8vw,5.5rem)] font-black tracking-tighter uppercase leading-[1.0] mb-6">
              Stop swiping.
              <br />
              Start showing up.
            </h2>
            <p className="text-white/50 text-lg md:text-xl leading-relaxed mb-10 max-w-lg mx-auto">
              Dublin&apos;s strict dating app. Real matches, real dates, real
              standards.
            </p>
            <SignInButton mode="modal" forceRedirectUrl="/dashboard">
              <Button
                size="lg"
                variant="secondary"
                className="h-14 px-14 text-lg font-bold rounded-xl shadow-2xl hover:scale-[1.02] transition-all duration-300"
              >
                Join MeetOnce
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </SignInButton>
            <p className="text-white/30 text-sm mt-8">
              Free during Dublin launch · Verified profiles only · Founding
              spots are limited.
            </p>
          </div>
        </section>
      </main>

      {/* ── FOOTER ──────────────────────────────────────────────────── */}
      <footer className="py-12 px-4 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <span className="text-xl font-black tracking-tight">MeetOnce</span>
            <div className="flex items-center gap-8 text-sm text-muted-foreground">
              {(["Terms", "Privacy", "Contact"] as const).map((l) => (
                <a key={l} href="#" className="hover:text-foreground transition-colors">
                  {l}
                </a>
              ))}
            </div>
            <div className="flex items-center gap-2.5">
              {([Instagram, Twitter, Linkedin] as const).map((Icon, i) => (
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

      {/* ── STICKY MOBILE CTA BAR (highest-impact mobile conversion) ── */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/95 backdrop-blur-md border-t border-border px-4 py-3 transition-all duration-300 ${
          mobileCTA
            ? "translate-y-0 opacity-100 pointer-events-auto"
            : "translate-y-full opacity-0 pointer-events-none"
        }`}
      >
        <SignInButton mode="modal" forceRedirectUrl="/dashboard">
          <Button
            size="lg"
            className="w-full h-12 font-bold rounded-xl text-sm"
          >
            Join the Founding Members
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </SignInButton>
        <p className="text-center text-[11px] text-muted-foreground mt-1.5">
          50 spots left · Free to join · Dublin only
        </p>
      </div>
    </div>
  );
}
