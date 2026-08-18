/// <reference types="vite-plugin-pwa/react" />
import { Button, ModalBase, SectionHeader } from "@config/components";
import { useEffect, useRef, useState } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";

const UPDATE_CHECK_MS = 60 * 60 * 1000; // cada 1 hora

export function UpdatePrompt() {
  const registrationRef = useRef<ServiceWorkerRegistration | undefined>(
    undefined,
  );
  const [isUpdating, setIsUpdating] = useState(false);
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      registrationRef.current = registration;
    },
  });

  useEffect(() => {
    const checkForUpdate = () => {
      if (document.visibilityState === "visible") {
        void registrationRef.current?.update();
      }
    };

    const checkWhenBackOnline = () => checkForUpdate();
    const intervalId = window.setInterval(checkForUpdate, UPDATE_CHECK_MS);

    document.addEventListener("visibilitychange", checkForUpdate);
    window.addEventListener("online", checkWhenBackOnline);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", checkForUpdate);
      window.removeEventListener("online", checkWhenBackOnline);
    };
  }, []);

  function dismiss() {
    setNeedRefresh(false);
  }

  async function applyUpdate() {
    setIsUpdating(true);
    try {
      await updateServiceWorker();
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <ModalBase onClose={dismiss} open={needRefresh}>
      <div className="flex w-full flex-col gap-8 p-4">
        <SectionHeader
          align="center"
          title="Actualización disponible"
          description="Hay una nueva versión disponible. Actualizá para obtener las últimas mejoras."
        />
        <div className="flex items-center justify-center gap-4">
          <Button
            className="bg-marca text-background cursor-pointer rounded-md px-4 py-2 font-bold"
            disabled={isUpdating}
            onClick={applyUpdate}
          >
            {isUpdating ? "Actualizando…" : "Actualizar"}
          </Button>
          <Button
            disabled={isUpdating}
            className="cursor-pointer rounded-md border px-4 py-2 font-bold"
            onClick={dismiss}
          >
            Más tarde
          </Button>
        </div>
      </div>
    </ModalBase>
  );
}
