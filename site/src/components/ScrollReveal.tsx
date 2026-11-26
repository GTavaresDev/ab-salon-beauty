"use client";

import { useEffect } from "react";

const REVEAL_SELECTOR = "[data-reveal], [data-reveal-image]";

function parseTimeList(value: string): number {
  return value
    .split(",")
    .map((time) => time.trim())
    .reduce((max, time) => {
      const numeric = Number.parseFloat(time);

      if (Number.isNaN(numeric)) {
        return max;
      }

      const milliseconds = time.endsWith("ms") ? numeric : numeric * 1000;
      return Math.max(max, milliseconds);
    }, 0);
}

function clearRevealState(element: Element) {
  element.classList.remove("is-revealed");
  element.removeAttribute("data-reveal");
  element.removeAttribute("data-reveal-image");

  if (element instanceof HTMLElement) {
    element.style.removeProperty("--reveal-delay");
  }
}

function revealElement(element: Element) {
  element.classList.add("is-revealed");

  window.setTimeout(() => {
    const computedStyle = window.getComputedStyle(element);
    const duration = parseTimeList(computedStyle.transitionDuration);
    const delay = parseTimeList(computedStyle.transitionDelay);

    window.setTimeout(() => clearRevealState(element), duration + delay + 80);
  }, 0);
}

export function ScrollReveal() {
  useEffect(() => {
    const elements = Array.from(document.querySelectorAll(REVEAL_SELECTOR));
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reducedMotion || !("IntersectionObserver" in window)) {
      elements.forEach(clearRevealState);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          revealElement(entry.target);
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.15,
      },
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  return null;
}
