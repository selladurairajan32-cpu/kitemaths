"use client";

import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { MOVE, motionOr } from "@/components/explain/motionTokens";
import { useReportWrong } from "@/components/journey/wrong";

/**
 * D-050 *Try it* for remainders, in three stories done by hand: (1) add minibuses of 12 until all 50 children have a
 * seat (round up); (2) make packs of 8 from 38 pens until no full pack is left (round down); (3) deal 23 stickers
 * between 5 friends and say how many are left over (the remainder). A move that doesn't work says why and tells the
 * Learn stage, so Kip can offer another way. Every control is a real button, and each result is announced.
 */

const UP = { total: 50, size: 12 };
const DOWN = { total: 38, size: 8 };
const LEFT = { total: 23, friends: 5 };

export function RemainderTry() {
  const reduce = !!useReducedMotion();
  const reportWrong = useReportWrong();
  const [round, setRound] = useState(0);
  const [groups, setGroups] = useState(0);
  const [note, setNote] = useState("");
  const [answer, setAnswer] = useState("");
  const [solved, setSolved] = useState(false);

  const next = () => {
    setRound((r) => r + 1);
    setGroups(0);
    setNote("");
    setAnswer("");
    setSolved(false);
  };

  if (round >= 3) {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <p className="display text-heading-2">All three stories done!</p>
        <p className="text-body font-bold text-ok">Round up, round down, or the remainder is the answer: the story tells you which.</p>
        <Button variant="secondary" onClick={() => { next(); setRound(0); }}>Do it again</Button>
      </div>
    );
  }

  if (round === 0) {
    const seated = Math.min(UP.total, groups * UP.size);
    const waiting = UP.total - seated;
    return (
      <Story title="Story 1 of 3: the school trip" line={`${UP.total} children, minibuses of ${UP.size}. Add minibuses until everyone has a seat.`}>
        <div className="flex flex-wrap gap-2" role="img" aria-label={`${groups} minibuses, ${seated} children seated, ${waiting} waiting`}>
          {Array.from({ length: groups }, (_, b) => (
            <motion.div key={b} initial={reduce ? false : { scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={motionOr(reduce, MOVE)} className="grid grid-cols-6 gap-1 rounded-[12px] border-2 border-ink bg-sun-soft p-2">
              {Array.from({ length: UP.size }, (_, i) => (
                <span key={i} className={`size-3 rounded-full ${b * UP.size + i < UP.total ? "bg-brand" : "bg-surface ring-1 ring-line-strong"}`} />
              ))}
            </motion.div>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="secondary" disabled={waiting === 0} onClick={() => setGroups((g) => g + 1)}>+ Add a minibus</Button>
          <span className="text-body font-bold text-ink">{seated} seated · {waiting} waiting</span>
        </div>
        <Status ok={waiting === 0} text={waiting === 0 ? `Everyone has a seat: ${groups} minibuses. 50 ÷ 12 = 4 r 2, so we rounded up.` : groups === 4 ? "Four are full, but 2 children are still waiting!" : "Keep going."} />
        {waiting === 0 && <Button variant="cta" onClick={next} className="self-start">Next story</Button>}
      </Story>
    );
  }

  if (round === 1) {
    const used = groups * DOWN.size;
    const loose = DOWN.total - used;
    const pack = () => {
      if (loose < DOWN.size) {
        setNote(`Only ${loose} pens left: not enough for a full pack of ${DOWN.size}.`);
        reportWrong();
      } else setGroups((g) => g + 1);
    };
    const stop = () => {
      if (loose >= DOWN.size) {
        setNote(`There are still ${loose} pens: you can make another full pack.`);
        reportWrong();
      } else {
        setSolved(true);
        setNote(`Yes! ${groups} full packs. 38 ÷ 8 = 4 r 6: the 6 pens aren't a pack, so we rounded down.`);
      }
    };
    return (
      <Story title="Story 2 of 3: packs of pens" line={`${DOWN.total} pens, packs of ${DOWN.size}. Make full packs until you can't.`}>
        <p className="text-body font-bold text-ink" aria-live="polite">{groups} full {groups === 1 ? "pack" : "packs"} · {loose} pens loose</p>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" disabled={solved} onClick={pack}>+ Make a pack of {DOWN.size}</Button>
          <Button variant="secondary" disabled={solved} onClick={stop}>No more full packs</Button>
        </div>
        <Status ok={solved} text={note || "Make a pack, or say when you can't."} />
        {solved && <Button variant="cta" onClick={next} className="self-start">Next story</Button>}
      </Story>
    );
  }

  const each = Math.floor(LEFT.total / LEFT.friends);
  const left = LEFT.total - each * LEFT.friends;
  const check = () => {
    if (Number(answer.trim()) === left) {
      setSolved(true);
      setNote(`Yes! Each friend gets ${each}, and ${left} are left over: the remainder is the answer.`);
    } else {
      setNote(`Not quite. ${LEFT.friends} friends × ${each} = ${each * LEFT.friends}. How many of the ${LEFT.total} are left?`);
      reportWrong();
    }
  };
  return (
    <Story title="Story 3 of 3: sharing stickers" line={`${LEFT.total} stickers are shared equally between ${LEFT.friends} friends. How many are left over?`}>
      <div className="flex flex-wrap gap-2" role="img" aria-label={`${LEFT.friends} friends with ${each} stickers each, ${left} left over`}>
        {Array.from({ length: LEFT.friends }, (_, f) => (
          <span key={f} className="flex gap-1 rounded-[12px] bg-surface p-2 shadow-[var(--shadow-card)]">
            {Array.from({ length: each }, (_, i) => <span key={i} className="size-3 rounded-full bg-brand" />)}
          </span>
        ))}
        <span className="flex gap-1 rounded-[12px] border-2 border-dashed border-num p-2">
          {Array.from({ length: left }, (_, i) => <span key={i} className="size-3 rounded-full bg-num" />)}
        </span>
      </div>
      <form className="flex flex-wrap items-end gap-3" onSubmit={(e) => { e.preventDefault(); check(); }}>
        <label className="flex flex-col gap-1 text-body font-bold text-ink">
          Left over
          <input value={answer} onChange={(e) => setAnswer(e.target.value)} inputMode="numeric" disabled={solved} className="h-12 w-28 rounded-[14px] border-2 border-line-strong bg-surface px-3 text-title font-extrabold" />
        </label>
        <Button type="submit" variant="cta" disabled={solved || answer.trim() === ""}>Check answer</Button>
      </form>
      <Status ok={solved} text={note || "Count the stickers nobody gets."} />
      {solved && <Button variant="cta" onClick={next} className="self-start">Finish</Button>}
    </Story>
  );
}

function Story({ title, line, children }: { title: string; line: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-title font-extrabold text-ink">{title}</h2>
      <p className="text-body text-ink-2">{line}</p>
      {children}
    </div>
  );
}

function Status({ ok, text }: { ok: boolean; text: string }) {
  return <p role="status" className={`min-h-12 rounded-[16px] px-4 py-3 text-body font-bold ${ok ? "bg-ok-soft text-ink" : "bg-sunk text-ink-2"}`}>{text}</p>;
}
