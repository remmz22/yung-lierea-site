"use client";

import { LanguageProvider } from "@/lib/i18n";
import type { ReleaseDTO, SiteSettings } from "@/lib/data";
import Loader from "@/components/landing/Loader";
import Navbar from "@/components/landing/Navbar";
import ScrollProgress from "@/components/landing/ScrollProgress";
import Hero from "@/components/landing/Hero";
import Marquee from "@/components/landing/Marquee";
import About from "@/components/landing/About";
import Discography from "@/components/landing/Discography";
import Stats from "@/components/landing/Stats";
import Contact from "@/components/landing/Contact";
import Footer from "@/components/landing/Footer";
import BackToTop from "@/components/landing/BackToTop";
import CookieConsent from "@/components/landing/CookieConsent";
import AnalyticsBeacon from "@/components/landing/AnalyticsBeacon";

type SiteStats = {
  monthlyListeners: number;
  followers: number;
  totalStreams: number;
  releaseCount: number;
  updatedAt: string | null;
};

export default function Landing({
  releases,
  profileUrl,
  stats,
  settings,
}: {
  releases: ReleaseDTO[];
  profileUrl: string;
  stats: SiteStats;
  settings: SiteSettings;
}) {
  return (
    <LanguageProvider>
      <Loader />
      <ScrollProgress />
      <Navbar settings={settings} />
      <main>
        <Hero settings={settings} />
        <Marquee />
        <About profileUrl={profileUrl} stats={stats} />
        <Discography releases={releases} />
        <Stats releases={releases} stats={stats} />
        <Contact settings={settings} />
      </main>
      <Footer settings={settings} />
      <BackToTop />
      <CookieConsent />
      <AnalyticsBeacon />
    </LanguageProvider>
  );
}
