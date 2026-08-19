"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

export const tierCards = [
  {
    name: "Beginner",
    price: 7,
    accent: "#d9ff3f",
    label: "Clean social essentials",
    description: "Clean, dependable editing for talking-head reels, simple promotions and everyday creator content.",
    features: ["Clean cuts and pacing", "Basic captions", "Music and simple transitions", "Colour and audio correction", "One revision"],
    videoId: "nesqAKTaeSo",
  },
  {
    name: "Advanced",
    price: 20,
    accent: "#8ae8ff",
    label: "Retention-focused editing",
    description: "Stronger hooks, more visual movement and an edit designed to keep viewers watching.",
    features: ["Everything in Beginner", "Animated captions", "B-roll and speed ramps", "Enhanced sound design", "Two revisions"],
    videoId: "A7W4jD63Tco",
  },
  {
    name: "Pro",
    price: 40,
    accent: "#ff8acf",
    label: "Campaign-ready production",
    description: "Advanced execution for paid campaigns, launches and high-value social content.",
    features: ["Everything in Advanced", "Custom motion graphics", "Masking and compositing", "Detailed visual polish", "Priority quality review"],
    videoId: "5F30lmDD0mE",
  },
  {
    name: "God Tier",
    price: 90,
    accent: "#ff9457",
    label: "Signature creative treatment",
    description: "Premium art direction and bespoke treatment when every frame needs to stand apart.",
    features: ["Bespoke edit direction", "Complex motion and VFX", "Custom visual assets", "Cinematic grade and audio", "Senior-editor review"],
    videoId: "b7OBPMzsX0E",
  },
];

export default function TierOrbit() {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState<number | null>(null);
  const [mobile, setMobile] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(0);

  const select = (index: number) => {
    const next = Math.min(Math.max(index, 0), tierCards.length - 1);
    setPlaying(null);
    if (mobile && carouselRef.current) {
      setActive(next);
      activeRef.current = next;
      carouselRef.current.style.setProperty("--orbit-turn", `${next * -90}deg`);
    }
    if (!mobile && sectionRef.current) {
      const section = sectionRef.current;
      const available = section.offsetHeight - window.innerHeight;
      const top = window.scrollY + section.getBoundingClientRect().top;
      window.scrollTo({ top: top + available * (next / (tierCards.length - 1)), behavior: "smooth" });
    }
  };

  useEffect(() => {
    const section = sectionRef.current;
    const carousel = carouselRef.current;
    if (!section || !carousel) return;
    const query = window.matchMedia("(max-width: 680px)");
    let scrollFrame = 0;
    let motionFrame = 0;
    let currentTurn = activeRef.current * -90;
    let targetTurn = currentTurn;
    let motionRunning = false;

    const renderTurn = () => {
      const difference = targetTurn - currentTurn;
      if (Math.abs(difference) < 0.025) {
        currentTurn = targetTurn;
        carousel.style.setProperty("--orbit-turn", `${currentTurn}deg`);
        motionRunning = false;
        return;
      }

      currentTurn += difference * 0.24;
      carousel.style.setProperty("--orbit-turn", `${currentTurn}deg`);
      motionFrame = requestAnimationFrame(renderTurn);
    };

    const setTurn = (turn: number, immediate = false) => {
      targetTurn = turn;
      if (immediate) {
        cancelAnimationFrame(motionFrame);
        currentTurn = turn;
        motionRunning = false;
        carousel.style.setProperty("--orbit-turn", `${turn}deg`);
        return;
      }
      if (!motionRunning) {
        motionRunning = true;
        motionFrame = requestAnimationFrame(renderTurn);
      }
    };

    const update = () => {
      const isMobile = query.matches;
      setMobile(isMobile);
      if (isMobile) {
        setTurn(activeRef.current * -90, true);
        return;
      }
      const rect = section.getBoundingClientRect();
      const available = section.offsetHeight - window.innerHeight;
      const progress = available > 0 ? Math.min(Math.max(-rect.top / available, 0), 1) : 0;

      // The card remains flat for a short scroll chapter, then the turn itself
      // follows the user's scroll before settling on the next tier.
      const transitions = tierCards.length - 1;
      let facePosition = transitions;
      if (progress < 1) {
        const chapterProgress = progress * transitions;
        const chapter = Math.min(Math.floor(chapterProgress), transitions - 1);
        const localProgress = chapterProgress - chapter;
        const turnStart = 0.08;
        const turnEnd = 0.68;
        const rawTurn = Math.min(Math.max((localProgress - turnStart) / (turnEnd - turnStart), 0), 1);
        const easedTurn = rawTurn * rawTurn * (3 - 2 * rawTurn);
        facePosition = chapter + easedTurn;
      }

      setTurn(facePosition * -90);
      const next = Math.min(Math.round(facePosition), tierCards.length - 1);
      if (next !== activeRef.current) {
        activeRef.current = next;
        setActive(next);
        setPlaying(null);
      }
    };

    const requestUpdate = () => {
      cancelAnimationFrame(scrollFrame);
      scrollFrame = requestAnimationFrame(update);
    };
    update();
    query.addEventListener("change", requestUpdate);
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    return () => {
      cancelAnimationFrame(scrollFrame);
      cancelAnimationFrame(motionFrame);
      query.removeEventListener("change", requestUpdate);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, []);

  return (
    <section className="orbitSection" id="showcase" ref={sectionRef} aria-labelledby="showcase-title">
      <div className="orbitSticky">
      <div className="shell orbitLayout">
        <h2 className="srOnly" id="showcase-title">Editing tiers and prices</h2>

        <div className="orbitInteraction">
          <div
            className="orbitScene"
            role="region"
            aria-label="Rotating editing tier video showcase"
          >
            <div className="orbitGlow" style={{ "--active-accent": tierCards[active].accent } as CSSProperties} />
            <div className="orbitFloor" aria-hidden="true" />
            <div className="orbitPivot orbitPivotTop" aria-hidden="true" />
            <div className="orbitPivot orbitPivotBottom" aria-hidden="true" />
            <div className="orbitCarousel" ref={carouselRef}>
              {tierCards.map((tier, index) => (
                <article
                  className={`orbitCard orbitCard${index + 1} ${active === index ? "isActive" : ""}`}
                  key={tier.name}
                  aria-hidden={active !== index}
                  style={{ "--card-accent": tier.accent, "--card-angle": `${index * 90}deg` } as CSSProperties}
                >
                  <div className="orbitCardTop">
                    <span>0{index + 1} / {tier.name.toUpperCase()}</span>
                    <strong><small>$</small>{tier.price}<em>/ reel</em></strong>
                  </div>

                  <div className="orbitVideo">
                    {playing === index ? (
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${tier.videoId}?autoplay=1&mute=1&rel=0`}
                        title={`${tier.name} editing reference video`}
                        tabIndex={active === index ? 0 : -1}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    ) : (
                      <button type="button" tabIndex={active === index ? 0 : -1} onClick={() => setPlaying(index)} aria-label={`Play ${tier.name} editing reference`}>
                        {/* YouTube provides these external thumbnails; keeping the native image avoids proxying third-party media. */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={`https://i.ytimg.com/vi/${tier.videoId}/hqdefault.jpg`} alt="" />
                        <span>▶</span>
                        <small>PLAY REFERENCE</small>
                      </button>
                    )}
                  </div>

                  <div className="orbitCardBody">
                    <h3>{tier.label}</h3>
                    <p>{tier.description}</p>
                    <ul>{tier.features.map((feature) => <li key={feature}>✓ {feature}</li>)}</ul>
                  </div>

                  <div className="orbitCardFooter">
                    <span>Up to 60 seconds</span>
                    <span>Payment charges apply extra</span>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="orbitControls">
            <button type="button" onClick={() => select(active - 1)} disabled={active === 0} aria-label="Previous editing tier">←</button>
            <div className="orbitTabs" aria-label="Select editing tier">
              {tierCards.map((tier, index) => (
                <button key={tier.name} type="button" className={active === index ? "active" : ""} onClick={() => select(index)} aria-label={`Show ${tier.name}`}><span>0{index + 1}</span>{tier.name}</button>
              ))}
            </div>
            <button type="button" onClick={() => select(active + 1)} disabled={active === tierCards.length - 1} aria-label="Next editing tier">→</button>
          </div>
          <p className="orbitScrollCue"><i /> Scroll to rotate through every tier</p>
        </div>
      </div>
      </div>
    </section>
  );
}
