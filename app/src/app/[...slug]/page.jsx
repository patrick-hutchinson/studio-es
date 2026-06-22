import { permanentRedirect } from "next/navigation";

export default function LegacyPageRedirect() {
  permanentRedirect("/");
}
