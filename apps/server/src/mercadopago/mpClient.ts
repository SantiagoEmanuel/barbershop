import { MP_ACCESS_TOKEN } from "@/constants/credentials.env";
import MercadoPagoConfig from "mercadopago";

export const MPClient = new MercadoPagoConfig({
  accessToken: MP_ACCESS_TOKEN,
});
