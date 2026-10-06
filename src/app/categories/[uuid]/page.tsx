import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DetailPage } from "@/components/ui/DetailPage";
import { ErrorState } from "@/components/ui/ErrorState";
import { ApiError } from "@/services/api/client";
import { categoriesApi } from "@/services/api/categories";
import { EventCard } from "@/components/cards/EventCard";
import { Event } from "@/types/event";
import {
  getCategoryCoverImage,
  getCategoryCleanDescription,
} from "@/lib/categoryMeta";
import { createPageMetadata } from "@/lib/seo";

interface CategoryDetailsPageProps {
  params: Promise<{ uuid: string }>;
}

export async function generateMetadata({ params }: CategoryDetailsPageProps): Promise<Metadata> {
  const { uuid } = await params;
  try {
    const category = await categoriesApi.getCategoryByUuid(uuid);
    const description = getCategoryCleanDescription(category);
    return createPageMetadata({
      title: category.name,
      description,
      path: `/categories/${encodeURIComponent(category.uuid)}`,
      image: getCategoryCoverImage(category),
      type: "article",
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    return createPageMetadata({
      title: "Category Details",
      description: "Browse sports organized by discipline on SportsHub.",
      path: `/categories/${encodeURIComponent(uuid)}`,
    });
  }
}

export default async function CategoryDetailsPage({ params }: CategoryDetailsPageProps) {
  const { uuid } = await params;
  let category;

  try {
    category = await categoriesApi.getCategoryByUuid(uuid);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-20 dark:bg-[#090d16]">
        <ErrorState title="Failed to load category" message="We could not load this category. Please try again later." />
      </div>
    );
  }

  const categoryEvents: Event[] = Array.isArray((category as { events?: Event[] }).events)
    ? (category as { events?: Event[] }).events!
    : [];

  const sportsList = Array.isArray(category.sports) ? category.sports : [];
  const sportsCount = sportsList.length > 0 ? sportsList.length : categoryEvents.length;

  const coverImage = getCategoryCoverImage(category);
  const cleanDescription = getCategoryCleanDescription(category);

  return (
    <DetailPage
      title={category.name}
      description={cleanDescription}
      imageUrl={coverImage}
      badge="Category"
      backHref="/categories"
      backLabel="Back to categories"
      commentEntityType="category"
      commentEntityUuid={category.uuid}
      metadata={[
        {
          label: "Events & Disciplines",
          value: `${sportsCount} ${sportsCount === 1 ? "item" : "items"}`,
        },
      ]}
    >
      {categoryEvents.length > 0 && (
        <section className="mt-10 border-t border-slate-200 pt-8 dark:border-zinc-800">
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
            Events in this Category ({categoryEvents.length})
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
            Tournaments, matches, and venues categorized under {category.name}.
          </p>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {categoryEvents.map((evt) => (
              <EventCard key={evt.uuid || evt.id} event={evt} />
            ))}
          </div>
        </section>
      )}
    </DetailPage>
  );
}
