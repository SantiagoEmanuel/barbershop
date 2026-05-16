import { Trash2 } from "lucide-react";
import type { CartLine } from "../types/cartLine";
import { formatARS } from "./ui/formatters";

export function CartLineRow({
  line,
  type,
  onUpdate,
  onRemove,
}: {
  line: CartLine;
  type: "product" | "service";
  onUpdate: (qty: number) => void;
  onRemove: () => void;
}) {
  return (
    <li className="bg-surface-raised border-border flex items-center justify-between rounded-xl border px-3 py-2">
      <div className="flex flex-col">
        <span className="text-text-primary font-body text-sm font-medium">
          {line.name}
        </span>
        <span className="text-text-muted font-body text-xs">
          {formatARS(line.price)} × {line.quantity} ={" "}
          {formatARS(line.price * line.quantity)}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <div className="border-border flex items-center gap-1 rounded-lg border">
          <button
            onClick={() => onUpdate(line.quantity - 1)}
            className="text-text-muted hover:text-text-primary px-2 py-1 text-sm"
          >
            −
          </button>
          <span className="text-text-primary font-body w-5 text-center text-sm">
            {line.quantity}
          </span>
          <button
            onClick={() =>
              onUpdate(
                type === "product"
                  ? Math.min(
                      line.quantity + 1,
                      (line as Extract<CartLine, { kind: "product" }>).stock,
                    )
                  : line.quantity + 1,
              )
            }
            className="text-text-muted hover:text-text-primary px-2 py-1 text-sm"
          >
            +
          </button>
        </div>
        <button onClick={onRemove} className="text-error p-1">
          <Trash2 size={14} />
        </button>
      </div>
    </li>
  );
}
