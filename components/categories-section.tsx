import {
  Sparkles,
  Scissors,
  Wrench,
  Paintbrush,
  Zap,
  Droplets,
  Flower2,
  Hammer,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

type Category = {
  label: string
  icon: LucideIcon
  color: string
}

const categories: Category[] = [
  { label: "Cleaning", icon: Sparkles, color: "text-sky-600 bg-sky-50" },
  { label: "Salon & Spa", icon: Scissors, color: "text-pink-600 bg-pink-50" },
  { label: "Appliance Repair", icon: Wrench, color: "text-amber-600 bg-amber-50" },
  { label: "Painting", icon: Paintbrush, color: "text-violet-600 bg-violet-50" },
  { label: "Electrician", icon: Zap, color: "text-yellow-600 bg-yellow-50" },
  { label: "Plumbing", icon: Droplets, color: "text-blue-600 bg-blue-50" },
  { label: "Wellness", icon: Flower2, color: "text-emerald-600 bg-emerald-50" },
  { label: "Carpentry", icon: Hammer, color: "text-orange-600 bg-orange-50" },
]

export function CategoriesSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-14">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            What are you looking for?
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Browse our most-booked service categories.
          </p>
        </div>
        <a
          href="#services"
          className="hidden shrink-0 text-sm font-semibold text-primary hover:underline sm:block"
        >
          View all
        </a>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 md:gap-4">
        {categories.map(({ label, icon: Icon, color }) => (
          <a
            key={label}
            href="#services"
            className="group flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-5 text-center transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
          >
            <span
              className={`flex h-14 w-14 items-center justify-center rounded-2xl ${color} transition-transform group-hover:scale-110`}
            >
              <Icon className="h-7 w-7" />
            </span>
            <span className="text-sm font-semibold">{label}</span>
          </a>
        ))}
      </div>
    </section>
  )
}
