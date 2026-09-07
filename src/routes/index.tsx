import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Bell,
  Clock,
  Droplet as DropletIcon,
  HeartHandshake,
  MapPin,
  Radio,
  ShieldCheck,
  Sparkles,
  UserPlus,
  Warehouse,
} from "lucide-react";
import { useDonors } from "@/hooks/useDonors";
import { useRequests } from "@/hooks/useRequests";
import { useStock } from "@/hooks/useStock";
import { useCountUp } from "@/hooks/useCountUp";
import { isSupabaseConfigured } from "@/lib/supabaseClient";
import { BloodDrop } from "@/components/BloodDrop";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BloodBridge — Match Blood Donors to Patients in Seconds" },
      {
        name: "description",
        content:
          "BloodBridge matches compatible blood donors to nearby patients in seconds and keeps every blood bank's stock live and accurate.",
      },
      { property: "og:title", content: "BloodBridge — Every drop finds its way" },
      {
        property: "og:description",
        content:
          "Real-time donor matching by blood type and distance, with live blood bank inventory.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const BLOOD_TYPES = ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"];

function Home() {
  return (
    <div className="overflow-x-clip">
      <Hero />
      <TypeMarquee />

      <div className="mx-auto max-w-6xl space-y-28 px-4 pb-28 pt-24">
        <HowItWorks />
        <ImpactSection />
        <Features />
        <Compatibility />
        <FinalCta />
      </div>

      <SiteFooter />
    </div>
  );
}

/* ---------------- Hero ---------------- */

function Hero() {
  return (
    <section className="relative isolate overflow-hidden px-4 pb-16 pt-20 sm:pt-28">
      <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Blood donation, reimagined
            </span>
          </Reveal>

          <Reveal delay={90}>
            <h1 className="mt-6 font-heading text-5xl leading-[1.03] sm:text-6xl lg:text-7xl">
              Every drop <em className="text-gradient-primary not-italic">finds its way</em>.
            </h1>
          </Reveal>

          <Reveal delay={180}>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              BloodBridge matches donors to the patients who need them — by blood type, distance and
              live inventory — the moment a request comes in.
            </p>
          </Reveal>

          <Reveal delay={260}>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="gap-2 shadow-lg shadow-primary/20">
                <Link to={isSupabaseConfigured ? "/login" : "/dashboard"}>
                  Get started <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-primary/30">
                <Link to="/dashboard">View live dashboard</Link>
              </Button>
            </div>
          </Reveal>

          <Reveal delay={340}>
            <ul className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" /> Medically valid matches
              </li>
              <li className="flex items-center gap-2">
                <Radio className="h-4 w-4 text-primary" /> Live on every device
              </li>
              <li className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" /> Cooldown tracked automatically
              </li>
            </ul>
          </Reveal>
        </div>

        {/* Ripple emblem */}
        <Reveal delay={200}>
          <div className="relative mx-auto flex aspect-square w-full max-w-md items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/15 via-transparent to-gold/20 blur-2xl" />
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="ripple-ring pointer-events-none absolute h-40 w-40 rounded-full border border-primary/35"
                style={{ animationDelay: `${i * 1.05}s` }}
              />
            ))}
            <div className="glass grain relative flex h-56 w-56 items-center justify-center overflow-hidden rounded-full">
              <BloodDrop className="heartbeat h-24 w-24 text-primary drop-shadow-[0_14px_34px_rgba(150,20,35,0.35)]" />
            </div>

            <FloatChip
              className="absolute -left-2 top-8"
              label="O− needed"
              sub="Kigali · 2.4 km"
            />
            <FloatChip
              className="absolute -right-2 bottom-12"
              label="Match found"
              sub="in 3 seconds"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function FloatChip({
  className,
  label,
  sub,
}: {
  className?: string;
  label: string;
  sub: string;
}) {
  return (
    <div className={`glass float-y rounded-2xl px-4 py-3 text-left ${className ?? ""}`}>
      <p className="text-sm font-semibold">{label}</p>
      <p className="text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}

/* ---------------- Marquee ---------------- */

function TypeMarquee() {
  const items = [...BLOOD_TYPES, ...BLOOD_TYPES, ...BLOOD_TYPES, ...BLOOD_TYPES];
  return (
    <div className="relative overflow-hidden border-y border-border/70 bg-card/40 py-4">
      <div className="marquee-track gap-10">
        {items.map((t, i) => (
          <span
            key={`${t}-${i}`}
            className="flex shrink-0 items-center gap-2 font-heading text-xl text-muted-foreground"
          >
            <DropletIcon className="h-4 w-4 text-primary" />
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Sections ---------------- */

function SectionHead({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <Reveal className="mb-12 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{eyebrow}</p>
      <h2 className="mt-3 font-heading text-4xl sm:text-5xl">{title}</h2>
      <div className="rule-gradient mx-auto mt-6 w-40" />
    </Reveal>
  );
}

function HowItWorks() {
  const steps = [
    {
      icon: UserPlus,
      title: "Register as a donor",
      body: "Share your blood type, phone and location once — toggle availability whenever you're free to give.",
    },
    {
      icon: MapPin,
      title: "Get matched instantly",
      body: "A hospital posts a request; BloodBridge filters by compatibility and sorts by distance automatically.",
    },
    {
      icon: HeartHandshake,
      title: "Donate, stock updates live",
      body: "Confirming a donation starts your cooldown and adds straight to the blood bank's live inventory.",
    },
  ];
  return (
    <section>
      <SectionHead eyebrow="How it works" title="From donor to patient, in three steps" />
      <div className="grid gap-6 sm:grid-cols-3">
        {steps.map((step, i) => (
          <Reveal key={step.title} delay={i * 120}>
            <Card className="hover-lift glass grain relative h-full overflow-hidden border-border/70">
              <CardContent className="p-7">
                <span className="font-heading text-5xl text-primary/20">0{i + 1}</span>
                <span className="mt-3 mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <step.icon className="h-5 w-5" />
                </span>
                <h3 className="font-heading text-2xl">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              </CardContent>
            </Card>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Features() {
  const features = [
    {
      icon: DropletIcon,
      title: "Blood-type compatibility engine",
      body: "Encodes the real donor/recipient rules — O− as universal donor, AB+ as universal recipient — so matches are always medically valid.",
    },
    {
      icon: MapPin,
      title: "Distance-aware matching",
      body: "Compatible donors are sorted by real proximity, not alphabetically, so the closest match comes first.",
    },
    {
      icon: Radio,
      title: "Live realtime sync",
      body: "Every open tab and device updates the moment stock, donors or requests change anywhere — no refresh needed.",
    },
    {
      icon: Warehouse,
      title: "Stock & activity tracking",
      body: "Every donation and adjustment is logged, with automatic low-stock alerts before a shortage becomes critical.",
    },
    {
      icon: Clock,
      title: "Eligibility & cooldown",
      body: "Donors are automatically held back until they're safe to give again, so no one is called too early.",
    },
    {
      icon: Bell,
      title: "Urgent request signals",
      body: "Critical requests stand out immediately, so the most urgent cases are never buried in a list.",
    },
  ];
  return (
    <section>
      <SectionHead eyebrow="Built for the real thing" title="Everything a blood bank needs" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f, i) => (
          <Reveal key={f.title} delay={i * 90}>
            <Card className="hover-lift glass h-full border-border/70">
              <CardContent className="p-7">
                <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-gold/20 text-primary">
                  <f.icon className="h-5 w-5" />
                </span>
                <h3 className="font-heading text-2xl">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
              </CardContent>
            </Card>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function Compatibility() {
  return (
    <section>
      <SectionHead eyebrow="Compatibility" title="Who can give to whom" />
      <Reveal>
        <Card className="glass grain overflow-hidden border-border/70">
          <CardContent className="grid gap-4 p-8 sm:grid-cols-4">
            {BLOOD_TYPES.map((t) => (
              <div
                key={t}
                className="hover-lift rounded-2xl border border-border/70 bg-background/50 p-5 text-center"
              >
                <p className="font-heading text-4xl text-primary">{t}</p>
                <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
                  {t === "O-" ? "Universal donor" : t === "AB+" ? "Universal recipient" : "Group"}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </Reveal>
    </section>
  );
}

function FinalCta() {
  return (
    <Reveal>
      <Card className="grain relative overflow-hidden border-primary/25 bg-gradient-to-br from-primary/12 via-card to-gold/10 text-center">
        <CardContent className="flex flex-col items-center gap-5 p-14">
          <BloodDrop className="float-y h-12 w-12 text-primary" />
          <h2 className="max-w-xl font-heading text-4xl sm:text-5xl">
            Ready to save a life today?
          </h2>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
            Register as a donor, or sign in to manage your blood bank's requests and stock.
          </p>
          <Button asChild size="lg" className="gap-2 shadow-lg shadow-primary/20">
            <Link to={isSupabaseConfigured ? "/login" : "/dashboard"}>
              Get started <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </Reveal>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-border/70 bg-card/40">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-10 text-center text-sm text-muted-foreground">
        <span className="flex items-center gap-2 font-heading text-xl text-foreground">
          <DropletIcon className="h-4 w-4 text-primary" /> BloodBridge
        </span>
        <p>Built for the Web Technology course project.</p>
      </div>
    </footer>
  );
}

/* ---------------- Live impact ---------------- */

function ImpactSection() {
  const { data: donors = [] } = useDonors();
  const { data: requests = [] } = useRequests();
  const { data: stock = [] } = useStock();

  const fulfilled = requests.filter((r) => r.status === "fulfilled").length;
  const totalUnits = stock.reduce((sum, s) => sum + s.units_available, 0);

  const donorsCount = useCountUp(donors.length);
  const fulfilledCount = useCountUp(fulfilled);
  const unitsCount = useCountUp(totalUnits);

  const items = [
    { value: donorsCount, label: "Registered donors" },
    { value: fulfilledCount, label: "Requests fulfilled" },
    { value: unitsCount, label: "Units currently in stock" },
  ];

  return (
    <Reveal>
      <Card className="glass grain overflow-hidden border-border/70">
        <CardContent className="grid gap-8 p-10 sm:grid-cols-3">
          {items.map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-heading text-6xl tabular-nums text-gradient-primary">
                {s.value}
              </div>
              <p className="mt-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                {s.label}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </Reveal>
  );
}
