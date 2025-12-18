import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ArrowRight, Ban, Check, Coffee, Heart, Instagram, Lightbulb, Linkedin, LogOut, Menu, MessageCircle, MessageSquare, Play, Send, ShieldCheck, Twitter } from "lucide-react";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-background/80 backdrop-blur-md border-b border-border/40">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold tracking-tighter">MeetOnce</span>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <a href="#" className="text-sm font-medium hover:text-primary transition-colors">Log In</a>
          <Button variant="default" className="rounded-full px-6">Sign Up</Button>
        </nav>
        
        {/* Mobile Menu */}
        <div className="md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground h-9 w-9">
                <Menu className="w-6 h-6" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>
                <a href="#" className="w-full">Log In</a>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span className="w-full font-bold text-primary">Sign Up</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="pt-24">
        {/* Hero Section */}
        <section className="relative px-6 py-16 md:py-32 max-w-7xl mx-auto flex flex-col items-center text-center">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-background to-background blur-3xl opacity-50" />
          
          <h1 className="text-4xl md:text-7xl font-bold tracking-tight mb-8 max-w-4xl leading-[1.1]">
            Tell me your type, <br />
            <span className="text-primary">I set up the date</span>
          </h1>

          <div className="w-full max-w-3xl bg-card border border-border/50 rounded-2xl p-6 md:p-8 shadow-xl backdrop-blur-sm mb-10">
            <div className="flex flex-col gap-4 text-left">
              <div className="flex flex-wrap items-center gap-2 text-lg md:text-2xl font-medium text-muted-foreground">
                <span>Find me a</span>
                <span className="text-foreground border-b-2 border-primary/50 px-1">5'9" Architect</span>
                <span>who loves</span>
                <span className="text-foreground border-b-2 border-primary/50 px-1">Hiking & Jazz</span>
                <span>and</span>
                <span className="text-foreground border-b-2 border-primary/50 px-1">makes great pasta</span>
              </div>
              <div className="flex flex-col md:flex-row gap-2 mt-4">
                <Input 
                  placeholder="Describe your ideal match..." 
                  className="h-12 text-lg bg-background/50 border-primary/20 focus-visible:ring-primary"
                />
                <Button size="lg" className="h-12 w-full md:w-auto px-8 text-lg rounded-xl">
                  Start <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-muted-foreground">
            {/* <Button variant="secondary" size="lg" className="rounded-full px-8">
              Join waitlist
            </Button> */}
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>12,000+ people registered</span>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 md:py-20 bg-muted/30">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">How It Works</h2>
              <p className="text-lg md:text-xl text-muted-foreground">From text to date in 3 simple steps</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: MessageCircle,
                  title: "Tell Us Your Preference",
                  desc: "Chat with us to define exactly what you're looking for correctly."
                },
                {
                  icon: Send,
                  title: "We Email You a Date Plan",
                  desc: "We simulate dates with matches and send you the perfect plan."
                },
                {
                  icon: Heart,
                  title: "You Date IRL!",
                  desc: "Skip the small talk. Show up and enjoy a curated experience."
                }
              ].map((step, i) => (
                <div key={i} className="flex flex-col items-center text-center p-6 rounded-2xl bg-background border border-border/50 hover:shadow-lg transition-all duration-300">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 text-primary">
                    <step.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground">{step.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-12 md:mt-16 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium">
                <Play className="w-4 h-4 fill-current" />
                <span>Just Enjoy the Fun Part</span>
              </div>
            </div>
          </div>
        </section>

        {/* Stats / Social Proof */}
        <section className="py-16 md:py-20 bg-foreground text-background">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: "Dates Arranged", value: "9,000+" },
              { label: "Success Rate", value: "69%" },
              { label: "Matches Satisfaction", value: "95%" },
              { label: "Hours Saved", value: "50k+" }
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-4xl md:text-5xl font-bold mb-2 tracking-tight">{stat.value}</div>
                <div className="text-sm md:text-base opacity-80 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Comparison Section */}
        <section className="py-16 md:py-24 px-6">
          <div className="max-w-5xl mx-auto relative grid md:grid-cols-2 gap-8 items-center">
            {/* VS Badge */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hidden md:flex items-center justify-center w-12 h-12 bg-background rounded-full border border-border shadow-sm font-black text-muted-foreground text-xs">
              VS
            </div>

            <div className="p-8 rounded-3xl bg-muted/20 border-2 border-dashed border-border/50 text-muted-foreground/50 transition-colors hover:bg-muted/30">
              <h3 className="text-2xl font-bold mb-6 text-muted-foreground">Other Dating Apps</h3>
              <ul className="space-y-4">
                {[
                  "Endless Swiping",
                  "Repetitive Small Talk",
                  "Ghosting & Flaking",
                  "Wasted Evenings"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <Check className="w-5 h-5 opacity-50" />
                    <span className="decoration-destructive/30 decoration-2">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative p-8 rounded-3xl bg-gradient-to-br from-background to-primary/10 border border-primary/20 shadow-2xl shadow-primary/10 overflow-hidden group hover:scale-[1.02] transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                MeetOnce
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">New</span>
              </h3>
              <ul className="space-y-4">
                {[
                  "1 Ready-to-go Date Invite",
                  "Curated Matches Only",
                  "High Intent Users",
                  "1000+ Identity Simulations",
                  "Zero Wasted Time"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 font-medium">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full border bg-secondary flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 text-secondary-foreground" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-8 pt-8 border-t border-primary/10">
                <div className="flex items-baseline gap-2">
                   <div className="text-4xl font-bold text-foreground">1,000</div>
                   <div className="text-sm font-medium">Simulations</div>
                </div>
                <div className="text-sm text-muted-foreground">Ran per potential match to ensure quality</div>
              </div>
            </div>
          </div>
        </section>

        {/* Safety Measures Section */}
        <section className="py-16 md:py-20 bg-muted/30">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Our Safety Measures</h2>
            <p className="text-lg md:text-xl text-muted-foreground">
              MeetOnce is specifically designed to create a safe and comfortable space.
            </p>
            </div>

            <div className="bg-background rounded-3xl p-8 md:p-12 shadow-sm border border-border/40 text-left">
              <div className="grid gap-6">
                {[
                  { icon: ShieldCheck, text: "Daters are all verified" },
                  { icon: Lightbulb, text: "Offer tips for dating safely before you go" },
                  { icon: Coffee, text: "Safe coffee shops with our team looking out for you" },
                  { icon: LogOut, text: "Leave whenever you feel uncomfortable" },
                  { icon: Ban, text: "Ghosters can never participate again" },
                  { icon: MessageSquare, text: "A support team available" }
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-0.5 text-orange-500">
                      <item.icon className="w-6 h-6" />
                    </div>
                    <span className="text-lg font-medium">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 md:py-20 bg-muted/30">
        
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">FAQ</h2>
            <p className="text-lg md:text-xl text-muted-foreground">What you need to know about MeetOnce</p>
            </div>
            <div className="space-y-4">
              {[
                {
                  q: "How MeetOnce works?",
                  a: "MeetOnce curates dates for you without requiring you to swipe or chat with anyone. After submitting your information, MeetOnce will text you a date plan that includes the time, place, and details of your match. The date will take place around the campus you're currently near."
                },
                {
                  q: "What will I know about my match before the date?",
                  a: "Once we find a good match for you, you'll get a poster with their photos and a short explanation of why you'd be a great pair. You'll also get a scheduler to share your availability for the week. After both of you fill it out, we'll arrange the date time, place, and give you a few dating tips to help it go smoothly."
                },
                {
                  q: "What if I can't make it last minute?",
                  a: "If you really can't make it last minute, please cancel by texting your match asap to prevent being banned from future experiences."
                },
                {
                  q: "Where do the dates happen?",
                  a: "Dates take place at carefully selected on-campus spots to ensure a safe and enjoyable experience."
                },
                {
                  q: "How often can I go on a MeetOnce date?",
                  a: "As long as you're not already in the process of a date or banned for ghosting, we can always sign you up for more dates. However, we might pause matching during school holidays when fewer students are around."
                }
              ].map((item, i) => (
                <details key={i} className="group bg-background rounded-2xl border border-border/50 overflow-hidden">
                  <summary className="flex items-center justify-between p-6 cursor-pointer list-none font-bold text-lg hover:bg-muted/30 transition-colors">
                    {item.q}
                    <div className="flex-shrink-0 ml-4 transition-transform group-open:rotate-180">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-primary"><path d="m6 9 6 6 6-6"/></svg>
                    </div>
                  </summary>
                  <div className="px-6 pb-6 text-muted-foreground leading-relaxed">
                    {item.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
          
          
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold">MeetOnce</span>
            {/* <span className="text-sm text-muted-foreground">© 2025</span> */}
          </div>
          
          <div className="flex items-center gap-8">
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Terms</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Privacy</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Cookies</a>
          </div>

          <div className="flex items-center gap-4">
            <a href="#" className="p-2 rounded-full hover:bg-muted transition-colors">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="#" className="p-2 rounded-full hover:bg-muted transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#" className="p-2 rounded-full hover:bg-muted transition-colors">
              <Linkedin className="w-5 h-5" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
