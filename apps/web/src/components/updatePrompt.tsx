/// <reference types="vite-plugin-pwa/react" />
import { Button, ModalBase, SectionHeader } from "@config/components";
import { useEffect, useState } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";

export function UpdatePrompt() {
  const { needRefresh, updateServiceWorker } = useRegisterSW();
  const [open, setOpen] = useState<boolean>(true);

  useEffect(() => {
    if (needRefresh[0]) {
      setOpen(needRefresh[0]);
    }
  }, [needRefresh[0]]);

  return (
    <ModalBase onClose={() => setOpen(false)} open={open}>
      <div className="flex flex-col gap-8 p-4">
        <SectionHeader
          title="Actualización disponible"
          description="Puedes actualizar a la última versión del sistema"
        />
        <Action action={updateServiceWorker} cancel={() => setOpen(false)} />
      </div>
    </ModalBase>
  );
}

function Action({ action, cancel }: { action: () => any; cancel: () => void }) {
  return (
    <div className="flex gap-2">
      <Button
        className="bg-marca text-background cursor-pointer rounded-md px-4 py-2"
        onClick={action}
      >
        Actualizar
      </Button>
      <Button className="cursor-pointer px-4 py-2" onClick={cancel}>
        Más Tarde
      </Button>
    </div>
  );
}
