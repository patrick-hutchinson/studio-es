import { getLandingPage } from "@/lib/sanity/fetch";
import LandingPage from "./LandingPage";

export const dynamic = "force-dynamic";

export default async function Page() {
  const [data] = await Promise.all([getLandingPage()]);

  return <LandingPage data={data} />;
}
