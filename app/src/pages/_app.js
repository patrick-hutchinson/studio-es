import Head from "next/head";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

import { useRouter } from "next/router";

import { DeviceProvider } from "@/context/DeviceContext";
import { ViewportProvider } from "@/context/ViewportContext";
import LenisProvider from "@/context/LenisContext";

import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import SpacingDebugOverlay from "@/components/SpacingDebugOverlay/SpacingDebugOverlay";

import "@/styles/globals.scss";
import "@/styles/spacing.scss";
import "@/styles/fonts.scss";

const pageTransition = { duration: 0.5, ease: "easeInOut" };
const defaultSite = { title: "Studio Es" };

let cachedSite;
let siteRequest;

const pageTransitionVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: {
    opacity: 0,
    pointerEvents: "none",
    transition: { ...pageTransition },
  },
};

const loadSite = async () => {
  if (cachedSite) return cachedSite;

  if (!siteRequest) {
    siteRequest = fetch("/api/site")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load site data.");
        }

        return response.json();
      })
      .then(({ site }) => {
        cachedSite = site;

        return site;
      });
  }

  return siteRequest;
};

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const page = pageProps?.page ?? {};
  const [site, setSite] = useState(cachedSite ?? defaultSite);

  useEffect(() => {
    let isMounted = true;

    loadSite()
      .then((nextSite) => {
        if (isMounted) {
          setSite(nextSite ?? defaultSite);
        }
      })
      .catch((error) => {
        siteRequest = null;
        console.error("Failed to fetch site data:", error);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <>
      <Head>
        <title>{site.title ?? defaultSite.title}</title>
        {site.description ? <meta name="description" content={site.description} /> : null}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {site.faviconUrl ? <link rel="icon" href={site.faviconUrl} /> : null}
      </Head>

      <ViewportProvider>
        <DeviceProvider>
          <LenisProvider>
            <Header site={site} />

            <SpacingDebugOverlay />
            <div className="pageTransitionStack">
              <AnimatePresence initial={false} mode="popLayout">
                <motion.div
                  animate="animate"
                  className="pageTransition"
                  exit="exit"
                  initial="initial"
                  key={router.asPath}
                  transition={pageTransition}
                  variants={pageTransitionVariants}
                >
                  <div className="pageTransitionRoot">
                    <Component {...pageProps} site={site} />
                  </div>
                  <Footer page={page} site={site} />
                </motion.div>
              </AnimatePresence>
            </div>
          </LenisProvider>
        </DeviceProvider>
      </ViewportProvider>
    </>
  );
}
