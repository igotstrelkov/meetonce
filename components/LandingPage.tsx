import { Button } from "@/components/ui/button";
import { SignInButton } from "@clerk/nextjs";
import {
  ArrowRight,
  Ban,
  Check,
  Coffee,
  Heart,
  Instagram,
  Lightbulb,
  Linkedin,
  LogOut,
  MessageSquare,
  Mic,
  ShieldCheck,
  Sparkles,
  Twitter,
  X,
} from "lucide-react";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20 overflow-x-hidden">
      <main>
        {/* Hero Section */}
        <section className="relative px-4 pt-8 pb-16 md:pt-16 md:pb-24 max-w-7xl mx-auto flex flex-col items-center text-center">
          {/* Background effects */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-[128px] opacity-50" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-[128px] opacity-50" />
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8 backdrop-blur-sm">
            <Sparkles className="w-4 h-4" />
            <span>Dublin&apos;s First Swipeless Dating App</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 max-w-4xl leading-[1.1]">
            Stop swiping.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-pink-500 to-primary">
              Start meeting.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed">
            We use advanced voice technology to understand who you really are,
            your values, personality, and what you&apos;re looking for. Then we
            set up real coffee dates with people who actually fit.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <SignInButton mode="modal" forceRedirectUrl="/dashboard">
              <Button
                size="lg"
                className="h-14 px-8 text-lg rounded-full shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
              >
                Get Started — It&apos;s Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </SignInButton>
            {/* <Button
              variant="outline"
              size="lg"
              className="h-14 px-8 text-lg rounded-full"
            >
              <Mic className="mr-2 w-5 h-5" />
              See How It Works
            </Button> */}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <span>500+ singles in Dublin</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-border" />
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>No swiping required</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-border" />
            <div className="flex items-center gap-2">
              <Coffee className="w-4 h-4 text-primary" />
              <span>Real dates, not endless chats</span>
            </div>
          </div>
        </section>

        {/* Voice AI Differentiator */}
        <section className="py-16 md:py-24 relative">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                  <Mic className="w-4 h-4" />
                  Voice-Powered Matching
                </div>
                <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
                  We listen to understand
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-pink-500">
                    {" "}
                    who you really are
                  </span>
                </h2>
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                  Forget filling out endless forms. Have a natural conversation
                  with our matchmaker AI, and we&apos;ll understand your values,
                  communication style, and what truly matters to you in a
                  partner.
                </p>
                <div className="space-y-4">
                  {[
                    {
                      label: "Values & Beliefs",
                      desc: "What matters most to you",
                    },
                    {
                      label: "Communication Style",
                      desc: "How you connect with others",
                    },
                    {
                      label: "Relationship Intent",
                      desc: "What you're actually looking for",
                    },
                    {
                      label: "Personality Traits",
                      desc: "The real you, not a curated profile",
                    },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="mt-1 w-5 h-5 rounded-full bg-gradient-to-r from-primary to-pink-500 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <div>
                        <span className="font-semibold">{item.label}</span>
                        <span className="text-muted-foreground">
                          {" "}
                          — {item.desc}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-pink-500/20 rounded-3xl blur-2xl" />
                <div className="relative bg-card border border-border/50 rounded-3xl p-8 shadow-2xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-pink-500 flex items-center justify-center">
                      <Mic className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold">Matchmaker AI</p>
                      <p className="text-sm text-muted-foreground">
                        Listening...
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-end">
                      <div className="bg-primary/10 rounded-2xl rounded-br-md px-4 py-3 max-w-[80%]">
                        <p className="text-sm">
                          I value deep conversations over small talk. Someone
                          who&apos;s ambitious but also knows how to relax...
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3 max-w-[80%]">
                        <p className="text-sm">
                          I hear you want someone intellectually curious who
                          balances drive with presence. What does quality time
                          look like for you?
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 flex items-center justify-center gap-1">
                    {[12, 20, 16, 24, 14].map((height, i) => (
                      <div
                        key={i}
                        className="w-1 bg-primary rounded-full animate-pulse"
                        style={{
                          height: `${height}px`,
                          animationDelay: `${i * 0.1}s`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                From signup to coffee date
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground">
                Three steps. One week. Real connection.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Mic,
                  step: "01",
                  title: "Have a Conversation",
                  desc: "Chat with our matchmaker AI for 5 minutes. No forms, no swiping, just talk about what you're looking for.",
                },
                {
                  icon: Sparkles,
                  title: "Get Your Match",
                  step: "02",
                  desc: "We analyze compatibility across values, lifestyle, and personality. You get one curated match per week.",
                },
                {
                  icon: Coffee,
                  step: "03",
                  title: "Meet for Coffee",
                  desc: "Skip the texting games. Meet at a safe, vetted spot and see if there's real chemistry.",
                },
              ].map((step, i) => (
                <div
                  key={i}
                  className="group relative flex flex-col p-8 rounded-3xl bg-background border border-border/50 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500"
                >
                  <span className="absolute -top-4 -left-2 text-7xl font-bold text-primary/10 group-hover:text-primary/20 transition-colors">
                    {step.step}
                  </span>
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-pink-500/20 flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
                      <step.icon className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats / Social Proof */}
        <section className="py-16 md:py-20 bg-gradient-to-br from-foreground via-foreground to-primary/90 text-background relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center relative">
            {[
              { label: "Coffee Dates Set Up", value: "100+" },
              { label: "Second Date Rate", value: "68%" },
              { label: "Match Satisfaction", value: "95%" },
              { label: "Hours of Swiping Saved", value: "1K+" },
            ].map((stat, i) => (
              <div key={i} className="group">
                <div className="text-4xl md:text-5xl font-bold mb-2 tracking-tight bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-sm md:text-base opacity-70 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Comparison Section */}
        <section className="py-16 md:py-24 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                Dating apps are broken.
                <br />
                <span className="text-muted-foreground">We fixed it.</span>
              </h2>
            </div>

            <div className="relative grid md:grid-cols-2 gap-6 items-stretch">
              {/* VS Badge */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hidden md:flex items-center justify-center w-14 h-14 bg-background rounded-full border-2 border-border shadow-lg font-black text-muted-foreground text-sm">
                VS
              </div>

              <div className="p-8 rounded-3xl bg-muted/30 border border-border/50">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                    <X className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-bold text-muted-foreground">
                    Typical Dating Apps
                  </h3>
                </div>
                <ul className="space-y-5">
                  {[
                    {
                      text: "Endless swiping",
                      sub: "Average user swipes 100+ times daily",
                    },
                    {
                      text: "Surface-level matching",
                      sub: "Based on photos and a bio",
                    },
                    {
                      text: "Weeks of texting",
                      sub: "Before maybe meeting up",
                    },
                    {
                      text: "Ghosting epidemic",
                      sub: "50% of conversations go nowhere",
                    },
                    {
                      text: "Burnout & fatigue",
                      sub: "Dating becomes a chore",
                    },
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="mt-0.5 w-5 h-5 rounded-full bg-muted flex items-center justify-center shrink-0">
                        <X className="w-3 h-3 text-muted-foreground" />
                      </div>
                      <div>
                        <span className="font-medium text-muted-foreground">
                          {item.text}
                        </span>
                        <p className="text-sm text-muted-foreground/60">
                          {item.sub}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="relative p-8 rounded-3xl bg-gradient-to-br from-background via-background to-primary/5 border border-primary/20 shadow-2xl shadow-primary/10 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-pink-500/20 rounded-full blur-3xl" />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center">
                      <Heart className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold">MeetOnce</h3>
                    <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                      NEW
                    </span>
                  </div>
                  <ul className="space-y-5">
                    {[
                      {
                        text: "Zero swiping",
                        sub: "We do the searching for you",
                      },
                      {
                        text: "Deep compatibility",
                        sub: "Matchmaker AI understands values & personality",
                      },
                      {
                        text: "Straight to dates",
                        sub: "Meet within a week of matching",
                      },
                      {
                        text: "Verified & serious",
                        sub: "Only high-intent singles",
                      },
                      {
                        text: "Quality over quantity",
                        sub: "One great match beats 100 maybes",
                      },
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="mt-0.5 w-5 h-5 rounded-full bg-gradient-to-r from-primary to-pink-500 flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                        <div>
                          <span className="font-medium">{item.text}</span>
                          <p className="text-sm text-muted-foreground">
                            {item.sub}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Safety Measures Section */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12 md:mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-600 text-sm font-medium mb-6">
                <ShieldCheck className="w-4 h-4" />
                Your Safety Matters
              </div>
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                Meet with confidence
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                Every feature is designed with your safety and comfort in mind.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: ShieldCheck,
                  title: "Verified Profiles",
                  text: "Every user is verified before they can match",
                },
                {
                  icon: Lightbulb,
                  title: "Pre-Date Tips",
                  text: "Safety guidelines and advice before every date",
                },
                {
                  icon: Coffee,
                  title: "Vetted Locations",
                  text: "All dates at safe, public coffee shops we trust",
                },
                {
                  icon: LogOut,
                  title: "No Pressure",
                  text: "Leave whenever you want, no questions asked",
                },
                {
                  icon: Ban,
                  title: "Zero Tolerance",
                  text: "Ghosters and bad actors are permanently banned",
                },
                {
                  icon: MessageSquare,
                  title: "24/7 Support",
                  text: "Our team is always here if you need anything",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 p-6 rounded-2xl bg-background border border-border/50 hover:border-green-500/30 hover:shadow-lg transition-all duration-300"
                >
                  <div className="shrink-0 w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                    <item.icon className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 md:py-24">
          <div className="max-w-3xl mx-auto px-4">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                Common questions
              </h2>
              <p className="text-lg text-muted-foreground">
                Everything you need to know about MeetOnce
              </p>
            </div>
            <div className="space-y-3">
              {[
                {
                  q: "How does MeetOnce work?",
                  a: "It's simple: Have a 5-minute voice conversation with our matchmaker AI, and we'll understand what you're looking for. Every week, we'll send you one highly compatible match. If you both say yes, we set up the coffee date, time, place, everything. No swiping, no endless texting.",
                },
                {
                  q: "What will I know about my match beforehand?",
                  a: "You'll see their photos and a personalized explanation of why we think you'd click, based on shared values, lifestyle, and personality traits. You'll also pick your availability, and we'll handle the scheduling.",
                },
                {
                  q: "What if I need to cancel?",
                  a: "Life happens. Just let your match know ASAP through the app. Repeated no-shows or ghosting will result in being removed from the platform, we take everyone's time seriously.",
                },
                {
                  q: "Where do dates happen?",
                  a: "All first dates happen at vetted, public coffee shops in Dublin that we've partnered with. Safe, casual, and perfect for getting to know someone.",
                },
                {
                  q: "How often will I get matches?",
                  a: "One match per week. We believe in quality over quantity. If it doesn't work out, you'll get a new match the following week. No swiping fatigue, no endless options, just one person worth meeting.",
                },
                {
                  q: "Is it really free?",
                  a: "Yes, MeetOnce is completely free during our Dublin launch. We're building something different and want to prove it works.",
                },
              ].map((item, i) => (
                <details
                  key={i}
                  className="group bg-muted/30 rounded-2xl overflow-hidden"
                >
                  <summary className="flex items-center justify-between p-5 cursor-pointer list-none font-semibold hover:bg-muted/50 transition-colors">
                    {item.q}
                    <div className="shrink-0 ml-4 w-8 h-8 rounded-full bg-background border border-border flex items-center justify-center transition-transform group-open:rotate-180">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-primary"
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </div>
                  </summary>
                  <div className="px-5 pb-5 text-muted-foreground leading-relaxed">
                    {item.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-16 md:py-24 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-pink-500/20 to-primary/20 rounded-3xl blur-3xl" />
              <div className="relative bg-gradient-to-br from-foreground to-foreground/90 text-background rounded-3xl p-10 md:p-16 overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl" />
                <div className="relative">
                  <h2 className="text-3xl md:text-5xl font-bold mb-4">
                    Ready to meet someone real?
                  </h2>
                  <p className="text-lg md:text-xl opacity-80 mb-8 max-w-2xl mx-auto">
                    Join 500+ Dublin singles who&apos;ve ditched the swipe and
                    started dating with intention.
                  </p>
                  <SignInButton mode="modal" forceRedirectUrl="/dashboard">
                    <Button
                      size="lg"
                      variant="secondary"
                      className="h-14 px-10 text-lg rounded-full shadow-lg"
                    >
                      Get Started — It&apos;s Free
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </SignInButton>
                  <p className="text-sm opacity-60 mt-6">
                    No credit card required. No swiping. Just real dates.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center">
                <Heart className="w-4 h-4 text-white" />
              </div>
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
                className="p-2.5 rounded-full bg-muted hover:bg-muted/80 transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="p-2.5 rounded-full bg-muted hover:bg-muted/80 transition-colors"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="p-2.5 rounded-full bg-muted hover:bg-muted/80 transition-colors"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </footer>
      <div className="mt-8 pt-8 text-center text-sm text-muted-foreground">
        <p>Made with ❤️ in Dublin.</p>
      </div>
    </div>
  );
}
