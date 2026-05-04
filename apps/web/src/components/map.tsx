import { LocationEditIcon } from "lucide-react";

export default function Map() {
  return (
    <section className="col-span-2 flex w-full flex-col items-center justify-center gap-2">
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d883.5988144508341!2d-62.41710463039775!3d-27.64324029851372!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x943914e35e8b7a15%3A0x3754848992c28417!2sSarmiento%20221-253%2C%20G3740%20Quimili%2C%20Santiago%20del%20Estero!5e0!3m2!1ses!2sar!4v1777498667896!5m2!1ses!2sar"
        loading="lazy"
        className="h-44 w-full overflow-hidden rounded-3xl transition-all md:h-60"
      ></iframe>
      <div className="flex gap-1">
        <LocationEditIcon /> <h2 className="font-bold">Sarmiento 221</h2>
      </div>
    </section>
  );
}
