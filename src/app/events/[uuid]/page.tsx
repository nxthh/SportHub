import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DetailPage } from "@/components/ui/DetailPage";
import { ErrorState } from "@/components/ui/ErrorState";
import { ApiError } from "@/services/api/client";
import { eventsApi } from "@/services/api/events";
import { createPageMetadata } from "@/lib/seo";

interface EventDetailsPageProps {
  params: Promise<{ uuid: string }>;
}

export async function generateMetadata({
  params,
}: EventDetailsPageProps): Promise<Metadata> {
  const { uuid } = await params;

  try {
    const event = await eventsApi.getEventByUuid(uuid);
    return createPageMetadata({
      title: event.name,
      description: event.description || `Explore ${event.name} on SportsHub.`,
      path: `/events/${encodeURIComponent(event.uuid)}`,
      image: event.imageUrls?.find((image) => image.trim()),
      type: "article",
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    return createPageMetadata({
      title: "Event Details",
      description: "Explore sports events and competitions on SportsHub.",
      path: `/events/${encodeURIComponent(uuid)}`,
    });
  }
}

export default async function EventDetailsPage({ params }: EventDetailsPageProps) {
  const { uuid } = await params;
  let event;

  try {
    event = await eventsApi.getEventByUuid(uuid);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-20 dark:bg-[#090d16]">
        <ErrorState title="Failed to load event" message="We could not load this event. Please try again later." />
      </div>
    );
  }

  const createdAt = event.createdAt
    ? new Date(event.createdAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Date to be announced";

  return (
    <DetailPage
      title={event.name}
      description={event.description}
      imageUrl={event.imageUrls?.[0]}
      badge={event.category?.name || "Event"}
      backHref="/events"
      backLabel="Back to events"
      favoriteType="event"
      favoriteUuid={event.uuid}
      commentEntityType="event"
      commentEntityUuid={event.uuid}
      metadata={[
        { label: "Date", value: createdAt },
        { label: "Location", value: event.locationName || "Location to be announced" },
      ]}
    />
  );
}
