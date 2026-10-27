'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play, Shuffle } from 'lucide-react';
import { sampleGallery } from '@/lib/gallery';
import type { Candidate } from '@/lib/election';

export default function CandidateGallery({ candidates, portrait }: { candidates: Candidate[]; portrait: (candidate: Candidate) => ReactNode }) {
  const [options, setOptions] = useState<Candidate[]>([]);
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    setOptions(sampleGallery(candidates));
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPlaying(!reducedMotion.matches);
    const stop = () => { if (reducedMotion.matches) setPlaying(false); };
    const visibility = () => setHidden(document.hidden);
    reducedMotion.addEventListener('change', stop);
    document.addEventListener('visibilitychange', visibility);
    return () => { reducedMotion.removeEventListener('change', stop); document.removeEventListener('visibilitychange', visibility); };
  }, [candidates]);

  useEffect(() => {
    if (!playing || interacting || hidden || options.length < 2) return;
    const timer = window.setInterval(() => setActive(i => (i + 1) % options.length), 5000);
    return () => window.clearInterval(timer);
  }, [playing, interacting, hidden, options.length]);

  function move(offset: number) { setPlaying(false); setActive(i => (i + offset + options.length) % options.length); }
  function reshuffle() { const current = new Set(options.map(c => c.candidateId)); const others = candidates.filter(c => !current.has(c.candidateId)); setOptions(sampleGallery(others.length >= 5 ? others : candidates)); setActive(0); setPlaying(false); }

  return <section className="preference-gallery" aria-labelledby="gallery-title" aria-roledescription="קרוסלה"
    onMouseEnter={() => setInteracting(true)} onMouseLeave={() => setInteracting(false)}
    onFocusCapture={event => { if (!(event.target as HTMLElement).closest('.gallery-play')) setPlaying(false); }}>
    <div className="gallery-heading"><div><span className="eyebrow">חמישה שמות. נקודת מבט חדשה.</span><h2 id="gallery-title">איזה ח&quot;כ אתה מעדיף</h2><p>5 אפשרויות אקראיות מתוך {candidates.length} שמות הפיילוט. אפשר לדפדף או להגריל חמישייה חדשה.</p></div><button className="secondary" onClick={reshuffle} disabled={!options.length}><Shuffle size={16} /> הגרלת 5 אחרים</button></div>
    {!options.length ? <p className="gallery-loading" role="status">מכינים חמישייה אקראית…</p> : <>
      <div className="gallery-cards">{options.map((candidate, index) => <button key={candidate.candidateId}
        className={`gallery-card ${active === index ? 'gallery-active' : ''}`} aria-label={`הצגת ${candidate.fullNameHe}`}
        aria-pressed={active === index} onClick={() => { setActive(index); setPlaying(false); }}>
        {portrait(candidate)}<strong>{candidate.fullNameHe}</strong>
      </button>)}</div>
      <div className="gallery-footer"><div className="gallery-navigation">
        <button className="icon-button" onClick={() => move(-1)} aria-label="המועמד הקודם בגלריה"><ChevronRight size={18} /></button>
        <span aria-live={playing ? 'off' : 'polite'}>{active + 1} מתוך {options.length}: <strong>{options[active].fullNameHe}</strong></span>
        <button className="icon-button" onClick={() => move(1)} aria-label="המועמד הבא בגלריה"><ChevronLeft size={18} /></button>
      </div><button className="gallery-play text-button" onClick={() => setPlaying(p => !p)} aria-label={playing ? 'השהיית הגלריה' : 'הפעלת הגלריה'}>{playing ? <Pause size={15} /> : <Play size={15} />}{playing ? 'השהיה' : 'הפעלה'}</button></div>
      <div className="gallery-options" aria-label="חמש האפשרויות בגלריה">{options.map((candidate, index) => <button key={candidate.candidateId} aria-pressed={active === index} onClick={() => { setActive(index); setPlaying(false); }}>{candidate.fullNameHe}</button>)}</div>
    </>}
    <p className="gallery-note">* אלה שמות ממאגר הפיילוט, לא בהכרח חברי כנסת מכהנים. אין בגלריה המלצת הצבעה. כאשר אין תמונה מאומתת ומורשית מוצגת צללית. הדפדוף בגלריה אינו מסמן בחירה בסימולטור.</p>
  </section>;
}
