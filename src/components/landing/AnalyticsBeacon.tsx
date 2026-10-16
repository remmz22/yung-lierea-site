"use client";

import { useEffect } from "react";

// GDPR: yalnızca "accepted" izni varsa tek seferlik sayfa görüntüleme gönderir
export default function AnalyticsBeacon() {
  useEffect(() => {
    if (localStorage.getItem("lierea-consent") !== "accepted") return;
    if (sessionStorage.getItem("lierea-pv")) return;
    sessionStorage.setItem("lierea-pv", "1");
    const payload = JSON.stringify({
      path: window.location.pathname,
      referrer: document.referrer || null,
    });
    try {
      navigator.sendBeacon?.("/api/analytics", payload);
    } catch {
      fetch("/api/analytics", {
        method: "POST",
        body: payload,
        headers: { "Content-Type": "application/json" },
        keepalive: true,
      }).catch(() => {});
    }
  }, []);

  return null;
}
