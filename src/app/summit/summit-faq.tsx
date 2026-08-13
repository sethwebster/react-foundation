import type { FaqItem } from "./summit-data";

function SummitFaqItem({ item }: { item: FaqItem }) {
  return (
    <article className="py-7">
      <h3 className="font-semibold text-foreground sm:text-lg">{item.question}</h3>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
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
    </article>
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
