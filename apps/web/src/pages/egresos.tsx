import {
  EmptyState,
  FieldInput,
  ModalBase,
  SectionHeader,
  Spinner,
  StatCard,
} from "@config/components";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import { BarsCard, DonutCard } from "../components/charts";
import {
  FieldSelect,
  PurchaseModal,
  type PaymentMethod,
} from "../components/purchaseModal";
import { formatARS } from "../components/ui/formatters";
import { api, post } from "../lib/api";
import type {
  ApiResponse,
  ExpenseCategory,
  ExpenseReport,
  Product,
  RecurringExpense,
  Supply,
} from "../types";

function shortDate(iso: string) {
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
}

// ── Modal: registrar gasto puntual ────────────────────────────
function ExpenseModal({
  open,
  onClose,
  categories,
  methods,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  categories: ExpenseCategory[];
  methods: PaymentMethod[];
  onSaved: () => void;
}) {
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [methodId, setMethodId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setCategoryId(categories[0]?.id ?? "");
      setDescription("");
      setAmount("");
      setMethodId("");
      setError("");
    }
  }, [open, categories]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await post<ApiResponse<unknown>>("expenses", {
        categoryId,
        description,
        amount: Number(amount),
        paymentMethodId: methodId || undefined,
      });
      if (!res?.data) throw new Error("No se pudo registrar el gasto");
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ModalBase open={open} onClose={onClose} maxW="max-w-sm">
      <div className="px-6 py-5">
        <h3 className="font-display text-text-primary mb-4 text-lg font-bold">
          Registrar gasto
        </h3>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <FieldSelect
            label="Rubro *"
            value={categoryId}
            onChange={setCategoryId}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.kind === "fixed" ? "fijo" : "variable"})
              </option>
            ))}
          </FieldSelect>
          <FieldInput
            label="Descripción *"
            value={description}
            onChange={setDescription}
            required
          />
          <FieldInput
            label="Monto (centavos) *"
            value={amount}
            onChange={setAmount}
            type="number"
            placeholder="150000"
            required
          />
          <FieldSelect
            label="Método de pago"
            value={methodId}
            onChange={setMethodId}
          >
            <option value="">Sin especificar</option>
            {methods.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </FieldSelect>
          {error && (
            <p className="bg-error/10 text-error font-body rounded-lg px-3 py-2 text-xs">
              {error}
            </p>
          )}
          <div className="mt-1 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost flex-1 rounded-xl py-2.5 text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-marca flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 disabled:opacity-70"
            >
              {loading ? <Spinner size={14} /> : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </ModalBase>
  );
}

// ── Modal: gastos fijos mensuales ─────────────────────────────
function RecurringModal({
  open,
  onClose,
  categories,
  recurring,
  onChanged,
}: {
  open: boolean;
  onClose: () => void;
  categories: ExpenseCategory[];
  recurring: RecurringExpense[];
  onChanged: () => void;
}) {
  const fixedCats = categories.filter((c) => c.kind === "fixed");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [dayOfMonth, setDayOfMonth] = useState("1");
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setCategoryId(categories.find((c) => c.kind === "fixed")?.id ?? "");
      setDescription("");
      setAmount("");
      setDayOfMonth("1");
      setError("");
    }
  }, [open, categories]);

  async function addRecurring(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await post<ApiResponse<unknown>>("expenses/recurring", {
        categoryId,
        description,
        amount: Number(amount),
        dayOfMonth: Number(dayOfMonth),
      });
      if (!res?.data) throw new Error("No se pudo crear el gasto fijo");
      setDescription("");
      setAmount("");
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  async function deactivate(id: string) {
    try {
      await api(`expenses/recurring/${id}`, { method: "DELETE" });
      onChanged();
      toast.success("Gasto fijo quitado");
    } catch {
      toast.error("No se pudo quitar el gasto fijo");
    }
  }

  async function runMonth() {
    setRunning(true);
    try {
      await post("expenses/recurring/run", {});
      onChanged();
      toast.success("Gastos fijos del mes cargados");
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar los gastos fijos",
      );
    } finally {
      setRunning(false);
    }
  }

  return (
    <ModalBase open={open} onClose={onClose} maxW="max-w-md">
      <div className="px-6 py-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-text-primary text-lg font-bold">
            Gastos fijos mensuales
          </h3>
          <button
            onClick={runMonth}
            disabled={running}
            className="btn-ghost flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs disabled:opacity-60"
            title="Registrar los gastos fijos de este mes"
          >
            {running && <Spinner size={12} />}
            {running ? "Cargando…" : "Cargar mes"}
          </button>
        </div>

        {recurring.length > 0 && (
          <ul className="mb-4 flex flex-col gap-2">
            {recurring.map((r) => (
              <li
                key={r.id}
                className="border-border flex items-center gap-2 border-b pb-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-text-primary font-body truncate text-sm font-semibold">
                    {r.description}
                  </p>
                  <p className="text-text-muted font-body text-xs">
                    {r.category?.name ?? "—"} · día {r.dayOfMonth}
                  </p>
                </div>
                <span className="text-text-primary font-body text-sm font-bold">
                  {formatARS(r.amount)}
                </span>
                <button
                  onClick={() => deactivate(r.id)}
                  className="text-error font-body text-xs"
                  title="Quitar"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={addRecurring} className="flex flex-col gap-3">
          <FieldSelect
            label="Rubro fijo *"
            value={categoryId}
            onChange={setCategoryId}
          >
            {fixedCats.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </FieldSelect>
          <FieldInput
            label="Descripción *"
            value={description}
            onChange={setDescription}
            placeholder="Alquiler local"
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <FieldInput
              label="Monto (cent.) *"
              value={amount}
              onChange={setAmount}
              type="number"
              required
            />
            <FieldInput
              label="Día del mes"
              value={dayOfMonth}
              onChange={setDayOfMonth}
              type="number"
            />
          </div>
          {error && (
            <p className="bg-error/10 text-error font-body rounded-lg px-3 py-2 text-xs">
              {error}
            </p>
          )}
          <div className="mt-1 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost flex-1 rounded-xl py-2.5 text-sm"
            >
              Cerrar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-marca flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 disabled:opacity-70"
            >
              {loading ? <Spinner size={14} /> : "Agregar"}
            </button>
          </div>
        </form>
      </div>
    </ModalBase>
  );
}

// ── Página ────────────────────────────────────────────────────
export default function Egresos() {
  const navigate = useNavigate();
  const [report, setReport] = useState<ExpenseReport | null>(null);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [recurring, setRecurring] = useState<RecurringExpense[]>([]);
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [loading, setLoading] = useState(true);
  const [expenseModal, setExpenseModal] = useState(false);
  const [purchaseModal, setPurchaseModal] = useState(false);
  const [recurringModal, setRecurringModal] = useState(false);

  function loadReport() {
    return api<ApiResponse<ExpenseReport>>("reports/expenses").then((r) =>
      setReport(r?.data ?? null),
    );
  }
  function loadRecurring() {
    return api<ApiResponse<RecurringExpense[]>>("expenses/recurring").then(
      (r) => setRecurring(r?.data ?? []),
    );
  }

  useEffect(() => {
    Promise.all([
      loadReport(),
      api<ApiResponse<ExpenseCategory[]>>("expenses/categories").then((r) =>
        setCategories(r?.data ?? []),
      ),
      loadRecurring(),
      api<ApiResponse<PaymentMethod[]>>("payment-methods").then((r) =>
        setMethods(r?.data ?? []),
      ),
      api<ApiResponse<Product[]>>("product?all=true").then((r) =>
        setProducts(r?.data ?? []),
      ),
      api<ApiResponse<Supply[]>>("supplies").then((r) =>
        setSupplies(r?.data ?? []),
      ),
    ]).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size={32} />
      </div>
    );
  }

  const byDay = (report?.byDay ?? []).map((d) => ({
    label: shortDate(d.date),
    value: d.amount,
  }));
  const byCategory = (report?.byCategory ?? []).map((c) => ({
    name: c.name,
    value: c.amount,
  }));

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        eyebrow="Finanzas · Mes actual"
        title="Egresos"
        description="Gastos por compras, insumos y costos fijos del local."
        action={
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setRecurringModal(true)}
              className="btn-ghost rounded-xl px-3 py-2 text-sm"
            >
              Gastos fijos
            </button>
            <button
              onClick={() => setPurchaseModal(true)}
              className="btn-ghost rounded-xl px-3 py-2 text-sm"
            >
              + Compra
            </button>
            <button
              onClick={() => setExpenseModal(true)}
              className="btn-marca rounded-xl px-4 py-2 text-sm"
            >
              + Gasto
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Total egresos"
          value={formatARS(report?.total ?? 0)}
          icon="🧾"
          accent
        />
        <StatCard
          label="Gastos fijos"
          value={formatARS(report?.fixed ?? 0)}
          icon="🏠"
        />
        <StatCard
          label="Gastos variables"
          value={formatARS(report?.variable ?? 0)}
          icon="📦"
        />
        <StatCard label="Movimientos" value={report?.count ?? 0} icon="🔢" />
      </div>

      {(report?.expenses.length ?? 0) === 0 ? (
        <EmptyState
          icon="🧾"
          title="Sin egresos"
          description="Registrá una compra o un gasto para empezar a ver el balance."
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <BarsCard title="Egresos por día" data={byDay} color="#e08080" />
            {byCategory.length > 0 && (
              <DonutCard title="Por rubro" data={byCategory} />
            )}
          </div>

          <div className="bg-surface border-border rounded-2xl border p-5">
            <p className="text-text-muted font-body mb-3 text-xs font-semibold tracking-wide uppercase">
              Detalle de egresos
            </p>
            <div className="flex flex-col gap-2">
              {report!.expenses.map((e) => (
                <div
                  key={e.id}
                  className="border-border flex items-center gap-3 border-b py-2 last:border-b-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-text-primary font-body truncate text-sm font-semibold">
                      {e.description}
                    </p>
                    <p className="text-text-muted font-body text-xs">
                      {e.category ?? "—"}
                      {e.kind &&
                        ` · ${e.kind === "fixed" ? "fijo" : "variable"}`}
                      {e.paymentMethod && ` · ${e.paymentMethod}`} ·{" "}
                      {new Date(e.incurredAt).toLocaleDateString("es-AR")}
                    </p>
                  </div>
                  <span className="text-error font-body shrink-0 text-sm font-bold">
                    {formatARS(e.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <button
        onClick={() => navigate("/admin")}
        className="text-text-muted font-body self-start text-sm hover:underline"
      >
        ← Volver al panel
      </button>

      <ExpenseModal
        open={expenseModal}
        onClose={() => setExpenseModal(false)}
        categories={categories}
        methods={methods}
        onSaved={loadReport}
      />
      <PurchaseModal
        open={purchaseModal}
        onClose={() => setPurchaseModal(false)}
        products={products}
        supplies={supplies}
        methods={methods}
        onSaved={loadReport}
      />
      <RecurringModal
        open={recurringModal}
        onClose={() => setRecurringModal(false)}
        categories={categories}
        recurring={recurring}
        onChanged={() => {
          loadRecurring();
          loadReport();
        }}
      />
    </div>
  );
}
