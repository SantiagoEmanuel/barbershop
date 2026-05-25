/// <reference types="vite-plugin-pwa/react" />
import { Button, ModalBase, SectionHeader } from "@config/components";
import { useEffect, useState } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";

export function UpdatePrompt() {
  const { needRefresh, updateServiceWorker } = useRegisterSW();
  const [open, setOpen] = useState<boolean>(needRefresh[0] ?? false);

  useEffect(() => {
    if (needRefresh[0]) {
      setOpen(needRefresh[0]);
    }
  }, [needRefresh[0]]);

  return (
    <ModalBase onClose={() => setOpen(false)} open={open}>
      <SectionHeader
        title="Actualización disponible"
        description="Puedes actualizar a la última versión del sistema"
      />
      <Action action={updateServiceWorker} cancel={() => setOpen(false)} />
    </ModalBase>
  );
}

function Action({ action, cancel }: { action: () => any; cancel: () => void }) {
  return (
    <div className="flex gap-2">
      <Button onClick={action}>Actualizar</Button>
      <Button onClick={cancel}>Más Tarde</Button>
    </div>
  );
}
