import type { Metadata } from "next";
import { notFound } from "next/navigation";

import AdditiveDetailContent from "@/components/AdditiveDetailContent";
import { getAdditiveBySlug, getAdditiveSlugs } from "@/lib/additives";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAdditiveSlugs().map((slug) => ({ slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const additive = getAdditiveBySlug(slug);

  if (!additive) {
    return {
      title: "Additive not found",
    };
  }

  return {
    title: `${additive.title} – Food additives catalogue`,
    description:
      additive.description?.slice(0, 160) ??
      `Learn more about ${additive.title} (${additive.eNumber}) and how it is used in food products.`,
  };
}

export default async function AdditivePage({ params }: PageProps) {
  const { slug } = await params;
  const additive = getAdditiveBySlug(slug);

  if (!additive) {
    notFound();
  }

  return <AdditiveDetailContent additive={additive} />;
}
