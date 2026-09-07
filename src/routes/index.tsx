import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  ArrowRight,
  Droplet as DropletIcon,
  HeartHandshake,
  MapPin,
  Radio,
  UserPlus,
  Warehouse,
} from "lucide-react";
import { useDonors } from "@/hooks/useDonors";
import { useRequests } from "@/hooks/useRequests";
import { useStock } from "@/hooks/useStock";
import { useCountUp } from "@/hooks/useCountUp";
import { useScrollProgress, mapRange } from "@/hooks/useScrollProgress";
import { isSupabaseConfigured } from "@/lib/supabaseClient";
import { BloodDrop } from "@/components/BloodDrop";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/")({
  component: Home,
});

function bandOpacity(p: number, inStart: number, inEnd: number, outStart: number, outEnd: number) {
  const fadeIn = mapRange(p, inStart, inEnd, 0, 1);
  const fadeOut = 1 - mapRange(p, outStart, outEnd, 0, 1);
  return Math.min(fadeIn, fadeOut);
}

/** Fully visible from the very start (progress 0) - only fades out later. Used
 * for the first hero stage, so the page never opens on a blank screen. */
function fadeOutOnly(p: number, outStart: number, outEnd: number) {
  return 1 - mapRange(p, outStart, outEnd, 0, 1);
}

function Home() {
  const { ref: heroRef, progress } = useScrollProgress<HTMLDivElement>();

  const dropY = mapRange(progress, 0, 0.85, -30, 260);
  const dropScale = mapRange(progress, 0, 0.85, 0.7, 1.25);
  const dropRotate = Math.sin(progress * Math.PI * 2.2) * 5;
  const dropOpacity = 1;

  // Stage 1 (badge + headline) is visible the instant the page loads - it
  // only fades out as you start scrolling. Everything after fades in, holds,
  // then fades out for the next stage; the final CTA fades in and stays.
  const badgeOpacity = fadeOutOnly(progress, 0.16, 0.26);
  const subOpacity = bandOpacity(progress, 0.22, 0.34, 0.46, 0.56);
  const featureLineOpacity = bandOpacity(progress, 0.46, 0.56, 0.7, 0.8);
  const ctaOpacity = bandOpacity(progress, 0.72, 0.84, 1.0, 1.2);

  const ring1 = mapRange(progress, 0.78, 1, 0, 1);
  const ring2 = mapRange(progress, 0.85, 1, 0, 1);
  const ring3 = mapRange(progress, 0.92, 1, 0, 1);

  return (
    <div>
      {/* ---------- Scroll-driven hero ---------- */}
      <div ref={heroRef} className="relative" style={{ height: "300vh" }}>
        <div className="sticky top-0 flex h-screen flex-col items-center justify-center overflow-hidden px-4 text-center">
          {/* Ripple rings behind the drop, appear near the end of the scroll */}
          <span
            className="pointer-events-none absolute rounded-full border-2 border-primary/40"
            style={{
              width: 90,
              height: 90,
              transform: `translateY(${dropY}px) scale(${1 + ring1 * 2.4})`,
              opacity: 0.5 * (1 - ring1),
            }}
          />
          <span
            className="pointer-events-none absolute rounded-full border-2 border-primary/30"
            style={{
              width: 90,
              height: 90,
              transform: `translateY(${dropY}px) scale(${1 + ring2 * 3.2})`,
              opacity: 0.4 * (1 - ring2),
            }}
          />
          <span
            className="pointer-events-none absolute rounded-full border-2 border-primary/20"
            style={{
              width: 90,
              height: 90,
              transform: `translateY(${dropY}px) scale(${1 + ring3 * 4})`,
              opacity: 0.3 * (1 - ring3),
            }}
          />

          <BloodDrop
            className="pointer-events-none absolute h-20 w-20 text-primary drop-shadow-[0_10px_30px_rgba(190,20,40,0.35)]"
            style={{
              transform: `translateY(${dropY}px) scale(${dropScale}) rotate(${dropRotate}deg)`,
              opacity: dropOpacity,
            }}
          />

          <div className="relative flex h-60 w-full max-w-2xl flex-col items-center justify-center px-2 sm:h-64">
            {/* Stage 1: badge + headline - visible immediately on load */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-center"
              style={{ opacity: badgeOpacity }}
            >
              <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-primary">
                Blood donation, reimagined
              </p>
              <h1 className="font-heading text-4xl font-bold leading-tight sm:text-5xl">
                Every drop <span className="text-gradient-primary">finds its way</span>.
              </h1>
            </div>

            {/* Stage 2: subheadline */}
            <p
              className="absolute inset-0 flex items-center justify-center text-lg text-muted-foreground sm:text-xl"
              style={{ opacity: subOpacity }}
            >
              Real-time matching between donors and the patients who need them — by blood type,
              distance, and live inventory, the moment a request comes in.
            </p>

            {/* Stage 3: feature callout */}
            <p
              className="absolute inset-0 flex items-center justify-center text-lg text-muted-foreground sm:text-xl"
              style={{ opacity: featureLineOpacity }}
            >
              Compatible donors surfaced in seconds — sorted by blood type and real distance.
            </p>

            {/* Stage 4: CTA - fades in and stays */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-3 sm:flex-row"
              style={{ opacity: ctaOpacity }}
            >
              <Button asChild size="lg" className="gap-2">
                <Link to={isSupabaseConfigured ? "/login" : "/dashboard"}>
                  Get started <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/dashboard">View live dashboard</Link>
              </Button>
            </div>
          </div>

          <div
            className="absolute bottom-8 flex flex-col items-center gap-1 text-xs text-muted-foreground"
            style={{ opacity: fadeOutOnly(progress, 0.03, 0.12) }}
          >
            <span>Scroll</span>
            <span className="h-8 w-px animate-pulse bg-border" />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl space-y-24 px-4 pb-24 pt-8">
        {/* ---------- How it works ---------- */}
        <section>
          <Reveal className="mb-10 text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">
              How it works
            </p>
            <h2 className="mt-2 font-heading text-2xl font-bold sm:text-3xl">
              From donor to patient, in three steps
            </h2>
          </Reveal>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                icon: UserPlus,
                title: "Register as a donor",
                body: "Share your blood type, phone, and location once — toggle availability whenever you're free to give.",
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
            ].map((step, i) => (
              <Reveal key={step.title} delay={i * 120}>
                <Card className="hover-lift h-full">
                  <CardContent className="p-6">
                    <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <step.icon className="h-5 w-5" />
                    </span>
                    <h3 className="font-heading font-semibold">{step.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{step.body}</p>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ---------- Live impact ---------- */}
        <ImpactSection />

        {/* ---------- Features ---------- */}
        <section>
          <Reveal className="mb-10 text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">
              Built for the real thing
            </p>
            <h2 className="mt-2 font-heading text-2xl font-bold sm:text-3xl">
              Everything a blood bank actually needs
            </h2>
          </Reveal>
          <div className="grid gap-6 sm:grid-cols-2">
            {[
              {
                icon: DropletIcon,
                title: "Blood-type compatibility engine",
                body: "Encodes the real donor/recipient rules — O- as universal donor, AB+ as universal recipient — so matches are always medically valid.",
              },
              {
                icon: MapPin,
                title: "Distance-aware matching",
                body: "Compatible donors are sorted by real proximity, not just alphabetically, so the closest match comes first.",
              },
              {
                icon: Radio,
                title: "Live realtime sync",
                body: "Every open tab and device updates the moment stock, donors, or requests change anywhere — no refresh needed.",
              },
              {
                icon: Warehouse,
                title: "Stock & activity tracking",
                body: "Every donation and adjustment is logged, with automatic low-stock alerts before a shortage becomes critical.",
              },
            ].map((f, i) => (
              <Reveal key={f.title} delay={i * 100}>
                <Card className="hover-lift h-full">
                  <CardContent className="flex gap-4 p-6">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <f.icon className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="font-heading font-semibold">{f.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
                    </div>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ---------- Final CTA ---------- */}
        <Reveal>
          <Card className="hover-lift overflow-hidden border-primary/20 bg-gradient-to-br from-primary/10 via-transparent to-transparent text-center">
            <CardContent className="flex flex-col items-center gap-4 p-10">
              <BloodDrop className="float-y h-10 w-10 text-primary" />
              <h2 className="font-heading text-2xl font-bold sm:text-3xl">
                Ready to save a life today?
              </h2>
              <p className="max-w-md text-sm text-muted-foreground">
                Register as a donor or sign in to manage your blood bank's requests and stock.
              </p>
              <Button asChild size="lg" className="gap-2">
                <Link to={isSupabaseConfigured ? "/login" : "/dashboard"}>
                  Get started <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </Reveal>

        <footer className="border-t pt-8 text-center text-sm text-muted-foreground">
          BloodBridge — built for the Web Technology course project.
        </footer>
      </div>
    </div>
  );
}

function ImpactSection() {
  const { data: donors = [] } = useDonors();
  const { data: requests = [] } = useRequests();
  const { data: stock = [] } = useStock();

  const fulfilled = requests.filter((r) => r.status === "fulfilled").length;
  const totalUnits = stock.reduce((sum, s) => sum + s.units_available, 0);

  const donorsCount = useCountUp(donors.length);
  const fulfilledCount = useCountUp(fulfilled);
  const unitsCount = useCountUp(totalUnits);

  return (
    <Reveal>
      <Card className="hover-lift overflow-hidden">
        <CardContent className="grid gap-6 p-8 sm:grid-cols-3">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 font-heading text-4xl font-bold tabular-nums text-primary">
              <Activity className="h-6 w-6" />
              {donorsCount}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">Registered donors</p>
          </div>
          <div className="text-center">
            <div className="font-heading text-4xl font-bold tabular-nums text-primary">
              {fulfilledCount}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">Requests fulfilled</p>
          </div>
          <div className="text-center">
            <div className="font-heading text-4xl font-bold tabular-nums text-primary">
              {unitsCount}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">Units currently in stock</p>
          </div>
        </CardContent>
      </Card>
    </Reveal>
  );
}
