import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useAuthStore } from "../store/useAuthStore";
import type { ApiResponse, User } from "../types";
import { AuthField } from "./authField";
import { AuthSubmit } from "./authSubmit";
import { ModalBase } from "./modalBase";

export function AuthModal({
  open,
  onClose,
  defaultTab = "login",
}: {
  open: boolean;
  onClose: () => void;
  defaultTab?: "login" | "register";
}) {
  const [tab, setTab] = useState<"login" | "register">(defaultTab);
  const { setUser, setLoading, isLoading } = useAuthStore();
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setTab(defaultTab);
      setError("");
    }
  }, [open, defaultTab]);

  // ── Login ────────────────────────────────────────────────────
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api<ApiResponse<User>>(`auth`, {
        method: "POST",
        body: JSON.stringify({ email: loginEmail, password: loginPass }),
      });
      if (!res?.data) throw new Error("Email o contraseña incorrectos");
      await setUser(res.data);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  // ── Registro ─────────────────────────────────────────────────
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPass, setRegPass] = useState("");

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api<ApiResponse<User>>(`auth/create`, {
        method: "POST",
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          username: regUsername,
          phone: regPhone,
          password: regPass,
        }),
      });
      if (!res?.data) throw new Error("Error al registrarse");
      setTab("login");
      setLoginEmail(regEmail);
      setError("¡Cuenta creada! Ingresá con tu contraseña.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  }

  const isSuccessMsg = error.startsWith("¡");

  return (
    <ModalBase open={open} onClose={onClose} maxW="max-w-sm">
      {/* Pull tab móvil */}
      <div className="flex justify-center pt-3 pb-1 sm:hidden">
        <div className="bg-marca/20 h-1 w-10 rounded-full" />
      </div>

      <div className="px-6 pt-4 pb-7">
        {/* Header */}
        <div className="mb-5">
          <p className="text-marca font-body mb-1 text-xs tracking-[0.2em] uppercase">
            {tab === "login" ? "Bienvenido de vuelta" : "Unite al equipo"}
          </p>
          <h2 className="font-display text-text-primary text-2xl leading-tight font-bold">
            {tab === "login"
              ? "Ingresá a tu cuenta"
              : "Creá tu cuenta, es gratis"}
          </h2>
        </div>

        {/* Tabs */}
        <div className="mb-5 flex rounded-lg bg-black/25 p-1">
          {(["login", "register"] as const).map((t) => (
            <button
              key={t}
              onClick={() => {
                setTab(t);
                setError("");
              }}
              className={`font-body flex-1 rounded-md py-2 text-sm font-semibold transition-all duration-200 ${
                tab === t
                  ? "bg-marca text-background"
                  : "text-text-secondary/70 bg-transparent"
              }`}
            >
              {t === "login" ? "Ingresar" : "Registrarse"}
            </button>
          ))}
        </div>

        {/* Mensajes */}
        {error && (
          <div
            className={`font-body mb-4 rounded-lg border px-3 py-2.5 text-sm ${
              isSuccessMsg
                ? "bg-success/12 border-success/25 text-success"
                : "bg-error/12 border-error/25 text-error"
            }`}
          >
            {error}
          </div>
        )}

        {/* Login form */}
        {tab === "login" && (
          <form onSubmit={handleLogin} className="flex flex-col gap-3">
            <AuthField
              label="Email"
              type="email"
              placeholder="vos@email.com"
              value={loginEmail}
              onChange={setLoginEmail}
              required
            />
            <AuthField
              label="Contraseña"
              type="password"
              placeholder="••••••••"
              value={loginPass}
              onChange={setLoginPass}
              required
            />
            <AuthSubmit loading={isLoading} label="Entrar" />
          </form>
        )}

        {/* Register form */}
        {tab === "register" && (
          <form onSubmit={handleRegister} className="flex flex-col gap-3">
            <AuthField
              label="Nombre completo"
              type="text"
              placeholder="Juan Pérez"
              value={regName}
              onChange={setRegName}
              required
            />
            <div className="grid grid-cols-2 gap-3">
              <AuthField
                label="Usuario"
                type="text"
                placeholder="juanpe"
                value={regUsername}
                onChange={setRegUsername}
                required
              />
              <AuthField
                label="Teléfono"
                type="tel"
                placeholder="+54 9 351..."
                value={regPhone}
                onChange={setRegPhone}
                required
              />
            </div>
            <AuthField
              label="Email"
              type="email"
              placeholder="vos@email.com"
              value={regEmail}
              onChange={setRegEmail}
              required
            />
            <AuthField
              label="Contraseña"
              type="password"
              placeholder="Mínimo 8 caracteres"
              value={regPass}
              onChange={setRegPass}
              required
            />
            <AuthSubmit loading={isLoading} label="Crear cuenta" />
          </form>
        )}
      </div>
    </ModalBase>
  );
}
