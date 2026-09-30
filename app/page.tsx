import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { HeroSection } from "@/components/hero-section"
import { CategoriesSection } from "@/components/categories-section"
import { TopServicesSection } from "@/components/top-services-section"
import { MobileNav } from "@/components/mobile-nav"
import ServicesList from "@/components/serviceslist";
import BookingSummary from "@/components/BookingSummary";
import { HarGharLogo } from "@/components/harghar-logo";

export default function Page() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="pb-20 lg:pb-0">
        <HeroSection />
        <CategoriesSection />
        <TopServicesSection />
        <ServicesList />
        <BookingSummary />


        <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-14">
          <div className="rounded-3xl bg-primary px-6 py-10 text-center text-primary-foreground sm:px-10 md:py-14">
            <h2 className="text-balance text-2xl font-bold sm:text-3xl">
              Become a HarGhar professional
            </h2>
            <p className="mx-auto mt-2 max-w-md text-pretty text-sm text-primary-foreground/80">
              Grow your business with flexible hours and guaranteed payouts. Join 50,000+ pros.
            </p>
            <Link
              href="/partner"
              className="mt-6 inline-block rounded-full bg-background px-6 py-3 text-sm font-semibold text-foreground transition-transform hover:scale-105"
            >
              Register as a professional
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-secondary/30">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 py-8 text-center text-sm text-muted-foreground sm:px-6">
          <HarGharLogo size={32} />
          <p>Quality home services at your doorstep.</p>
          <p className="text-xs">© {new Date().getFullYear()} HarGhar. All rights reserved.</p>
        </div>
      </footer>

      <MobileNav />
    </div>
  )
}
