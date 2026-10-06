import React from "react";
import { getAllSports } from "@/server/sports";
import { getAllEvents } from "@/server/events";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { ErrorState } from "@/components/ui/ErrorState";
import { FavoritesView } from "@/components/favorites/FavoritesView";
import { Sport } from "@/types/sport";
import { Event } from "@/types/event";
import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = createPageMetadata({
  title: "Favorites",
  description: "View your saved sports and events on SportsHub.",
  path: "/favorites",
  noIndex: true,
});

export default async function FavoritesPage() {
  let error: string | null = null;
  let sports: Sport[] = [];
  let events: Event[] = [];

  try {
    const [allSports, allEvents] = await Promise.all([
      getAllSports().catch(() => []),
      getAllEvents().catch(() => []),
    ]);
    sports = Array.isArray(allSports) ? allSports : [];
    events = Array.isArray(allEvents) ? allEvents : [];
  } catch (err) {
    error = err instanceof Error ? err.message : "Unable to load directory.";
  }

  return (
    <div className="py-12 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionTitle
        badge="SAVED ITEMS"
        title="Your Favorites"
        subtitle="Manage and explore your personal saved sports and live events."
      />

      {error ? (
        <ErrorState
          title="Error Loading Directory"
          message={error}
        />
      ) : (
        <FavoritesView initialSports={sports} initialEvents={events} />
      )}
    </div>
  );
}
