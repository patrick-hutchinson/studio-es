import { getSite } from "@/lib/sanity";

export default async function handler(req, res) {
  try {
    const site = await getSite();

    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
    res.status(200).json({ site });
  } catch (error) {
    console.error("Failed to fetch site data:", error);
    res.status(500).json({ site: null });
  }
}
