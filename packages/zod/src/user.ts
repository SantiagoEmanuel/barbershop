import { object, string } from "zod";

export const userSchema = object({
  id: string(),
});
