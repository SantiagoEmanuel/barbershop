import { Payment } from "mercadopago";
import { MPClient } from "./mpClient";

export const payment = new Payment(MPClient);
