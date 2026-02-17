"use client";

import { Button } from "@/components/ui/button";
import { SignInButton } from "@clerk/nextjs";
import {
  ArrowRight,
  Ban,
  Check,
  Coffee,
  Instagram,
  Lightbulb,
  Linkedin,
  LogOut,
  MapPin,
  MessageSquare,
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
        {/* Hero Section — Dark, editorial, dominant headline */}
        <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-4 py-20 bg-foreground text-background overflow-hidden">
          {/* Subtle grain overlay */}
          <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMC4xNSIvPjwvc3ZnPg==')]" />
          {/* Accent glow */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/20 rounded-full blur-[120px]" />

          <div className="relative max-w-5xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 text-white/80 text-sm font-medium mb-10 backdrop-blur-sm">
              <MapPin className="w-4 h-4" />
              <span>Now Live in Dublin</span>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-black tracking-tight mb-8 leading-[1.05]">
              One match.
              <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-primary via-pink-500 to-primary">
                One coffee.
              </span>
              <br />
              Once a week.
            </h1>

            <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-12 leading-relaxed font-light">
              Dublin doesn&apos;t need another dating app. It needs a dating
              culture that actually works. MeetOnce learns who you are through a
              short voice conversation, then arranges one real coffee date per
              week with someone worth meeting.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-14">
              <SignInButton mode="modal" forceRedirectUrl="/dashboard">
                <Button
                  size="lg"
                  className="h-14 px-10 text-lg rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 font-semibold"
                >
                  Claim Your Spot
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </SignInButton>
            </div>

            {/* Stats bar — moved up for immediate social proof */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-white/50">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                </span>
                <span>
                  <AnimatedCounter target={475} suffix="+" /> Dublin singles
                  joined
                </span>
              </div>
              <div className="hidden sm:block w-px h-4 bg-white/20" />
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500/80" />
                <span>Free during Dublin launch</span>
              </div>
              <div className="hidden sm:block w-px h-4 bg-white/20" />
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-green-500/80" />
                <span>Every profile verified</span>
              </div>
            </div>
          </div>
        </section>

        {/* Problem Section — Single column, chat-bubble style */}
        <section className="py-20 md:py-32">
          <div className="max-w-2xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black mb-6 leading-tight tracking-tight">
                Dating in Dublin is broken.
                {/* <br />
                <span className="text-muted-foreground">
                  absolutely broken.
                </span> */}
              </h2>
              <p className="text-lg text-muted-foreground">
                You already know this. You&apos;ve lived it.
              </p>
            </div>

            {/* Chat-bubble style pain points */}
            <div className="space-y-3">
              {[
                "You swipe for 45 minutes. Match with someone. They never reply.",
                "You have three good chats going. None of them suggest meeting up. Ever.",
                "You finally get a date. They're visiting Dublin for the weekend. Gone by Monday.",
                "You see the same 30 faces recycled across Tinder, Hinge and Bumble.",
                "Your friend circle is tapped out. Everyone's dated everyone's ex.",
                "You start to wonder if the problem is you. It's not. It's the system.",
              ].map((text, i) => (
                <div
                  key={i}
                  className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-[85%] px-5 py-3.5 text-[15px] leading-relaxed ${
                      i % 2 === 0
                        ? "bg-muted rounded-2xl rounded-bl-sm text-muted-foreground"
                        : "bg-primary/10 rounded-2xl rounded-br-sm text-foreground/70"
                    }`}
                  >
                    {text}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Closing statement — full-width dark band */}
        <section className="py-16 md:py-20 bg-foreground text-background">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <p className="text-2xl md:text-4xl font-black tracking-tight leading-tight">
              Swipe culture turned dating into a game.
              <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-pink-500">
                We&apos;re turning it back into a date.
              </span>
            </p>
          </div>
        </section>

        {/* The MeetOnce Difference — Featured hero card + 3 supporting */}
        <section className="py-20 md:py-32 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                The MeetOnce Difference
              </div>
              <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tight">
                Less noise. More dates.
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-light">
                We stripped dating back to what actually matters, meeting
                someone face to face.
              </p>
            </div>

            {/* Hero card — One Match Per Week */}
            <div className="mb-6">
              <div className="relative p-10 md:p-14 rounded-2xl bg-foreground text-background overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-primary/15 rounded-full blur-[100px]" />
                <div className="relative grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <div className="w-16 h-16 rounded-xl bg-white/10 flex items-center justify-center mb-6">
                      <Sparkles className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-3xl md:text-4xl font-black mb-4 tracking-tight">
                      One Match Per Week
                    </h3>
                    <p className="text-white/60 text-lg leading-relaxed font-light">
                      No paradox of choice. No doom-scrolling. One person,
                      chosen because they actually make sense for you. This is
                      the core of everything we do.
                    </p>
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="text-[8rem] md:text-[10rem] font-black text-white/10 leading-none select-none">
                      1
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Supporting cards */}
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: Mic,
                  title: "Voice, Not Profiles",
                  text: "A short voice conversation reveals more about you than any bio ever could. We match on values, not selfies.",
                },
                {
                  icon: Coffee,
                  title: "Real Dates, Not Chats",
                  text: "We don't let you hide behind a screen for weeks. You match, you meet, you decide in person.",
                },
                {
                  icon: ShieldCheck,
                  title: "Verified and Vetted",
                  text: "Every single person on MeetOnce is verified. No catfish. No tourists. No time-wasters.",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="group flex flex-col p-8 rounded-2xl bg-background border border-border/50 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500"
                >
                  <div className="w-12 h-12 rounded-xl bg-linear-to-br from-primary/20 to-pink-500/20 flex items-center justify-center mb-5 text-primary group-hover:scale-110 transition-transform">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Voice AI Section — Phone frame mockup */}
        <section className="py-20 md:py-32 bg-muted/20 relative">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                  <Mic className="w-4 h-4" />
                  5-Minute Voice Interview
                </div>
                <h2 className="text-3xl md:text-5xl font-black mb-6 leading-tight tracking-tight">
                  Talk to us like you&apos;d talk to
                  <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-pink-500">
                    {" "}
                    a good friend.
                  </span>
                </h2>
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed font-light">
                  No forms. No quizzes. Just a natural five-minute conversation
                  where you tell us what actually matters to you. We pick up on
                  things a profile never could.
                </p>
                <div className="space-y-5">
                  {[
                    {
                      label: "What drives you",
                      desc: "Your values, ambitions, and what gets you out of bed",
                    },
                    {
                      label: "How you connect",
                      desc: "Your communication style and what makes you click",
                    },
                    {
                      label: "What you actually want",
                      desc: "Not a checklist, the real answer you'd give a mate",
                    },
                    {
                      label: "Who you really are",
                      desc: "Personality you can hear, not a curated highlight reel",
                    },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="mt-1 w-5 h-5 rounded-md bg-linear-to-r from-primary to-pink-500 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm">
                          {item.label}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {item.desc}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Phone frame */}
              <div className="relative flex justify-center">
                <div className="relative w-[300px] md:w-[340px]">
                  {/* Phone bezel */}
                  <div className="rounded-[2.5rem] bg-foreground p-3 shadow-2xl shadow-black/30">
                    {/* Notch */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-7 bg-foreground rounded-b-2xl z-10" />
                    {/* Screen */}
                    <div className="rounded-[2rem] bg-card overflow-hidden">
                      {/* Status bar */}
                      <div className="px-6 pt-8 pb-3 flex items-center justify-between text-[10px] text-muted-foreground">
                        <span>9:41</span>
                        <div className="flex items-center gap-1">
                          <div className="w-4 h-2 border border-muted-foreground/50 rounded-sm">
                            <div className="w-2.5 h-full bg-green-500 rounded-sm" />
                          </div>
                        </div>
                      </div>
                      {/* Chat header */}
                      <div className="px-5 pb-4 flex items-center gap-3 border-b border-border/50">
                        <div className="w-10 h-10 rounded-full bg-linear-to-r from-primary to-pink-500 flex items-center justify-center">
                          <Mic className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">MeetOnce</p>
                          <p className="text-[11px] text-muted-foreground">
                            Listening...
                          </p>
                        </div>
                      </div>
                      {/* Messages */}
                      <div className="p-4 space-y-3 min-h-[280px]">
                        <div className="flex justify-end">
                          <div className="bg-primary/10 rounded-2xl rounded-br-sm px-3.5 py-2.5 max-w-[85%]">
                            <p className="text-[13px] leading-relaxed">
                              Honestly, I&apos;m done with surface-level stuff.
                              I want someone who&apos;s sound, has their own
                              thing going on, but actually wants to build
                              something real...
                            </p>
                          </div>
                        </div>
                        <div className="flex justify-start">
                          <div className="bg-muted rounded-2xl rounded-bl-sm px-3.5 py-2.5 max-w-[85%]">
                            <p className="text-[13px] leading-relaxed">
                              That&apos;s really clear. So you value
                              authenticity and ambition but with emotional
                              depth. What does a great Saturday look like for
                              you?
                            </p>
                          </div>
                        </div>
                        {/* Waveform */}
                        <div className="flex items-center justify-center gap-[3px] pt-2">
                          {[10, 18, 14, 22, 12, 20, 16, 24, 12, 18].map(
                            (height, i) => (
                              <div
                                key={i}
                                className="w-[3px] bg-primary/60 rounded-full animate-pulse"
                                style={{
                                  height: `${height}px`,
                                  animationDelay: `${i * 0.08}s`,
                                }}
                              />
                            ),
                          )}
                        </div>
                      </div>
                      {/* Bottom safe area */}
                      <div className="h-6" />
                    </div>
                  </div>
                  {/* Home indicator */}
                  <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-28 h-1 bg-white/20 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 md:py-32">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tight">
                How it works.
              </h2>
              <p className="text-lg text-muted-foreground font-light">
                Sign up on Sunday. Sit down for coffee by Friday.
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-6">
              {[
                {
                  icon: Mic,
                  step: "01",
                  title: "Tell Us About You",
                  desc: "Five-minute voice chat. No forms, no swiping. Just talk like a human being.",
                },
                {
                  icon: ShieldCheck,
                  step: "02",
                  title: "Get Verified",
                  desc: "Quick verification so everyone on the platform is real, serious, and Dublin-based.",
                },
                {
                  icon: Sparkles,
                  title: "Receive Your Match",
                  step: "03",
                  desc: "Every week, one person. Picked for compatibility across values, lifestyle and personality.",
                },
                {
                  icon: Coffee,
                  step: "04",
                  title: "Meet for Coffee",
                  desc: "Both interested? We pick the spot. You just show up and see if there's something there.",
                },
              ].map((step, i) => (
                <div
                  key={i}
                  className="group relative flex flex-col p-7 rounded-2xl bg-background border border-border/50 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500"
                >
                  <span className="text-5xl font-black text-primary/10 group-hover:text-primary/20 transition-colors mb-4">
                    {step.step}
                  </span>
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

        {/* Social Proof — Editorial layout */}
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

            {/* Editorial testimonial layout */}
            <div className="grid md:grid-cols-5 gap-6 mb-14">
              {/* Featured testimonial — spans 3 cols */}
              <div className="md:col-span-3 flex flex-col justify-between p-10 rounded-2xl bg-foreground text-background relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-[80px]" />
                <div className="relative">
                  <Quote className="w-10 h-10 text-white/15 mb-6" />
                  <p className="text-xl md:text-2xl leading-relaxed mb-8 font-light">
                    &ldquo;First date in months that didn&apos;t feel like a job
                    interview. We actually talked. Like, properly talked. I
                    forgot I was on a &apos;date&apos; and just had a
                    conversation with someone interesting.&rdquo;
                  </p>
                  <div>
                    <p className="font-semibold text-lg">Sarah, 29</p>
                    <p className="text-sm text-white/50">Portobello</p>
                  </div>
                </div>
              </div>

              {/* Two smaller testimonials — span 2 cols */}
              <div className="md:col-span-2 flex flex-col gap-6">
                <div className="flex-1 flex flex-col p-8 rounded-2xl bg-background border border-border/50">
                  <Quote className="w-7 h-7 text-primary/20 mb-4" />
                  <p className="text-foreground leading-relaxed mb-6 flex-1">
                    &ldquo;I deleted three apps the day I signed up. One good
                    match a week is all you need when it&apos;s the right
                    one.&rdquo;
                  </p>
                  <div>
                    <p className="font-semibold">Cian, 32</p>
                    <p className="text-sm text-muted-foreground">Smithfield</p>
                  </div>
                </div>
                <div className="flex-1 flex flex-col p-8 rounded-2xl bg-background border border-border/50">
                  <Quote className="w-7 h-7 text-primary/20 mb-4" />
                  <p className="text-foreground leading-relaxed mb-6 flex-1">
                    &ldquo;The voice thing felt weird for ten seconds, then it
                    felt like the most honest I&apos;ve been on a dating
                    platform. Ever.&rdquo;
                  </p>
                  <div>
                    <p className="font-semibold">Aoife, 27</p>
                    <p className="text-sm text-muted-foreground">Ranelagh</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="rounded-2xl bg-foreground text-background p-10 md:p-14 relative overflow-hidden">
              <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMC4xNSIvPjwvc3ZnPg==')]" />
              <div className="relative grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                {[
                  { label: "Dublin Singles Joined", value: 475, suffix: "+" },
                  { label: "Coffee Dates Arranged", value: 100, suffix: "+" },
                  { label: "Second Date Rate", value: 68, suffix: "%" },
                  {
                    label: "Swipe Apps Deleted",
                    value: null,
                    display: "Countless",
                  },
                ].map((stat, i) => (
                  <div key={i}>
                    <div className="text-3xl md:text-5xl font-black mb-2 tracking-tight text-white">
                      {stat.value !== null ? (
                        <AnimatedCounter
                          target={stat.value}
                          suffix={stat.suffix}
                        />
                      ) : (
                        stat.display
                      )}
                    </div>
                    <div className="text-sm md:text-base text-white/50 font-medium">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Safety Section */}
        <section className="py-20 md:py-32">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-600 text-sm font-medium mb-6">
                <ShieldCheck className="w-4 h-4" />
                Safety First
              </div>
              <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tight">
                Meet strangers. Feel safe.
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-light">
                We take the sketchy out of meeting someone new.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  icon: ShieldCheck,
                  title: "ID Verified",
                  text: "Every member verified before they can match. No exceptions.",
                },
                {
                  icon: Coffee,
                  title: "Vetted Spots",
                  text: "All dates at safe, public coffee shops across Dublin that we trust.",
                },
                {
                  icon: Lightbulb,
                  title: "Date Safety Tips",
                  text: "Practical safety advice before every date. Not patronising, just smart.",
                },
                {
                  icon: LogOut,
                  title: "Leave Anytime",
                  text: "Not feeling it? Walk away. No pressure, no awkwardness, no questions.",
                },
                {
                  icon: Ban,
                  title: "Ghosters Get Banned",
                  text: "No-show without notice? Gone. We protect everyone's time.",
                },
                {
                  icon: MessageSquare,
                  title: "Real Support Team",
                  text: "Something off? Our team responds fast. We're a small crew who actually cares.",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 p-6 rounded-xl bg-background border border-border/50 hover:border-green-500/30 hover:shadow-lg transition-all duration-300"
                >
                  <div className="shrink-0 w-11 h-11 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 text-sm">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Scarcity / Founding Members — Progress bar */}
        {/* <section className="py-20 md:py-32 bg-muted/20">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-10">
              <MapPin className="w-4 h-4" />
              Dublin-Only Launch
            </div>
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
                We&apos;re launching exclusively in Dublin because great things
                start small. The first 1,000 members become Founding Members,
                which means free access for life and first priority on every
                feature we build.
              </p>
            </div>
          </div>
        </section> */}

        {/* FAQ Section */}
        <section className="py-20 md:py-32">
          <div className="max-w-3xl mx-auto px-4">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tight">
                Questions people actually ask.
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-light">
                We get it. You're skeptical. Here's the deal.
              </p>
            </div>
            <div className="space-y-2">
              {[
                {
                  q: "How is this different from Hinge or Bumble?",
                  a: "Those apps give you hundreds of options and hope you figure it out. We give you one. Every week, we send you a single match based on deep compatibility, not a photo and a prayer. And we skip straight to the date. No weeks of texting. No ghosting loop.",
                },
                {
                  q: "Why only one match per week?",
                  a: "Because choice overload kills good decisions. One match forces intention. You pay attention. You show up. And if it doesn't work out, there's another one next week. Quality compounds.",
                },
                {
                  q: "What's the voice conversation about?",
                  a: "Think of it like telling a friend what you're looking for. Five minutes, totally natural. No weird questions. We pick up on your values, energy and communication style, things a text bio can never capture.",
                },
                {
                  q: "Where do the dates happen?",
                  a: "Public coffee spots across Dublin that we've vetted. Safe, casual, zero pressure. You show up, have a coffee, and see if there's something there.",
                },
                {
                  q: "What if I don't like my match?",
                  a: "No worries. Pass and you'll get a new match next week. But we'd encourage keeping an open mind. Chemistry in person is different from chemistry on a screen.",
                },
                {
                  q: "Is it actually free?",
                  a: "Completely free during the Dublin launch. We're proving something here, and the first 1,000 members get founding access for life.",
                },
                {
                  q: "What happens if someone ghosts?",
                  a: "They get removed. Permanently. We have a zero-tolerance policy for wasting people's time. That's the whole point of MeetOnce.",
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

        {/* Final CTA — Full viewport */}
        <section className="min-h-[70vh] flex items-center justify-center px-4 bg-foreground text-background relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMC4xNSIvPjwvc3ZnPg==')]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px]" />
          <div className="relative max-w-3xl mx-auto text-center py-20">
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 tracking-tight leading-[1.1]">
              Dublin deserves better
              <br />
              than swiping.
            </h2>
            <p className="text-lg md:text-xl text-white/50 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
              Stop treating dating like a numbers game. Join the people in
              Dublin who decided one good date is worth more than a hundred
              matches that go nowhere.
            </p>
            <SignInButton mode="modal" forceRedirectUrl="/dashboard">
              <Button
                size="lg"
                variant="secondary"
                className="h-14 px-12 text-lg rounded-xl shadow-lg font-semibold"
              >
                Join the Movement
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </SignInButton>
            <p className="text-sm text-white/30 mt-8">
              Free during Dublin launch. No card needed. Founding member spots
              are limited.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
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
            <p>Made with ❤️ in Dublin.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
