import type { Metadata } from "next";

const DEFAULT_SITE_URL = "https://sport-hub-teal.vercel.app";

export function getSiteUrl(): URL {
  const configuredUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : DEFAULT_SITE_URL);

  return new URL(configuredUrl);
}

interface PageMetadataOptions {
  title: string;
  description: string;
  path: string;
  image?: string;
  noIndex?: boolean;
  type?: "website" | "article";
}

export function getSeoSearchQuery(...queries: (string | undefined)[]): string {
  const query = queries.find((value) => value?.trim())?.trim().replace(/\s+/g, " ");
  if (!query) return "";
  return query.length > 60 ? `${query.slice(0, 57).trimEnd()}...` : query;
}

function getSeoDescription(description: string): string {
  const cleanDescription = description.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  if (cleanDescription.length <= 160) return cleanDescription;
  return `${cleanDescription.slice(0, 157).trimEnd()}...`;
}

export function createPageMetadata({
  title,
  description,
  path,
  image = "/thumbnail.png",
  noIndex = false,
  type = "website",
}: PageMetadataOptions): Metadata {
  const seoDescription =
    getSeoDescription(description) ||
    "Discover sports, events, and competitions with SportsHub.";
  const socialTitle = `${title} | SportsHub`;
  const socialImage = image.trim() || "/thumbnail.png";

  return {
    title,
    description: seoDescription,
    alternates: { canonical: path },
    openGraph: {
      title: socialTitle,
      description: seoDescription,
      url: path,
      type,
      images: [{ url: socialImage, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description: seoDescription,
      images: [socialImage],
    },
    ...(noIndex ? { robots: { index: false, follow: true } } : {}),
  };
}
