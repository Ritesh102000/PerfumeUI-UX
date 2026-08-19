"use client";

import { FormEvent, useEffect, useLayoutEffect, useRef, useState } from "react";
import BenefitsScroller from "./BenefitsScroller";
import TierOrbit, { tierCards } from "./TierOrbit";

const heroFirstLine = "Stop managing edits.";
const heroSecondLine = "Start shipping content.";
const heroCharacterCount = heroFirstLine.length + heroSecondLine.length;

export default function Home() {
  const [submitted, setSubmitted] = useState(false);
  const [introActive, setIntroActive] = useState(true);
  const [typedCharacters, setTypedCharacters] = useState(0);
  const introTimers = useRef<{ start?: number; interval?: number; finish?: number }>({});
  const introKeyHandler = useRef<((event: KeyboardEvent) => void) | null>(null);

  useLayoutEffect(() => {
    if ("scrollRestoration" in window.history) window.history.scrollRestoration = "manual";
    const cleanUrl = `${window.location.pathname}${window.location.search}`;
    if (window.location.hash) window.history.replaceState(null, "", cleanUrl);
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });

    if ("caches" in window) {
      void window.caches.keys()
        .then((cacheNames) => Promise.all(cacheNames.map((cacheName) => window.caches.delete(cacheName))))
        .catch(() => undefined);
    }
  }, []);

  const completeIntro = (focusHero = false) => {
    if (introTimers.current.start) window.clearTimeout(introTimers.current.start);
    if (introTimers.current.interval) window.clearInterval(introTimers.current.interval);
    if (introTimers.current.finish) window.clearTimeout(introTimers.current.finish);
    if (introKeyHandler.current) window.removeEventListener("keydown", introKeyHandler.current);
    introKeyHandler.current = null;
    document.documentElement.classList.remove("introLocked");
    document.querySelectorAll<HTMLElement>("#top > :not(.introOverlay)").forEach((element) => { element.inert = false; });
    setTypedCharacters(heroCharacterCount);
    setIntroActive(false);
    if (focusHero) window.requestAnimationFrame(() => document.getElementById("hero-title")?.focus());
  };

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timers = introTimers.current;
    if (reduceMotion) {
      timers.finish = window.setTimeout(() => {
        setTypedCharacters(heroCharacterCount);
        setIntroActive(false);
      }, 0);
      return () => window.clearTimeout(timers.finish);
    }

    document.documentElement.classList.add("introLocked");
    document.querySelectorAll<HTMLElement>("#top > :not(.introOverlay)").forEach((element) => { element.inert = true; });
    const handleIntroKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") completeIntro(true);
    };
    introKeyHandler.current = handleIntroKey;
    window.addEventListener("keydown", handleIntroKey);
    let nextCharacter = 0;
    timers.start = window.setTimeout(() => {
      timers.interval = window.setInterval(() => {
        nextCharacter += 1;
        setTypedCharacters(nextCharacter);
        if (nextCharacter >= heroCharacterCount && timers.interval) window.clearInterval(timers.interval);
      }, 31);
    }, 280);

    timers.finish = window.setTimeout(() => completeIntro(false), 2600);

    return () => {
      if (timers.start) window.clearTimeout(timers.start);
      if (timers.finish) window.clearTimeout(timers.finish);
      if (timers.interval) window.clearInterval(timers.interval);
      window.removeEventListener("keydown", handleIntroKey);
      introKeyHandler.current = null;
      document.documentElement.classList.remove("introLocked");
      document.querySelectorAll<HTMLElement>("#top > :not(.introOverlay)").forEach((element) => { element.inert = false; });
    };
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  const typedFirstLine = heroFirstLine.slice(0, Math.min(typedCharacters, heroFirstLine.length));
  const typedSecondLine = heroSecondLine.slice(0, Math.max(typedCharacters - heroFirstLine.length, 0));

  return (
    <main id="top" className={introActive ? "introActive" : "introComplete"}>
      {introActive && (
        <div className="introOverlay" role="dialog" aria-modal="true" aria-label="Opening EditoVerse">
          <button className="introSkip" type="button" onClick={() => completeIntro(true)}>Skip intro</button>
          <div className="introGrid" aria-hidden="true" />
          <div className="introBuilder" aria-hidden="true">
            <div className="introBuilderBar"><span /><span /><span /><b>EDITOVERSE / HERO</b></div>
            <i className="introPiece introPieceNav" />
            <i className="introPiece introPieceTitleOne" />
            <i className="introPiece introPieceTitleTwo" />
            <i className="introPiece introPieceCopy" />
            <i className="introPiece introPieceButtonOne" />
            <i className="introPiece introPieceButtonTwo" />
            <div className="introBuilderProgress"><span /></div>
          </div>
          <div className="introStatus" aria-live="polite"><span>Assembling front page</span><strong>Components in motion</strong></div>
        </div>
      )}

      <nav className="nav shell" aria-label="Primary navigation">
        <a className="brand" href="#top" aria-label="EditoVerse home">EDITO<span>VERSE</span></a>
        <div className="navLinks">
          <a href="#showcase">Pricing</a>
          <a href="#benefits">Why us</a>
          <a className="navCta" href="#contact">Start a project</a>
        </div>
      </nav>

      <section className="hero shell" aria-labelledby="hero-title">
        <div className="eyebrow"><i /> Editing capacity, on demand</div>
        <h1 id="hero-title" className="heroType" tabIndex={-1} aria-label={`${heroFirstLine} ${heroSecondLine}`}>
          <span className="heroTypeGhost" aria-hidden="true">{heroFirstLine}<br /><em>{heroSecondLine}</em></span>
          <span className="heroTypeLive" aria-hidden="true">
            {typedCharacters <= heroFirstLine.length ? (
              <>{typedFirstLine}{introActive && <i className="typeCursor" />}</>
            ) : (
              <>{heroFirstLine}<br /><em>{typedSecondLine}{introActive && <i className="typeCursor" />}</em></>
            )}
          </span>
        </h1>
        <div className="heroBottom">
          <p className="heroCopy">Reliable, affordable video editing for creators and marketing teams. Pick the quality tier, send your footage, and let our editors handle the rest.</p>
          <div className="heroActions">
            <a className="button primary" href="#showcase">Explore editing tiers <span>↗</span></a>
            <a className="button secondary" href="#contact">Talk to us</a>
          </div>
        </div>
        <div className="proofRow" aria-label="Service benefits">
          <span>Reels up to 60 seconds</span><b>•</b><span>Transparent tier pricing</span><b>•</b><span>Global editor network</span><b>•</b><span>Built for repeat work</span>
        </div>
      </section>

      <div className="marquee" aria-label="EditoVerse services">
        <div>SHORT-FORM EDITING <span>✦</span> MOTION GRAPHICS <span>✦</span> SOUND DESIGN <span>✦</span> CREATIVE CAPACITY <span>✦</span> SHORT-FORM EDITING <span>✦</span></div>
      </div>

      <TierOrbit />
      <BenefitsScroller />

      <section className="contactSection" id="contact" aria-labelledby="contact-title">
        <div className="shell contactGrid">
          <div className="contactCopy">
            <p className="kicker">Start a project</p>
            <h2 id="contact-title">Need an edit?<br /><em>Send the brief.</em></h2>
            <p>Tell us what you are creating and the standard you need. We will review the scope and help you choose the most suitable tier.</p>
            <div className="contactMeta"><span>For creators</span><span>For agencies</span><span>For brands</span></div>
          </div>

          {submitted ? (
            <div className="successMessage" role="status">
              <span>✓</span>
              <h3>Your enquiry is ready.</h3>
              <p>The contact workflow is prepared. Add the final EditoVerse contact email to activate delivery before launch.</p>
              <button type="button" onClick={() => setSubmitted(false)}>Send another enquiry</button>
            </div>
          ) : (
            <form className="contactForm" onSubmit={handleSubmit}>
              <div className="fieldRow">
                <label>Full name<input required name="name" type="text" autoComplete="name" placeholder="Your name" /></label>
                <label>Email address<input required name="email" type="email" autoComplete="email" placeholder="you@company.com" /></label>
              </div>
              <div className="fieldRow">
                <label>I am a<select required name="customerType" defaultValue=""><option value="" disabled>Select one</option><option>Creator</option><option>Marketing agency</option><option>Brand or business</option><option>Other</option></select></label>
                <label>Interested tier<select required name="tier" defaultValue=""><option value="" disabled>Select a tier</option>{tierCards.map((tier) => <option key={tier.name}>{tier.name} — ${tier.price}</option>)}</select></label>
              </div>
              <label>Project brief<textarea required name="brief" rows={5} placeholder="Tell us about the video, deadline, references and what footage you have…" /></label>
              <button className="submitButton" type="submit">Request an editing quote <span>↗</span></button>
              <p className="formNote">By submitting, you agree to be contacted about your editing request.</p>
            </form>
          )}
        </div>
      </section>

      <footer className="footer shell">
        <a className="brand" href="#top">EDITO<span>VERSE</span></a>
        <p>Editing capacity for ambitious content teams.</p>
        <a href="#top">Back to top ↑</a>
      </footer>
    </main>
  );
}
