import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useAuthStore } from "../store/useAuthStore";
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
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api(`auth`, {
        method: "POST",
        body: JSON.stringify({
          email: loginEmail,
          password: loginPass,
        }),
      });
      setUser(res.data);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  }
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
      const res = await api(`auth/create`, {
        method: "POST",
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          username: regUsername,
          phone: regPhone,
          password: regPass,
        }),
      });
      if (!res.data) throw new Error("Error al registrarse");
      setTab("login");
      setLoginEmail(regEmail);
      setError("¡Cuenta creada! Ingresá con tu contraseña.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  }
  return (
    <ModalBase open={open} onClose={onClose} maxW="max-w-sm">
      {}
      <div className="flex justify-center pt-3 pb-1 sm:hidden">
        <div
          className="h-1 w-10 rounded-full"
          style={{
            background: "rgba(248,223,176,0.2)",
          }}
        />
      </div>

      <div className="px-6 pt-4 pb-7">
        {}
        <div className="mb-5">
          <p
            className="mb-1 text-xs tracking-[0.2em] uppercase"
            style={{
              color: "#F8DFB0",
              fontFamily: "'Nunito', sans-serif",
            }}
          >
            {tab === "login" ? "Bienvenido de vuelta" : "Unite al equipo"}
          </p>
          <h2
            className="text-2xl leading-tight"
            style={{
              fontFamily: "'Fraunces', serif",
              color: "#EFEEDE",
              fontWeight: 700,
            }}
          >
            {tab === "login"
              ? "Ingresá a tu cuenta"
              : "Creá tu cuenta, es gratis"}
          </h2>
        </div>

        {}
        <div
          className="mb-5 flex rounded-lg p-1"
          style={{
            background: "rgba(0,0,0,0.25)",
          }}
        >
          {(["login", "register"] as const).map((t) => (
            <button
              key={t}
              onClick={() => {
                setTab(t);
                setError("");
              }}
              className="flex-1 rounded-md py-2 text-sm transition-all duration-200"
              style={{
                fontFamily: "'Nunito', sans-serif",
                fontWeight: 600,
                background: tab === t ? "#F8DFB0" : "transparent",
                color: tab === t ? "#272630" : "rgba(203,197,193,0.7)",
              }}
            >
              {t === "login" ? "Ingresar" : "Registrarse"}
            </button>
          ))}
        </div>

        {}
        {error && (
          <div
            className="mb-4 rounded-lg px-3 py-2.5 text-sm"
            style={{
              background: error.startsWith("¡")
                ? "rgba(134,197,134,0.12)"
                : "rgba(220,100,100,0.12)",
              border: `1px solid ${error.startsWith("¡") ? "rgba(134,197,134,0.25)" : "rgba(220,100,100,0.25)"}`,
              color: error.startsWith("¡") ? "#86c586" : "#e08080",
              fontFamily: "'Nunito', sans-serif",
            }}
          >
            {error}
          </div>
        )}

        {}
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

        {}
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
