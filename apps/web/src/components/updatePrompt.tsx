/// <reference types="vite-plugin-pwa/react" />
import { Button, ModalBase, SectionHeader } from "@config/components";
import { useRegisterSW } from "virtual:pwa-register/react";

const UPDATE_CHECK_MS = 60 * 60 * 1000; // cada 1 hora

export function UpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      if (!registration) return;
      setInterval(() => registration.update(), UPDATE_CHECK_MS);
    },
  });

  function dismiss() {
    setNeedRefresh(false);
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
            onClick={() => updateServiceWorker(true)}
          >
            Actualizar
          </Button>
          <Button
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
