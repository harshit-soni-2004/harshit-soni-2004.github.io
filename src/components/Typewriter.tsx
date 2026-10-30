import { useEffect, useState } from 'react';

interface Props {
  words: string[];
  reducedMotion: boolean;
  typeMs?: number;
  deleteMs?: number;
  pauseMs?: number;
}

/**
 * Types, pauses, deletes and cycles through `words`. The animated text is aria-hidden;
 * screen readers get the full list once via a visually-hidden span.
 */
export function Typewriter({
  words,
  reducedMotion,
  typeMs = 70,
  deleteMs = 35,
  pauseMs = 1600,
}: Props) {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (reducedMotion || words.length === 0) return;
    const word = words[index % words.length] ?? '';
    let delay = deleting ? deleteMs : typeMs;
    if (!deleting && text === word) delay = pauseMs;

    const t = window.setTimeout(() => {
      if (!deleting && text === word) setDeleting(true);
      else if (deleting && text === '') {
        setDeleting(false);
        setIndex((i) => (i + 1) % words.length);
      } else {
        setText(word.slice(0, text.length + (deleting ? -1 : 1)));
      }
    }, delay);
    return () => window.clearTimeout(t);
  }, [text, deleting, index, words, reducedMotion, typeMs, deleteMs, pauseMs]);

  return (
    <>
      <span className="visually-hidden">{words.join(', ')}</span>
      <span aria-hidden="true">
        {reducedMotion ? words.join(' / ') : text}
        <span className="cursor" />
      </span>
    </>
  );
}
