import Head from "next/head";
import { motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

import { useRouter } from "next/router";

import { DeviceProvider } from "@/context/DeviceContext";
import { ViewportProvider } from "@/context/ViewportContext";
import LenisProvider from "@/context/LenisContext";

import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import SpacingDebugOverlay from "@/components/SpacingDebugOverlay/SpacingDebugOverlay";

import RenderSVG from "@/components/RenderSVG/RenderSVG";
import { DEFAULT_COLOR_PAIR, getRandomColorPair } from "@/lib/getRandomColorPair";

import "@/styles/globals.scss";
import "@/styles/spacing.scss";
import "@/styles/fonts.scss";

const paneTransition = { duration: 0.8, ease: [0.76, 0, 0.24, 1] };
const defaultSite = { title: "Studio Es" };

let cachedSite;
let cachedAppearances = [];
let siteRequest;

const getTransitionText = (destination) => {
  const pathname = new URL(destination ?? "/studio", "http://localhost").pathname;

  if (pathname === "/id") return "Id";
  if (pathname === "/studio") return "Es";

  const projectCode = pathname.match(/^\/projects\/([^/]+)$/)?.[1];

  return projectCode ? decodeURIComponent(projectCode).toUpperCase() : "Es";
};

const nextPaint = () => new Promise((resolve) => window.requestAnimationFrame(resolve));

const waitForIncomingRoutePaint = async () => {
  await document.fonts?.ready;

  // Commit once for the route and once for the browser to composite it.
  await nextPaint();
  await nextPaint();
};

const loadSite = async () => {
  if (cachedSite) return { appearances: cachedAppearances, site: cachedSite };

  if (!siteRequest) {
    siteRequest = fetch("/api/site")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load site data.");
        }

        return response.json();
      })
      .then((data) => {
        cachedSite = data.site;
        cachedAppearances = data.appearances ?? [];

        return { appearances: cachedAppearances, site: cachedSite };
      });
  }

  return siteRequest;
};

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const page = pageProps?.page ?? {};
  const [site, setSite] = useState(cachedSite ?? defaultSite);
  const [selectionColors, setSelectionColors] = useState(DEFAULT_COLOR_PAIR);
  const [destination, setDestination] = useState(null);
  const [pendingDestination, setPendingDestination] = useState(null);
  const [preparedDestination, setPreparedDestination] = useState(null);
  const [transitionPhase, setTransitionPhase] = useState("idle");
  const [transitionScrollY, setTransitionScrollY] = useState(0);
  const nativeExitLockRef = useRef(null);
  const transitionText = getTransitionText(preparedDestination ?? destination);
  const isPaneCovering = transitionPhase === "entering" || transitionPhase === "covering";
  const transitionAnimation = transitionPhase === "idle" ? { duration: 0 } : paneTransition;

  const lockNativeExitScroll = useCallback(() => {
    if (router.pathname !== "/projects/[slug]" || nativeExitLockRef.current) return;

    const root = document.documentElement;
    const body = document.body;
    const scrollY = window.scrollY;

    nativeExitLockRef.current = {
      bodyOverflow: body.style.overflow,
      rootOverflow: root.style.overflow,
      rootScrollBehavior: root.style.scrollBehavior,
      rootScrollSnapType: root.style.scrollSnapType,
    };
    // Cancel the slug page's native entry scroll before moving its visual layer.
    root.style.scrollBehavior = "auto";
    root.style.scrollSnapType = "none";
    root.style.overflow = "hidden";
    body.style.overflow = "hidden";
    window.scrollTo({ top: scrollY, behavior: "auto" });
  }, [router.pathname]);

  const releaseNativeExitScroll = useCallback(() => {
    const lock = nativeExitLockRef.current;

    if (!lock) return;

    const root = document.documentElement;
    const body = document.body;

    root.style.overflow = lock.rootOverflow;
    root.style.scrollBehavior = lock.rootScrollBehavior;
    root.style.scrollSnapType = lock.rootScrollSnapType;
    body.style.overflow = lock.bodyOverflow;
    nativeExitLockRef.current = null;
  }, []);

  const beginPaneSwipe = useCallback(() => {
    if (!preparedDestination || transitionPhase !== "idle") return;

    // A transformed ancestor changes pinned media from viewport-fixed to document-relative.
    setTransitionScrollY(window.scrollY);
    setDestination(preparedDestination);
    setTransitionPhase("entering");
  }, [preparedDestination, transitionPhase]);

  const handlePaneAnimationComplete = useCallback(async () => {
    if (transitionPhase === "leaving") {
      releaseNativeExitScroll();
      setDestination(null);
      setPreparedDestination(null);
      setTransitionPhase("idle");
      return;
    }

    if (transitionPhase !== "entering" || !destination) return;

    setTransitionPhase("covering");
    try {
      await router.push(destination);
      await waitForIncomingRoutePaint();
    } finally {
      // Reveal the mounted route by reversing the same shared pane motion.
      setTransitionPhase("leaving");
    }
  }, [destination, releaseNativeExitScroll, router, transitionPhase]);

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
      const isStudioContactScroll =
        router.pathname === "/studio" && nextUrl.pathname === "/studio" && nextUrl.searchParams.get("contact") === "1";

      if (nextUrl.origin !== currentUrl.origin || isSamePageHash || isStudioContactScroll || nextUrl.href === currentUrl.href) return;

      event.preventDefault();
      event.stopPropagation();

      if (transitionPhase === "idle" && !pendingDestination && !preparedDestination) {
        const href = `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`;

        lockNativeExitScroll();
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
  }, [lockNativeExitScroll, pendingDestination, preparedDestination, router, transitionPhase]);

  useEffect(() => releaseNativeExitScroll, [releaseNativeExitScroll]);

  useEffect(() => {
    let isMounted = true;

    loadSite()
      .then(({ appearances, site: nextSite }) => {
        if (isMounted) {
          setSite(nextSite ?? defaultSite);
          setSelectionColors(getRandomColorPair(appearances));
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

  useEffect(() => {
    const root = document.documentElement;

    root.style.setProperty("--selection-background", selectionColors.background);
    root.style.setProperty("--selection-foreground", selectionColors.foreground);
  }, [selectionColors]);

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
              animate={{ y: isPaneCovering ? "0%" : "-100%" }}
              className="transitionContainer"
              initial={false}
              onAnimationComplete={handlePaneAnimationComplete}
              transition={transitionAnimation}
            >
              <motion.div
                animate={isPaneCovering ? { height: "100%", top: "0%" } : { height: "0%", top: "100%" }}
                className="transitionTextStage"
                initial={false}
                transition={transitionAnimation}
              >
                <RenderSVG text={transitionText} letterSpacing={-60} onReady={beginPaneSwipe} />
              </motion.div>
            </motion.div>
            <motion.div
              animate={{ y: isPaneCovering ? "100vh" : "0vh" }}
              className="content"
              data-page-transition-covering={isPaneCovering ? "" : undefined}
              initial={false}
              style={isPaneCovering ? { "--page-transition-scroll-y": `${transitionScrollY}px` } : undefined}
              transition={transitionAnimation}
            >
              <Header projectId={router.pathname === "/projects/[slug]" ? pageProps?.project?.slug?.toUpperCase() : undefined} site={site} />
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
