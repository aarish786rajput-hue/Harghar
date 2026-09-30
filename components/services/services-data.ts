// Service data and types shared across ServicesList sub-components
export type ServiceItem = {
  id: string
  name: string
  category: string
  description: string
  price: number
  oldPrice?: number
  duration: string
  rating: number
  reviews: number
  popular?: boolean
}

export const CATEGORIES = [
  "All",
  "Cleaning",
  "Salon & Spa",
  "Repairs",
  "Electrician",
  "Plumbing",
  "Wellness",
]

export const ALL_SERVICES: ServiceItem[] = [
  // Cleaning
  {
    id: "clean-1", name: "Deep Bathroom Cleaning", category: "Cleaning",
    description: "Intense descaling, tile scrubbing, stain removal & sanitization.",
    price: 599, oldPrice: 799, duration: "60 min", rating: 4.8, reviews: 1420, popular: true,
  },
  {
    id: "clean-2", name: "Kitchen Deep Clean", category: "Cleaning",
    description: "Degreasing cabinets, chimney wipe, stove & slab sanitization.",
    price: 899, oldPrice: 1199, duration: "90 min", rating: 4.9, reviews: 980,
  },
  {
    id: "clean-3", name: "Sofa & Cushion Shampooing", category: "Cleaning",
    description: "Deep injection extraction machine cleaning for fabric sofas.",
    price: 699, oldPrice: 899, duration: "45 min", rating: 4.7, reviews: 820,
  },
  {
    id: "clean-4", name: "Full Home Deep Cleaning", category: "Cleaning",
    description: "Complete home sanitization — floors, walls, kitchen & bathrooms.",
    price: 1499, oldPrice: 1999, duration: "3 hrs", rating: 4.8, reviews: 2400, popular: true,
  },
  // Salon & Spa
  {
    id: "salon-1", name: "Men's Haircut & Beard Grooming", category: "Salon & Spa",
    description: "Trendy haircut, beard trimming/shave with calming head massage.",
    price: 349, oldPrice: 499, duration: "45 min", rating: 4.9, reviews: 3200, popular: true,
  },
  {
    id: "salon-2", name: "Express Pedicure & Manicure", category: "Salon & Spa",
    description: "Cuticle care, gentle scrub, nail shaping & nourishing massage.",
    price: 799, oldPrice: 999, duration: "60 min", rating: 4.8, reviews: 1650,
  },
  {
    id: "salon-3", name: "Herbal Glow Facial", category: "Salon & Spa",
    description: "Organic fruit-extract peel with steam and firming sheet mask.",
    price: 999, oldPrice: 1399, duration: "60 min", rating: 4.9, reviews: 2100,
  },
  {
    id: "salon-4", name: "Salon for Women — Full Package", category: "Salon & Spa",
    description: "Hair wash, cut, blow-dry, facial & threading — all at home.",
    price: 1299, oldPrice: 1799, duration: "120 min", rating: 4.9, reviews: 1800, popular: true,
  },
  // Repairs
  {
    id: "repair-1", name: "AC Power Jet Deep Service", category: "Repairs",
    description: "Thorough indoor & outdoor unit coil wash with 30-day cooling guarantee.",
    price: 549, oldPrice: 749, duration: "45 min", rating: 4.8, reviews: 4500, popular: true,
  },
  {
    id: "repair-2", name: "Washing Machine Checkup", category: "Repairs",
    description: "Motor diagnostic, drum check, water drain and vibration fix.",
    price: 299, oldPrice: 399, duration: "30 min", rating: 4.7, reviews: 890,
  },
  {
    id: "repair-3", name: "Refrigerator Repair & Gas Refill", category: "Repairs",
    description: "Compressor testing, leak detection, and genuine OEM parts.",
    price: 499, oldPrice: 699, duration: "60 min", rating: 4.8, reviews: 1140,
  },
  // Electrician
  {
    id: "elec-1", name: "Switchboard & Wiring Repair", category: "Electrician",
    description: "Fix burnt switches, short circuits, MCB replacement & testing.",
    price: 199, oldPrice: 299, duration: "30 min", rating: 4.9, reviews: 2800,
  },
  {
    id: "elec-2", name: "Fan & Light Installation", category: "Electrician",
    description: "Ceiling fan, tube light, LED panel fitting with safety testing.",
    price: 249, oldPrice: 349, duration: "30 min", rating: 4.8, reviews: 1500,
  },
  // Plumbing
  {
    id: "plumb-1", name: "Water Tap & Pipe Leakage Repair", category: "Plumbing",
    description: "Fix leaking valves, faucet replacement, gasket tightening.",
    price: 249, oldPrice: 349, duration: "30 min", rating: 4.8, reviews: 1900,
  },
  {
    id: "plumb-2", name: "Bathroom Fitting & Installation", category: "Plumbing",
    description: "Commode, shower, geyser, washbasin fitting by certified plumbers.",
    price: 599, oldPrice: 799, duration: "60 min", rating: 4.7, reviews: 740,
  },
  // Wellness
  {
    id: "well-1", name: "Deep Tissue Back & Neck Relief", category: "Wellness",
    description: "Therapeutic massage focusing on acupressure and spine tension release.",
    price: 1199, oldPrice: 1499, duration: "60 min", rating: 4.9, reviews: 950, popular: true,
  },
  {
    id: "well-2", name: "Full Body Swedish Massage", category: "Wellness",
    description: "Relaxing full-body massage with aromatherapy oils at your home.",
    price: 1299, oldPrice: 1599, duration: "90 min", rating: 4.9, reviews: 780,
  },
]
