import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSearchParams } from "react-router";
import { api } from "../lib/api";
import { useAuthStore } from "../store/useAuthStore";
import type { ApiResponse, User } from "../types";

export default function ConfirmUser() {
  const [isConfirm, setIsConfirm] = useState(false);
  const [searchParams] = useSearchParams();
  const setUser = useAuthStore((u) => u.setUser);
  const user = useAuthStore((u) => u.user);

  const id = searchParams.get("id");
  const token = searchParams.get("token");

  useEffect(() => {
    toast.success("La cuenta se está verificando");

    if (isConfirm) return;
    api<ApiResponse<User>>(`auth/confirm?id=${id}&token=${token}`).then(
      (response) => {
        if (!response?.data) {
          return;
        }
        console.log({ response });

        setIsConfirm(response?.data ? true : false);
        setUser(response.data);
      },
    );
  }, [isConfirm]);

  if (!isConfirm) {
    return <h1 className="text-center">LO SENTIMOS, ALGO SALIÓ MAL.</h1>;
  }

  return (
    <section className="bg-surface m-auto mt-30 flex max-w-xl flex-col gap-4 rounded-xl p-4 text-center text-balance">
      <h1 className="text-center text-xl text-balance">
        ¡Gracias,{" "}
        <span className="text-success text-lg font-black">TODO LISTO</span>!
      </h1>
      <p className="text-lg">
        <span className="font-bold capitalize">{user?.name}</span> has
        verificado tu correo electrónico
      </p>{" "}
      <p className="text-center text-lg text-balance">
        {user?.email}, ha sido verificado como tu correo electrónico
      </p>
    </section>
  );
}
