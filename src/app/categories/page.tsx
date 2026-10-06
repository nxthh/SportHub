import React from "react";
import type { Metadata } from "next";
import { getAllCategories } from "@/server/categories";
import { CategoryCard } from "@/components/cards/CategoryCard";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { SportCategory } from "@/types/category";
import { createPageMetadata, getSeoSearchQuery } from "@/lib/seo";

interface CategoriesPageProps {
  searchParams?: Promise<{ search?: string; q?: string }>;
}

export async function generateMetadata({
  searchParams,
}: CategoriesPageProps): Promise<Metadata> {
  const resolvedParams = await searchParams;
  const query = getSeoSearchQuery(resolvedParams?.search, resolvedParams?.q);
  return createPageMetadata({
    title: query ? `Categories matching "${query}"` : "Categories",
    description: query
      ? `Browse sports categories matching "${query}" on SportsHub.`
      : "Browse sports organized by disciplines, from ball sports and water activities to combat arts and motorsports.",
    path: "/categories",
  });
}

export default async function CategoriesPage({ searchParams }: CategoriesPageProps) {
  const resolvedParams = await searchParams;
  const searchQuery = (resolvedParams?.search || resolvedParams?.q || "").trim().toLowerCase();

  let categories: SportCategory[] = [];
  let error: string | null = null;

  try {
    const data = await getAllCategories();
    const allCategories = Array.isArray(data) ? data : [];
    categories = searchQuery
      ? allCategories.filter(
          (c) =>
            c.name?.toLowerCase().includes(searchQuery) ||
            c.description?.toLowerCase().includes(searchQuery)
        )
      : allCategories;
  } catch (err) {
    error = err instanceof Error ? err.message : "Unable to load sport categories from API.";
  }

  return (
    <div className="py-12 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionTitle
        badge="ALL CATEGORIES"
        title="Sport Categories"
        subtitle="Discover sports grouped by discipline, from team tournaments and athletics to aquatic competitions."
      />

      {error ? (
        <ErrorState
          title="Error Loading Categories"
          message={error}
        />
      ) : categories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <CategoryCard key={category.uuid || category.id} category={category} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No Categories Found"
          message={
            searchQuery
              ? `No sport categories matching "${searchQuery}". Try searching for something else.`
              : "There are currently no sport categories available from the backend API."
          }
        />
      )}
    </div>
  );
}
