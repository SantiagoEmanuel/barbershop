import z, { array, boolean, number, object, string } from "zod";
const serviceSchema = object({
  id: string(),
  name: string(),
  isActive: boolean(),
  createdAt: string(),
  description: string().nullable(),
  price: number(),
  durationMinutes: number(),
  key: number(),
});

const serviceArraySchema = array(serviceSchema);

export const checkServiceValid = (input: unknown) =>
  serviceSchema.safeParse(input);

export const checkArrayIsValid = (input: unknown[]) => {
  const check = serviceArraySchema.safeParse(input);

  if (!check.success) {
    throw new Error("Error en los datos obtenidos");
  }

  return check.data;
};

export type Service = z.infer<typeof serviceSchema>;
