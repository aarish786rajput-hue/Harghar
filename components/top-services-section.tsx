"use client"

import { Star, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useBooking } from "@/app/context/bookingcontext"

type Service = {
  name: string
  image: string
  rating: number
  reviews: string
  duration: string
  price: number
  oldPrice?: number
  tag?: string
}

const services: Service[] = [
  {
    name: "Facial & cleanup at home",
    image: "/images/service-salon.png",
    rating: 4.9,
    reviews: "18k",
    duration: "60 min",
    price: 699,
    oldPrice: 999,
    tag: "Bestseller",
  },
  {
    name: "Full home deep cleaning",
    image: "/images/service-cleaning.png",
    rating: 4.8,
    reviews: "24k",
    duration: "3 hrs",
    price: 1499,
    oldPrice: 1999,
  },
  {
    name: "AC service & repair",
    image: "/images/service-ac.png",
    rating: 4.7,
    reviews: "31k",
    duration: "45 min",
    price: 499,
    tag: "Popular",
  },
  {
    name: "Relaxing stress-relief massage",
    image: "/images/service-massage.png",
    rating: 4.9,
    reviews: "9k",
    duration: "90 min",
    price: 1299,
    oldPrice: 1599,
  },
]

export function TopServicesSection() {
  const { setBooking } = useBooking()

  function addService(service: Service) {
    setBooking({
      serviceName: service.name,
      date: "Next available day",
      time: "To be selected",
      price: service.price,
    })
    document.getElementById("booking-summary")?.scrollIntoView({ behavior: "smooth", block: "center" })
  }

  return (
    <section id="top-services" className="bg-secondary/40">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-14">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Top services</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Most-loved services near you this week.
            </p>
          </div>
          <a
            href="#services"
            className="hidden shrink-0 text-sm font-semibold text-primary hover:underline sm:block"
          >
            See more
          </a>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <article
              key={service.name}
              className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={service.image || "/placeholder.svg"}
                  alt={service.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {service.tag && (
                  <span className="absolute left-3 top-3 rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground">
                    {service.tag}
                  </span>
                )}
              </div>

              <div className="flex flex-1 flex-col p-4">
                <div className="flex items-center gap-2 text-xs font-medium">
                  <span className="flex items-center gap-1 text-foreground">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    {service.rating}
                  </span>
                  <span className="text-muted-foreground">({service.reviews})</span>
                  <span className="text-muted-foreground">·</span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    {service.duration}
                  </span>
                </div>

                <h3 className="mt-2 text-sm font-semibold leading-snug">{service.name}</h3>

                <div className="mt-3 flex items-end justify-between gap-2 pt-1">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-bold">₹{service.price}</span>
                    {service.oldPrice && (
                      <span className="text-sm text-muted-foreground line-through">
                        ₹{service.oldPrice}
                      </span>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="rounded-full"
                    onClick={() => addService(service)}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
