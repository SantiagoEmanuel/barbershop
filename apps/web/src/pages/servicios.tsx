import { useEffect, useState } from "react";
import { ModalBase } from "../components/modalBase";
import { EmptyState } from "../components/ui/emptyState";
import { formatARS } from "../components/ui/formatters";
import { SectionHeader } from "../components/ui/sectionHeader";
import { Spinner } from "../components/ui/spinner";
import { api, post, put } from "../lib/api";
interface Service {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  durationMinutes: number;
  isActive: boolean;
  key?: number;
}
interface Product {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  stock: number;
  isActive: boolean;
}
type Tab = "services" | "products";
function FieldInput({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label
        className="text-xs font-semibold tracking-wide uppercase"
        style={{
          color: "var(--color-text-muted)",
          fontFamily: "var(--font-body)",
        }}
      >
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-xl px-3.5 py-2.5 text-sm transition-all duration-200 outline-none"
        style={{
          background: "rgba(0,0,0,0.3)",
          border: "1px solid var(--color-border)",
          color: "var(--color-text-primary)",
          fontFamily: "var(--font-body)",
        }}
        onFocus={(e) => {
          e.target.style.borderColor = "var(--color-border-strong)";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "var(--color-border)";
        }}
      />
    </div>
  );
}
function ServiceModal({
  open,
  onClose,
  initial,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  initial?: Service | null;
  onSave: (s: Service) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [desc, setDesc] = useState(initial?.description ?? "");
  const [price, setPrice] = useState(String(initial?.price ?? ""));
  const [duration, setDuration] = useState(
    String(initial?.durationMinutes ?? ""),
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (open) {
      setName(initial?.name ?? "");
      setDesc(initial?.description ?? "");
      setPrice(String(initial?.price ?? ""));
      setDuration(String(initial?.durationMinutes ?? ""));
      setError("");
    }
  }, [open, initial]);
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const body = {
        name,
        description: desc || undefined,
        price: Number(price),
        durationMinutes: Number(duration),
      };
      const res = initial
        ? await put<{
            data: Service;
          }>(`service/${initial.id}`, body)
        : await post<{
            data: Service;
          }>("service", body);
      if (!res) throw new Error("No se pudo guardar");
      onSave(
        (
          res as {
            data: Service;
          }
        ).data,
      );
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  }
  return (
    <ModalBase open={open} onClose={onClose} maxW="max-w-sm">
      <div className="px-6 py-5">
        <h3
          className="mb-4 text-lg font-bold"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--color-text-primary)",
          }}
        >
          {initial ? "Editar servicio" : "Nuevo servicio"}
        </h3>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <FieldInput
            label="Nombre *"
            value={name}
            onChange={setName}
            required
          />
          <FieldInput
            label="Descripción"
            value={desc}
            onChange={setDesc}
            placeholder="Opcional"
          />
          <div className="grid grid-cols-2 gap-3">
            <FieldInput
              label="Precio (centavos) *"
              value={price}
              onChange={setPrice}
              type="number"
              placeholder="350000"
              required
            />
            <FieldInput
              label="Duración (min) *"
              value={duration}
              onChange={setDuration}
              type="number"
              placeholder="30"
              required
            />
          </div>
          <p
            className="text-xs"
            style={{
              color: "var(--color-text-muted)",
              fontFamily: "var(--font-body)",
            }}
          >
            El precio va en centavos: $3.500 ARS = 350000
          </p>
          {error && (
            <p
              className="rounded-lg px-3 py-2 text-xs"
              style={{
                background: "rgba(220,100,100,0.1)",
                color: "var(--color-error)",
                fontFamily: "var(--font-body)",
              }}
            >
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
              className="btn-marca flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5"
              style={{
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? <Spinner size={14} /> : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </ModalBase>
  );
}
function ProductModal({
  open,
  onClose,
  initial,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  initial?: Product | null;
  onSave: (p: Product) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [desc, setDesc] = useState(initial?.description ?? "");
  const [price, setPrice] = useState(String(initial?.price ?? ""));
  const [stock, setStock] = useState(String(initial?.stock ?? ""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (open) {
      setName(initial?.name ?? "");
      setDesc(initial?.description ?? "");
      setPrice(String(initial?.price ?? ""));
      setStock(String(initial?.stock ?? "0"));
      setError("");
    }
  }, [open, initial]);
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const body = {
        name,
        description: desc || undefined,
        price: Number(price),
        stock: Number(stock),
      };
      const res = initial
        ? await put<{
            data: Product;
          }>(`product/${initial.id}`, body)
        : await post<{
            data: Product;
          }>("product", body);
      if (!res) throw new Error("No se pudo guardar");
      onSave(
        (
          res as {
            data: Product;
          }
        ).data,
      );
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  }
  return (
    <ModalBase open={open} onClose={onClose} maxW="max-w-sm">
      <div className="px-6 py-5">
        <h3
          className="mb-4 text-lg font-bold"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--color-text-primary)",
          }}
        >
          {initial ? "Editar producto" : "Nuevo producto"}
        </h3>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <FieldInput
            label="Nombre *"
            value={name}
            onChange={setName}
            required
          />
          <FieldInput
            label="Descripción"
            value={desc}
            onChange={setDesc}
            placeholder="Opcional"
          />
          <div className="grid grid-cols-2 gap-3">
            <FieldInput
              label="Precio (centavos) *"
              value={price}
              onChange={setPrice}
              type="number"
              required
            />
            <FieldInput
              label="Stock inicial *"
              value={stock}
              onChange={setStock}
              type="number"
              required
            />
          </div>
          {error && (
            <p
              className="rounded-lg px-3 py-2 text-xs"
              style={{
                background: "rgba(220,100,100,0.1)",
                color: "var(--color-error)",
                fontFamily: "var(--font-body)",
              }}
            >
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
              className="btn-marca flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5"
              style={{
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? <Spinner size={14} /> : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </ModalBase>
  );
}
export default function Servicios() {
  const [tab, setTab] = useState<Tab>("services");
  const [services, setServices] = useState<Service[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [serviceModal, setServiceModal] = useState(false);
  const [productModal, setProductModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  useEffect(() => {
    Promise.all([
      api<{
        data: Service[];
      }>("service?all=true"),
      api<{
        data: Product[];
      }>("product?all=true"),
    ])
      .then(([sRes, pRes]) => {
        setServices(sRes?.data ?? []);
        setProducts(pRes?.data ?? []);
      })
      .finally(() => setLoading(false));
  }, []);
  async function toggleService(s: Service) {
    const res = await put<{
      data: Service;
    }>(`service/${s.id}`, {
      isActive: !s.isActive,
    });
    if (res)
      setServices((prev) =>
        prev.map((x) =>
          x.id === s.id
            ? {
                ...x,
                isActive: !s.isActive,
              }
            : x,
        ),
      );
  }
  async function toggleProduct(p: Product) {
    const res = await put<{
      data: Product;
    }>(`product/${p.id}`, {
      isActive: !p.isActive,
    });
    if (res)
      setProducts((prev) =>
        prev.map((x) =>
          x.id === p.id
            ? {
                ...x,
                isActive: !p.isActive,
              }
            : x,
        ),
      );
  }
  // async function removeService(id: string) {
  //   if (!confirm("¿Desactivar este servicio?")) return;
  //   await del(`service/${id}`);
  //   setServices((prev) =>
  //     prev.map((s) =>
  //       s.id === id
  //         ? {
  //             ...s,
  //             isActive: false,
  //           }
  //         : s,
  //     ),
  //   );
  // }
  // async function removeProduct(id: string) {
  //   if (!confirm("¿Desactivar este producto?")) return;
  //   await del(`product/${id}`);
  //   setProducts((prev) =>
  //     prev.map((p) =>
  //       p.id === id
  //         ? {
  //             ...p,
  //             isActive: false,
  //           }
  //         : p,
  //     ),
  //   );
  // }
  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size={32} />
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        eyebrow="Admin"
        title="Servicios y Productos"
        description="Gestioná el catálogo que ven los clientes."
        action={
          <button
            onClick={() => {
              if (tab === "services") {
                setEditingService(null);
                setServiceModal(true);
              } else {
                setEditingProduct(null);
                setProductModal(true);
              }
            }}
            className="btn-marca rounded-xl px-4 py-2 text-sm"
          >
            + Nuevo {tab === "services" ? "servicio" : "producto"}
          </button>
        }
      />

      {}
      <div
        className="flex rounded-xl p-1"
        style={{
          background: "rgba(0,0,0,0.25)",
          border: "1px solid var(--color-border)",
          width: "fit-content",
        }}
      >
        {(["services", "products"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="rounded-lg px-5 py-2 text-sm font-bold transition-all duration-200"
            style={{
              fontFamily: "var(--font-body)",
              background: tab === t ? "var(--color-marca)" : "transparent",
              color: tab === t ? "#272630" : "var(--color-text-muted)",
            }}
          >
            {t === "services"
              ? `Servicios (${services.length})`
              : `Productos (${products.length})`}
          </button>
        ))}
      </div>

      {}
      {tab === "services" &&
        (services.length === 0 ? (
          <EmptyState
            icon="✂️"
            title="Sin servicios"
            description="Creá el primer servicio para que los clientes puedan reservar."
          />
        ) : (
          <div className="flex flex-col gap-2.5">
            {services.map((s) => (
              <div
                key={s.id}
                className="card flex items-center gap-4"
                style={{
                  opacity: s.isActive ? 1 : 0.5,
                }}
              >
                {}
                <div
                  className="flex size-12 shrink-0 flex-col items-center justify-center rounded-xl"
                  style={{
                    background: "rgba(248,223,176,0.08)",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  <span
                    className="text-xs font-bold"
                    style={{
                      color: "var(--color-marca)",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    {s.durationMinutes}
                  </span>
                  <span
                    className="text-[9px]"
                    style={{
                      color: "var(--color-text-muted)",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    min
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p
                      className="text-sm font-bold"
                      style={{
                        color: "var(--color-text-primary)",
                        fontFamily: "var(--font-body)",
                      }}
                    >
                      {s.name}
                    </p>
                    {!s.isActive && (
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px]"
                        style={{
                          background: "rgba(224,128,128,0.1)",
                          color: "var(--color-error)",
                          fontFamily: "var(--font-body)",
                        }}
                      >
                        Inactivo
                      </span>
                    )}
                  </div>
                  {s.description && (
                    <p
                      className="mt-0.5 truncate text-xs"
                      style={{
                        color: "var(--color-text-muted)",
                        fontFamily: "var(--font-body)",
                      }}
                    >
                      {s.description}
                    </p>
                  )}
                </div>

                <div className="shrink-0 text-right">
                  <p
                    className="text-sm font-bold"
                    style={{
                      color: "var(--color-marca)",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    {formatARS(s.price)}
                  </p>
                </div>

                {}
                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    onClick={() => {
                      setEditingService(s);
                      setServiceModal(true);
                    }}
                    className="flex size-8 items-center justify-center rounded-lg text-sm transition-colors duration-150"
                    style={{
                      background: "rgba(248,223,176,0.06)",
                      color: "var(--color-text-muted)",
                      border: "1px solid var(--color-border)",
                    }}
                    title="Editar"
                  >
                    ✏
                  </button>
                  <button
                    onClick={() => toggleService(s)}
                    className="flex size-8 items-center justify-center rounded-lg text-xs transition-colors duration-150"
                    style={{
                      background: "rgba(248,223,176,0.06)",
                      color: s.isActive
                        ? "var(--color-success)"
                        : "var(--color-error)",
                      border: "1px solid var(--color-border)",
                    }}
                    title={s.isActive ? "Desactivar" : "Activar"}
                  >
                    {s.isActive ? "●" : "○"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ))}
      {tab === "products" &&
        (products.length === 0 ? (
          <EmptyState
            icon="📦"
            title="Sin productos"
            description="Agregá productos para vender en mostrador."
          />
        ) : (
          <div className="flex flex-col gap-2.5">
            {products.map((p) => (
              <div
                key={p.id}
                className="card flex items-center gap-4"
                style={{
                  opacity: p.isActive ? 1 : 0.5,
                }}
              >
                {}
                <div
                  className="flex size-12 shrink-0 flex-col items-center justify-center rounded-xl"
                  style={{
                    background:
                      p.stock === 0
                        ? "rgba(224,128,128,0.08)"
                        : "rgba(134,197,134,0.08)",
                    border: `1px solid ${p.stock === 0 ? "rgba(224,128,128,0.2)" : "rgba(134,197,134,0.2)"}`,
                  }}
                >
                  <span
                    className="text-sm font-bold"
                    style={{
                      color:
                        p.stock === 0
                          ? "var(--color-error)"
                          : "var(--color-success)",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    {p.stock}
                  </span>
                  <span
                    className="text-[9px]"
                    style={{
                      color: "var(--color-text-muted)",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    stock
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p
                      className="text-sm font-bold"
                      style={{
                        color: "var(--color-text-primary)",
                        fontFamily: "var(--font-body)",
                      }}
                    >
                      {p.name}
                    </p>
                    {!p.isActive && (
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px]"
                        style={{
                          background: "rgba(224,128,128,0.1)",
                          color: "var(--color-error)",
                          fontFamily: "var(--font-body)",
                        }}
                      >
                        Inactivo
                      </span>
                    )}
                  </div>
                  {p.description && (
                    <p
                      className="mt-0.5 truncate text-xs"
                      style={{
                        color: "var(--color-text-muted)",
                        fontFamily: "var(--font-body)",
                      }}
                    >
                      {p.description}
                    </p>
                  )}
                </div>

                <div className="shrink-0 text-right">
                  <p
                    className="text-sm font-bold"
                    style={{
                      color: "var(--color-marca)",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    {formatARS(p.price)}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    onClick={() => {
                      setEditingProduct(p);
                      setProductModal(true);
                    }}
                    className="flex size-8 items-center justify-center rounded-lg text-sm transition-colors duration-150"
                    style={{
                      background: "rgba(248,223,176,0.06)",
                      color: "var(--color-text-muted)",
                      border: "1px solid var(--color-border)",
                    }}
                    title="Editar"
                  >
                    ✏
                  </button>
                  <button
                    onClick={() => toggleProduct(p)}
                    className="flex size-8 items-center justify-center rounded-lg text-xs transition-colors duration-150"
                    style={{
                      background: "rgba(248,223,176,0.06)",
                      color: p.isActive
                        ? "var(--color-success)"
                        : "var(--color-error)",
                      border: "1px solid var(--color-border)",
                    }}
                    title={p.isActive ? "Desactivar" : "Activar"}
                  >
                    {p.isActive ? "●" : "○"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ))}

      {}
      <ServiceModal
        open={serviceModal}
        onClose={() => setServiceModal(false)}
        initial={editingService}
        onSave={(s) => {
          setServices((prev) =>
            editingService
              ? prev.map((x) => (x.id === s.id ? s : x))
              : [...prev, s],
          );
        }}
      />
      <ProductModal
        open={productModal}
        onClose={() => setProductModal(false)}
        initial={editingProduct}
        onSave={(p) => {
          setProducts((prev) =>
            editingProduct
              ? prev.map((x) => (x.id === p.id ? p : x))
              : [...prev, p],
          );
        }}
      />
    </div>
  );
}
