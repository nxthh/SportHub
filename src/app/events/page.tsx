import React from "react";
import type { Metadata } from "next";
import { getAllEvents } from "@/server/events";
import { EventCard } from "@/components/cards/EventCard";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { Event } from "@/types/event";
import { createPageMetadata, getSeoSearchQuery } from "@/lib/seo";

interface EventsPageProps {
  searchParams?: Promise<{ search?: string; q?: string }>;
}

export async function generateMetadata({
  searchParams,
}: EventsPageProps): Promise<Metadata> {
  const resolvedParams = await searchParams;
  const query = getSeoSearchQuery(resolvedParams?.search, resolvedParams?.q);
  return createPageMetadata({
    title: query ? `Events matching "${query}"` : "Events",
    description: query
      ? `Explore sports events matching "${query}" on SportsHub.`
      : "Explore live matches, competitive tournaments, and athletic events across all sports disciplines.",
    path: "/events",
  });
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const resolvedParams = await searchParams;
  const searchQuery = (resolvedParams?.search || resolvedParams?.q || "").trim().toLowerCase();

  let events: Event[] = [];
  let error: string | null = null;

  try {
    const data = await getAllEvents();
    const allEvents = Array.isArray(data) ? data : [];
    events = searchQuery
      ? allEvents.filter(
          (e) =>
            e.name?.toLowerCase().includes(searchQuery) ||
            e.description?.toLowerCase().includes(searchQuery) ||
            e.category?.name?.toLowerCase().includes(searchQuery)
        )
      : allEvents;
  } catch (err) {
    error = err instanceof Error ? err.message : "Unable to load events from API.";
  }

  return (
    <div className="py-12 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionTitle
        badge="ALL EVENTS"
        title="Live & Upcoming Events"
        subtitle="Explore upcoming tournaments, championships, and athletic matchups from leagues across the country."
      />

      {error ? (
        <ErrorState
          title="Error Loading Events"
          message={error}
        />
      ) : events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard key={event.uuid || event.id} event={event} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No Events Found"
          message={
            searchQuery
              ? `No events matching "${searchQuery}". Try searching for something else.`
              : "There are currently no events available from the backend API."
          }
        />
      )}
    </div>
  );
}
