"use client";

import { Plus } from "lucide-react";
import { useId, useState } from "react";

import { RFDS } from "@/components/rfds";
import type { FaqItem } from "./summit-data";

function SummitFaqItem({ item }: { item: FaqItem }) {
  const [isOpen, setIsOpen] = useState(false);
  const contentId = useId();

  return (
    <div>
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={contentId}
        onClick={() => setIsOpen((open) => !open)}
        className="flex w-full items-center justify-between gap-6 py-6 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
      >
        <span className="font-semibold text-foreground sm:text-lg">{item.question}</span>
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground transition-transform duration-300 motion-reduce:transition-none ${isOpen ? "rotate-45" : ""}`}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
        </span>
      </button>

      <RFDS.AccordionContent isOpen={isOpen} duration={300}>
        <div id={contentId}>
          <p className="max-w-3xl pb-7 pr-12 text-sm leading-7 text-muted-foreground sm:text-base">
            {item.answer}
            {item.link ? (
              <>
                {" "}
                <a
                  href={item.link.href}
                  className="font-medium text-primary underline decoration-primary/35 underline-offset-4 transition hover:decoration-primary"
                >
                  {item.link.label}
                </a>
              </>
            ) : null}
            {item.updatedAt ? (
              <span className="mt-3 block">
                It was last updated on{" "}
                <strong className="font-semibold text-foreground">{item.updatedAt}</strong>.
              </span>
            ) : null}
          </p>
        </div>
      </RFDS.AccordionContent>
    </div>
  );
}

export function SummitFaq({ items }: { items: readonly FaqItem[] }) {
  return (
    <div className="divide-y divide-border border-y border-border">
      {items.map((item) => (
        <SummitFaqItem key={item.question} item={item} />
      ))}
    </div>
  );
}
