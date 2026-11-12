"use client";

import { useState } from "react";
import { RichText } from "@/components/math/RichText";
import { Button } from "@/components/ui/Button";
import { topicById } from "@/topics";
import type { KitQuestion, KitResponse } from "@/topics/kit/types";
import { useReportWrong } from "./ExplainShell";

/**
 * The question that ends every explanation (D-040, shared in D-041): a real island question, marked by the island's
 * own evaluator, the same whichever way the child learned it. A wrong answer counts towards Kip's "another way?".
 */
export function FinalCheck({ topicId, questionId, orderKey }: { topicId: string; questionId: string; orderKey: string }) {
  const topic = topicById(topicId)!;
  const q = topic.questionById(questionId) as KitQuestion;
  const { Input } = topic.questions;
  const reportWrong = useReportWrong();
  const [response, setResponse] = useState<KitResponse | null>(null);
  const [result, setResult] = useState<{ correct: boolean; feedback?: string } | null>(null);
  return (
    <section aria-labelledby="final-title" className="flex flex-col gap-3 rounded-[24px] border-2 border-brand bg-surface p-5 shadow-[var(--shadow-card)]">
      <p className="text-label font-bold text-brand-strong">Mini-checkpoint</p>
      <h2 id="final-title" className="text-title font-extrabold text-ink"><RichText text={q.prompt} /></h2>
      <Input question={q} response={response} onChange={(r) => { setResponse(r as KitResponse | null); setResult(null); }} locked={!!result?.correct} orderKey={orderKey} />
      <div className="flex flex-wrap items-center gap-3">
        <Button
          disabled={!response || !!result?.correct}
          onClick={() => {
            const ev = topic.questions.evaluate(q, response!);
            if (!ev.correct) reportWrong();
            setResult({ correct: ev.correct, feedback: ev.feedback });
          }}
        >
          Check
        </Button>
        {result && (
          <p role="status" className={`text-body font-bold ${result.correct ? "text-ok" : "text-warn"}`}>
            {result.correct ? "Correct! " : "Not yet. "}
            {result.correct ? <RichText text={q.explanation} /> : <RichText text={result.feedback ?? q.hint} />}
          </p>
        )}
      </div>
    </section>
  );
}
