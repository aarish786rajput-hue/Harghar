"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
} from "react"

type SearchContextValue = {
  searchQuery: string
  setSearchQuery: Dispatch<SetStateAction<string>>
  triggerSearch: (query: string) => void
}

const SearchContext = createContext<SearchContextValue | undefined>(undefined)

export function SearchProvider({ children }: { children: ReactNode }) {
  const [searchQuery, setSearchQuery] = useState("")

  const triggerSearch = useCallback((query: string) => {
    setSearchQuery(query)
    // Smooth scroll to services section
    setTimeout(() => {
      document.getElementById("services")?.scrollIntoView({ behavior: "smooth", block: "start" })
    }, 50)
  }, [])

  return (
    <SearchContext.Provider value={{ searchQuery, setSearchQuery, triggerSearch }}>
      {children}
    </SearchContext.Provider>
  )
}

export function useSearch() {
  const context = useContext(SearchContext)
  if (!context) {
    throw new Error("useSearch must be used within a SearchProvider")
  }
  return context
}
