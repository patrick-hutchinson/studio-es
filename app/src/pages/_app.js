import Head from "next/head";
import { motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";

import { useRouter } from "next/router";

import { DeviceProvider } from "@/context/DeviceContext";
import { ViewportProvider } from "@/context/ViewportContext";
import LenisProvider from "@/context/LenisContext";

import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import SpacingDebugOverlay from "@/components/SpacingDebugOverlay/SpacingDebugOverlay";

import RenderSVG from "@/components/RenderSVG/RenderSVG";

import "@/styles/globals.scss";
import "@/styles/spacing.scss";
import "@/styles/fonts.scss";

const paneTransition = { duration: 0.8, ease: [0.76, 0, 0.24, 1] };
const defaultSite = { title: "Studio Es" };
const ROUTE_SETTLE_TIMEOUT = 1200;

let cachedSite;
let siteRequest;

const getTransitionText = (destination) => {
  const pathname = new URL(destination ?? "/studio", "http://localhost").pathname;

  if (pathname === "/id") return "Id";
  if (pathname === "/studio") return "Es";

  const projectCode = pathname.match(/^\/projects\/([^/]+)$/)?.[1];

  return projectCode ? decodeURIComponent(projectCode).toUpperCase() : "Es";
};

const nextPaint = () => new Promise((resolve) => window.requestAnimationFrame(resolve));

const waitForScaleText = () =>
  new Promise((resolve) => {
    const page = document.querySelector(".pageTransition");

    if (!page || page.querySelector("[data-ready]")) {
      resolve();
      return;
    }

    let settled = false;
    const finish = () => {
      if (settled) return;

      settled = true;
      observer.disconnect();
      window.clearTimeout(timeout);
      resolve();
    };
    const observer = new MutationObserver(() => {
      if (page.querySelector("[data-ready]")) {
        finish();
      }
    });
    const timeout = window.setTimeout(finish, ROUTE_SETTLE_TIMEOUT);

    observer.observe(page, {
      attributes: true,
      attributeFilter: ["data-ready"],
      childList: true,
      subtree: true,
    });
  });

const waitForIncomingRoutePaint = async () => {
  await waitForScaleText();
  await document.fonts?.ready;

  // Paint once for the measured route and once for the browser to composite it.
  await nextPaint();
  await nextPaint();
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
  const [destination, setDestination] = useState(null);
  const [pendingDestination, setPendingDestination] = useState(null);
  const [preparedDestination, setPreparedDestination] = useState(null);
  const transitionText = getTransitionText(preparedDestination ?? destination);

  const beginPaneSwipe = useCallback(() => {
    if (!preparedDestination || destination) return;

    setDestination(preparedDestination);
  }, [destination, preparedDestination]);

  const completePaneSwipe = useCallback(async () => {
    if (!destination) return;

    try {
      await router.push(destination);
      await waitForIncomingRoutePaint();
    } finally {
      // Keep the pane in place until the destination has measured and painted.
      setDestination(null);
      setPreparedDestination(null);
    }
  }, [destination, router]);

  useEffect(() => {
    const handleDocumentClick = (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const link = event.target instanceof Element ? event.target.closest("a[href]") : null;

      if (!link || link.dataset.noPageTransition !== undefined || link.hasAttribute("download")) return;
      if (link.target && link.target !== "_self") return;

      const nextUrl = new URL(link.href, window.location.href);
      const currentUrl = new URL(window.location.href);
      const isSamePageHash =
        nextUrl.pathname === currentUrl.pathname && nextUrl.search === currentUrl.search && nextUrl.hash.length > 0;

      if (nextUrl.origin !== currentUrl.origin || isSamePageHash || nextUrl.href === currentUrl.href) return;

      event.preventDefault();
      event.stopPropagation();

      if (!destination && !pendingDestination && !preparedDestination) {
        const href = `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`;

        setPendingDestination(href);
        router
          .prefetch(href)
          .catch(() => {
            // Navigation remains available if a prefetch request fails.
          })
          .finally(() => {
            setPendingDestination(null);
            setPreparedDestination(href);
          });
      }
    };

    document.addEventListener("click", handleDocumentClick, true);

    return () => document.removeEventListener("click", handleDocumentClick, true);
  }, [destination, pendingDestination, preparedDestination, router]);

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
            <motion.div
              animate={{ y: destination ? "0%" : "-100%" }}
              className="transitionContainer"
              initial={false}
              onAnimationComplete={completePaneSwipe}
              transition={destination ? paneTransition : { duration: 0 }}
            >
              <motion.div
                animate={destination ? { height: "100%", top: "0%" } : { height: "0%", top: "100%" }}
                className="transitionTextStage"
                initial={false}
                transition={destination ? paneTransition : { duration: 0 }}
              >
                <RenderSVG text={transitionText} letterSpacing={-60} onReady={beginPaneSwipe} />
              </motion.div>
            </motion.div>
            <motion.div
              animate={{ y: destination ? "100vh" : "0vh" }}
              className="content"
              initial={false}
              transition={destination ? paneTransition : { duration: 0 }}
            >
              <Header site={site} />
              <SpacingDebugOverlay />
              <div className="pageTransitionStack">
                <div className="pageTransition" key={router.asPath}>
                  <div className="pageTransitionRoot">
                    <Component {...pageProps} site={site} />
                  </div>
                  <Footer page={page} site={site} />
                </div>
              </div>
            </motion.div>
          </LenisProvider>
        </DeviceProvider>
      </ViewportProvider>
    </>
  );
}
