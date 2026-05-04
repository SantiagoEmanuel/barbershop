import { useEffect } from "react";
import { useService } from "../hooks/useService";

export default function Index() {
  const { getServices, service } = useService();

  function getData() {
    getServices();
  }

  useEffect(() => {
    getData();
  }, []);

  return (
    <>
      <section>
        <h1 className="text-center text-xl font-semibold text-balance">
          Siéntate,{" "}
          <a href="" className="text-marca">
            toma un turno
          </a>{" "}
          y déjanos el resto a nosotros
        </h1>
      </section>
      <section className="grid grid-cols-2 grid-rows-3 gap-4 rounded-2xl p-4">
        {service?.map((s) => {
          return (
            <article
              key={s.id}
              className={`bg-surface rounded-xl p-4 ${s.key === 1 ? "col-span-2 row-span-1" : "col-span-1 row-span-1"}`}
            >
              <section className="z-20 flex justify-between">
                <div>
                  <p className="text-marca text-lg font-bold">{s.name}</p>
                  <p className="text-text-secondary">{s.description}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-marca text-lg font-bold">
                    ${s.price.toLocaleString()}
                  </p>
                  <p className="text-text-secondary">{s.durationMinutes} min</p>
                </div>
              </section>
            </article>
          );
        })}
      </section>
    </>
  );
}
