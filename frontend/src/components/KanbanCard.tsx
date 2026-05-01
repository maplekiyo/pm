import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import clsx from "clsx";
import type { Card } from "@/lib/kanban";

type KanbanCardProps = {
  card: Card;
  onUpdate: (cardId: string, title: string, details: string) => void;
  onDelete: (cardId: string) => void;
};

export const KanbanCard = ({ card, onUpdate, onDelete }: KanbanCardProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={clsx(
        "rounded-2xl border border-transparent bg-white px-4 py-4 shadow-[0_12px_24px_rgba(3,33,71,0.08)]",
        "transition-all duration-150",
        isDragging && "opacity-60 shadow-[0_18px_32px_rgba(3,33,71,0.16)]"
      )}
      {...attributes}
      {...listeners}
      data-testid={`card-${card.id}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="w-full">
          <input
            value={card.title}
            onChange={(event) => onUpdate(card.id, event.target.value, card.details)}
            className="w-full bg-transparent font-display text-base font-semibold text-[var(--navy-dark)] outline-none"
            aria-label={`Title for ${card.title}`}
          />
          <textarea
            value={card.details}
            onChange={(event) => onUpdate(card.id, card.title, event.target.value)}
            className="mt-2 min-h-16 w-full resize-none bg-transparent text-sm leading-6 text-[var(--gray-text)] outline-none"
            aria-label={`Details for ${card.title}`}
          />
        </div>
        <button
          type="button"
          onClick={() => onDelete(card.id)}
          className="rounded-full border border-transparent px-2 py-1 text-xs font-semibold text-[var(--gray-text)] transition hover:border-[var(--stroke)] hover:text-[var(--navy-dark)]"
          aria-label={`Delete ${card.title}`}
        >
          Remove
        </button>
      </div>
    </article>
  );
};
