import HomePageContent from "@/components/HomePageContent";
import { getAdditives } from "@/lib/additives";

export default function HomePage() {
  const additives = getAdditives();
  return <HomePageContent additives={additives} />;
}
