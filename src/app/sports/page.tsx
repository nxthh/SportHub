import React from "react";
import { getAllSports } from "@/server/sports";
import { SportCard } from "@/components/cards/SportCard";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { Sport } from "@/types/sport";
import type { Metadata } from "next";
import { createPageMetadata, getSeoSearchQuery } from "@/lib/seo";

interface SportsPageProps {
  searchParams?: Promise<{ search?: string; q?: string }>;
}

export async function generateMetadata({
  searchParams,
}: SportsPageProps): Promise<Metadata> {
  const resolvedParams = await searchParams;
  const query = getSeoSearchQuery(resolvedParams?.search, resolvedParams?.q);
  return createPageMetadata({
    title: query ? `Sports matching "${query}"` : "Sports",
    description: query
      ? `Browse sports disciplines matching "${query}" on SportsHub.`
      : "Browse sports disciplines and discover athletes, competitions, and sports information on SportsHub.",
    path: "/sports",
  });
}

export default async function SportsPage({ searchParams }: SportsPageProps) {
  const resolvedParams = await searchParams;
  const searchQuery = (resolvedParams?.search || resolvedParams?.q || "").trim().toLowerCase();

  let sports: Sport[] = [];
  let error: string | null = null;

  try {
    const data = await getAllSports();
    const allSports = Array.isArray(data) ? data : [];
    sports = searchQuery
      ? allSports.filter(
          (s) =>
            s.name?.toLowerCase().includes(searchQuery) ||
            s.description?.toLowerCase().includes(searchQuery) ||
            s.category?.name?.toLowerCase().includes(searchQuery)
        )
      : allSports;
  } catch (err) {
    error = err instanceof Error ? err.message : "Unable to load sports from API.";
  }

  return (
    <div className="py-12 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionTitle
        badge="ALL SPORTS"
        title="Sports Directory"
        subtitle="Browse all sports disciplines and coverage provided directly by the backend API."
      />

      {error ? (
        <ErrorState
          title="Error Loading Sports"
          message={error}
        />
      ) : sports.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sports.map((sport) => (
            <SportCard key={sport.uuid || sport.id} sport={sport} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No Sports Found"
          message="There are currently no sports available from the backend API."
        />
      )}
    </div>
  );
}
