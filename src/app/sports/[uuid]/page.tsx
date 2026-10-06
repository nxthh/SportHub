import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DetailPage } from "@/components/ui/DetailPage";
import { ErrorState } from "@/components/ui/ErrorState";
import { getSportByUuid } from "@/server/sports";
import { createPageMetadata } from "@/lib/seo";

interface SportDetailsPageProps {
  params: Promise<{ uuid: string }>;
}

export async function generateMetadata({ params }: SportDetailsPageProps): Promise<Metadata> {
  const { uuid } = await params;
  try {
    const sport = await getSportByUuid(uuid);
    return createPageMetadata({
      title: sport.name,
      description: sport.description || `Discover ${sport.name} on SportsHub.`,
      path: `/sports/${encodeURIComponent(sport.uuid)}`,
      image: sport.imageUrls?.find((image) => image.trim()),
      type: "article",
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("404")) notFound();
    return createPageMetadata({
      title: "Sport Details",
      description: "Discover sports and disciplines on SportsHub.",
      path: `/sports/${encodeURIComponent(uuid)}`,
    });
  }
}

export default async function SportDetailsPage({ params }: SportDetailsPageProps) {
  const { uuid } = await params;
  let sport;

  try {
    sport = await getSportByUuid(uuid);
  } catch (error) {
    if (error instanceof Error && error.message.includes("404")) notFound();
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-20 dark:bg-[#090d16]">
        <ErrorState title="Failed to load sport" message="We could not load this sport. Please try again later." />
      </div>
    );
  }

  return (
    <DetailPage
      title={sport.name}
      description={sport.description}
      imageUrl={sport.imageUrls?.[0]}
      badge={sport.category?.name || "Sport"}
      backHref="/sports"
      backLabel="Back to sports"
      favoriteType="sport"
      favoriteUuid={sport.uuid}
      commentEntityType="sport"
      commentEntityUuid={sport.uuid}
      metadata={[{ label: "Category", value: sport.category?.name || "General" }]}
    />
  );
}
