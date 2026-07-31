import {
  EmptyState,
  FieldInput,
  ModalBase,
  SectionHeader,
  Spinner,
} from "@config/components";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { BackTo } from "../components/backTo";
import { formatARS } from "../components/ui/formatters";
import { api, post, put } from "../lib/api";
import type { ApiResponse, Service } from "../types";

// ── Modal: editar/crear servicio ──────────────────────────────
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
        ? await put<ApiResponse<Service>>(`service/${initial.id}`, body)
        : await post<ApiResponse<Service>>("service", body);
      if (!res?.data) throw new Error("No se pudo guardar");
      onSave(res.data);
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
        <h3 className="font-display text-text-primary mb-4 text-lg font-bold">
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
            value={desc ?? ""}
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
          <p className="text-text-muted font-body text-xs">
            El precio va en centavos: $3.500 ARS = 350000
          </p>
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

// ── Página ────────────────────────────────────────────────────
export default function Servicios() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [serviceModal, setServiceModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  useEffect(() => {
    Promise.all([api<ApiResponse<Service[]>>("service?all=true")])
      .then(([sRes]) => {
        setServices(sRes?.data ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  async function toggleService(s: Service) {
    const res = await put<ApiResponse<Service>>(`service/${s.id}`, {
      isActive: !s.isActive,
    });
    if (res) {
      setServices((prev) =>
        prev.map((x) => (x.id === s.id ? { ...x, isActive: !s.isActive } : x)),
      );
      toast.success(s.isActive ? "Servicio desactivado" : "Servicio activado");
    } else {
      toast.error("No se pudo actualizar el servicio");
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size={32} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <BackTo />
      <SectionHeader
        eyebrow="Admin"
        title="Servicios"
        description="Gestioná el catálogo de servicios que ven los clientes."
        action={
          <button
            onClick={() => {
              setEditingService(null);
              setServiceModal(true);
            }}
            className="btn-marca rounded-xl px-4 py-2 text-sm"
          >
            + Nuevo servicio
          </button>
        }
      />

      {services.length === 0 ? (
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
              className={`card flex items-center gap-4 ${s.isActive ? "" : "opacity-50"}`}
            >
              <div className="bg-marca/8 border-border flex size-12 shrink-0 flex-col items-center justify-center rounded-xl border">
                <span className="text-marca font-body text-xs font-bold">
                  {s.durationMinutes}
                </span>
                <span className="text-text-muted font-body text-[9px]">
                  min
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-text-primary font-body text-sm font-bold">
                    {s.name}
                  </p>
                  {!s.isActive && (
                    <span className="bg-error/10 text-error font-body rounded-full px-2 py-0.5 text-[10px]">
                      Inactivo
                    </span>
                  )}
                </div>
                {s.description && (
                  <p className="text-text-muted font-body mt-0.5 truncate text-xs">
                    {s.description}
                  </p>
                )}
              </div>

              <div className="shrink-0 text-right">
                <p className="text-marca font-body text-sm font-bold">
                  {formatARS(s.price)}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-1.5">
                <button
                  onClick={() => {
                    setEditingService(s);
                    setServiceModal(true);
                  }}
                  className="bg-marca/6 text-text-muted border-border flex size-8 items-center justify-center rounded-lg border text-sm transition-colors duration-150"
                  title="Editar"
                >
                  ✏
                </button>
                <button
                  onClick={() => toggleService(s)}
                  className={`bg-marca/6 border-border flex size-8 items-center justify-center rounded-lg border text-xs transition-colors duration-150 ${
                    s.isActive ? "text-success" : "text-error"
                  }`}
                  title={s.isActive ? "Desactivar" : "Activar"}
                >
                  {s.isActive ? "●" : "○"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

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
    </div>
  );
}
