"use client"

import { CATEGORIES } from "./services-data"

type CategoryFilterProps = {
  selectedCategory: string
  onCategoryChange: (cat: string) => void
}

export function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
  return (
    <div className="mt-6 flex flex-wrap gap-2">
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          type="button"
          onClick={() => onCategoryChange(cat)}
          className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${
            selectedCategory === cat
              ? "bg-primary text-primary-foreground shadow-sm"
              : "border border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  )
}
