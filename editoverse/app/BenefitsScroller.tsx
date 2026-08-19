"use client";

import { useEffect, useRef, useState } from "react";

const benefits = [
  {
    number: "01",
    audience: "MARKETING AGENCIES",
    title: "Outsource editing without outsourcing control.",
    copy: "Keep strategy and client relationships in-house while EditoVerse handles production. You receive clear tier standards, review rounds and delivery expectations.",
    metric: "NO NEW HIRE",
  },
  {
    number: "02",
    audience: "BUSY CONTENT TEAMS",
    title: "Add capacity exactly when campaigns need it.",
    copy: "Scale editing volume for launches and busy months without carrying full-time overhead during quieter periods. Send one reel or build a repeat workflow.",
    metric: "ON-DEMAND CAPACITY",
  },
  {
    number: "03",
    audience: "BUDGET CONTROL",
    title: "Match production quality to every brief.",
    copy: "Choose Beginner, Advanced, Pro or God Tier based on the content’s value and client budget. Pay for the level of craft the project actually needs.",
    metric: "4 CLEAR TIERS",
  },
  {
    number: "04",
    audience: "INDIVIDUAL CREATORS",
    title: "Professional edits without a monthly salary.",
    copy: "Start at $7 for clean everyday content, then move up when a launch, partnership or flagship video deserves a stronger treatment.",
    metric: "FROM $7 / REEL",
  },
  {
    number: "05",
    audience: "CONSISTENT DELIVERY",
    title: "A managed editor network, not a random freelancer search.",
    copy: "We assign work according to the selected standard and review the output before delivery, giving you a clearer and more dependable production process.",
    metric: "QUALITY MATCHED",
  },
];

export default function BenefitsScroller() {
  const [active, setActive] = useState(0);
  const windowRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const viewport = windowRef.current;
    if (!viewport) return;

    let frame = 0;
    const updateActiveCard = () => {
      const viewportCentre = viewport.scrollLeft + viewport.clientWidth / 2;
      let nearest = 0;
      let nearestDistance = Number.POSITIVE_INFINITY;
      cardRefs.current.forEach((card, index) => {
        if (!card) return;
        const cardCentre = card.offsetLeft + card.offsetWidth / 2;
        const distance = Math.abs(viewportCentre - cardCentre);
        if (distance < nearestDistance) {
          nearest = index;
          nearestDistance = distance;
        }
      });
      setActive(nearest);
    };

    const requestUpdate = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(updateActiveCard);
    };

    updateActiveCard();
    viewport.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    return () => {
      cancelAnimationFrame(frame);
      viewport.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, []);

  const showBenefit = (index: number) => {
    const next = Math.min(Math.max(index, 0), benefits.length - 1);
    const viewport = windowRef.current;
    const card = cardRefs.current[next];
    if (!viewport || !card) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const centredPosition = card.offsetLeft - (viewport.clientWidth - card.offsetWidth) / 2;
    viewport.scrollTo({ left: centredPosition, behavior: reduceMotion ? "auto" : "smooth" });
    setActive(next);
  };

  return (
    <section className="benefitScroller" id="benefits" aria-labelledby="benefits-title">
      <div className="shell benefitHeader">
        <div>
          <p className="kicker">Why work with EditoVerse</p>
          <h2 id="benefits-title">Your content operation,<br /><em>made lighter.</em></h2>
        </div>
        <div className="benefitHeaderSide">
          <p>Explore how outsourced editing creates more capacity for agencies, teams and independent creators.</p>
          <div className="benefitControls">
            <button type="button" onClick={() => showBenefit(active - 1)} disabled={active === 0} aria-label="Previous benefit">←</button>
            <span aria-live="polite">0{active + 1} / 0{benefits.length}</span>
            <button type="button" onClick={() => showBenefit(active + 1)} disabled={active === benefits.length - 1} aria-label="Next benefit">→</button>
          </div>
        </div>
      </div>

      <div
        className="benefitWindow"
        ref={windowRef}
        role="region"
        aria-roledescription="carousel"
        aria-label="Reasons to work with EditoVerse"
      >
        <div className="benefitTrack">
          {benefits.map((benefit, index) => (
            <article
              className={`benefitCard ${active === index ? "isActive" : ""}`}
              key={benefit.number}
              ref={(node) => { cardRefs.current[index] = node; }}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${benefits.length}: ${benefit.audience}`}
            >
              <div className="benefitCardTop"><span>{benefit.number}</span><small>{benefit.audience}</small></div>
              <h3>{benefit.title}</h3>
              <p>{benefit.copy}</p>
              <strong>{benefit.metric}</strong>
            </article>
          ))}
        </div>
      </div>

      <div className="shell benefitPagination" aria-label="Choose a benefit">
        <div>
          {benefits.map((benefit, index) => (
            <button
              key={benefit.number}
              type="button"
              className={active === index ? "active" : ""}
              onClick={() => showBenefit(index)}
              aria-label={`Show benefit ${index + 1}`}
              aria-current={active === index ? "true" : undefined}
            />
          ))}
        </div>
        <small>Use arrows or swipe to explore</small>
      </div>
    </section>
  );
}
