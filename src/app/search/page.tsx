import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { sportsApi } from "@/services/api/sports";
import { eventsApi } from "@/services/api/events";
import { categoriesApi } from "@/services/api/categories";
import { SportCard } from "@/components/cards/SportCard";
import { EventCard } from "@/components/cards/EventCard";
import { CategoryCard } from "@/components/cards/CategoryCard";
import {
  Search,
  Trophy,
  Calendar,
  FolderTree,
  FileText,
  ArrowRight,
  MapPin,
  Mail,
  Phone,
} from "lucide-react";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { EmptyState } from "@/components/ui/EmptyState";
import { createPageMetadata, getSeoSearchQuery } from "@/lib/seo";

interface SearchPageProps {
  searchParams?: Promise<{ q?: string }>;
}

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const resolvedParams = await searchParams;
  const query = getSeoSearchQuery(resolvedParams?.q);
  return createPageMetadata({
    title: query ? `Search results for "${query}"` : "Search SportsHub",
    description: query
      ? `Search results for "${query}" across sports, events, and categories on SportsHub.`
      : "Search across all sports, events, categories, and information on SportsHub.",
    path: "/search",
    noIndex: true,
  });
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedParams = await searchParams;
  const rawQuery = resolvedParams?.q || "";
  const query = rawQuery.trim().toLowerCase();

  // Fetch all resources in parallel
  const [sportsData, eventsData, categoriesData] = await Promise.allSettled([
    sportsApi.getSports(),
    eventsApi.getEvents(),
    categoriesApi.getCategories(),
  ]);

  const allSports =
    sportsData.status === "fulfilled" && Array.isArray(sportsData.value) ? sportsData.value : [];
  const allEvents =
    eventsData.status === "fulfilled" && Array.isArray(eventsData.value) ? eventsData.value : [];
  const allCategories =
    categoriesData.status === "fulfilled" && Array.isArray(categoriesData.value)
      ? categoriesData.value
      : [];

  // Filter Sports
  const matchingSports = query
    ? allSports.filter(
        (s) =>
          s.name?.toLowerCase().includes(query) ||
          s.description?.toLowerCase().includes(query) ||
          s.category?.name?.toLowerCase().includes(query)
      )
    : [];

  // Filter Events
  const matchingEvents = query
    ? allEvents.filter(
        (e) =>
          e.name?.toLowerCase().includes(query) ||
          e.description?.toLowerCase().includes(query) ||
          e.category?.name?.toLowerCase().includes(query) ||
          e.locationName?.toLowerCase().includes(query)
      )
    : [];

  // Filter Categories
  const matchingCategories = query
    ? allCategories.filter(
        (c) =>
          c.name?.toLowerCase().includes(query) ||
          c.description?.toLowerCase().includes(query)
      )
    : [];

  // Static site pages & section keywords
  const sitePages = [
    {
      title: "Contact & Footer Information",
      href: "/about#team",
      badge: "Footer / Contact",
      icon: MapPin,
      description:
        "SportsHub official office in Toul Kork, Phnom Penh. Contact us at sport@gmail.com or +855 987654321.",
      keywords: ["footer", "contact", "email", "phone", "location", "toul kork", "phnom penh", "address", "help"],
    },
    {
      title: "About Us & Team Roster",
      href: "/about",
      badge: "Platform Info",
      icon: FileText,
      description:
        "Meet the engineers, mentor Srorng Sokcheat, and the academic story behind SportsHub at ISTAD.",
      keywords: ["about", "team", "mentor", "istad", "engineer", "reaksmey", "chanreaksmey", "chhom", "sokcheat", "mary", "nuth", "kimleang", "sombath"],
    },
    {
      title: "All Sports Directory",
      href: "/sports",
      badge: "Main Directory",
      icon: Trophy,
      description:
        "Explore all Cambodian and international sporting disciplines covered live on SportsHub.",
      keywords: ["sports", "disciplines", "football", "kun khmer", "cycling", "swimming", "boxing", "all sports"],
    },
    {
      title: "Tournaments & Events",
      href: "/events",
      badge: "Calendar",
      icon: Calendar,
      description:
        "Find upcoming live matches, tournament schedules, fixtures, and stadium venues nationwide.",
      keywords: ["events", "tournaments", "matches", "fixtures", "stadiums", "schedule", "calendar"],
    },
    {
      title: "Sport Categories",
      href: "/categories",
      badge: "Categories",
      icon: FolderTree,
      description:
        "Browse categorized collections of athletic disciplines, ball sports, and martial arts.",
      keywords: ["categories", "category", "martial arts", "athletics", "football category"],
    },
    {
      title: "My Saved Favorites",
      href: "/favorites",
      badge: "Personal",
      icon: Trophy,
      description:
        "Quick access to your bookmarked sports and upcoming tournaments.",
      keywords: ["favorites", "saved", "bookmarks", "heart", "favorite"],
    },
  ];

  const matchingPages = query
    ? sitePages.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.keywords.some((k) => k.includes(query) || query.includes(k))
      )
    : [];

  const totalResults =
    matchingSports.length + matchingEvents.length + matchingCategories.length + matchingPages.length;

  return (
    <div className="py-10 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Header with Search Input */}
      <div className="max-w-2xl mx-auto text-center space-y-4">
        <SectionTitle
          badge="SEARCH RESULTS"
          title={query ? `Results for "${rawQuery}"` : "Search SportsHub"}
          subtitle={
            query
              ? `Found ${totalResults} matching result${totalResults === 1 ? "" : "s"} across the platform.`
              : "Search across all sports, events, categories, and platform pages."
          }
        />

        {/* Refined Search Form */}
        <form
          action="/search"
          method="GET"
          className="flex items-center rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 focus-within:border-emerald-500 shadow-sm p-1.5 transition-colors max-w-xl mx-auto"
        >
          <Search className="w-5 h-5 text-emerald-500 ml-3 shrink-0" />
          <input
            type="text"
            name="q"
            defaultValue={rawQuery}
            placeholder="Search sports, events, footer, team..."
            className="w-full bg-transparent px-3 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none"
          />
          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
          >
            Search
          </button>
        </form>
      </div>

      {!query ? (
        <EmptyState
          title="Start searching"
          message="Enter a search term above to find sports, tournaments, venues, or platform information."
        />
      ) : totalResults === 0 ? (
        <EmptyState
          title={`No results found for "${rawQuery}"`}
          message="Try searching for a different keyword like 'football', 'kun khmer', 'cycling', 'events', or 'footer'."
          actionHref="/sports"
          actionLabel="Browse All Sports"
        />
      ) : (
        <div className="space-y-14">
          {/* 1. SITE PAGES & SECTIONS (e.g. Footer, About Us, Contact) */}
          {matchingPages.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-zinc-800">
                <FileText className="w-5 h-5 text-emerald-500" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Platform Sections & Pages ({matchingPages.length})
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {matchingPages.map((page) => {
                  const Icon = page.icon;
                  return (
                    <Link
                      key={page.title}
                      href={page.href}
                      className="group p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 hover:border-emerald-500/50 shadow-sm transition-all hover:-translate-y-1 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20">
                            {page.badge}
                          </span>
                          <Icon className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                        </div>
                        <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                          {page.title}
                        </h4>
                        <p className="mt-1.5 text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                          {page.description}
                        </p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                        <span>Go to {page.badge}</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {/* 2. MATCHING SPORTS */}
          {matchingSports.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-zinc-800">
                <Trophy className="w-5 h-5 text-emerald-500" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Sports ({matchingSports.length})
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {matchingSports.map((sport) => (
                  <SportCard key={sport.uuid || sport.id} sport={sport} />
                ))}
              </div>
            </section>
          )}

          {/* 3. MATCHING EVENTS */}
          {matchingEvents.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-zinc-800">
                <Calendar className="w-5 h-5 text-emerald-500" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Events ({matchingEvents.length})
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {matchingEvents.map((event) => (
                  <EventCard key={event.uuid || event.id} event={event} />
                ))}
              </div>
            </section>
          )}

          {/* 4. MATCHING CATEGORIES */}
          {matchingCategories.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-zinc-800">
                <FolderTree className="w-5 h-5 text-emerald-500" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Categories ({matchingCategories.length})
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {matchingCategories.map((category) => (
                  <CategoryCard key={category.uuid || category.id} category={category} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
