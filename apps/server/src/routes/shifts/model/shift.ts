import { db } from "@/db/db";
import { shifts } from "@/db/turso/schema";
import { eq } from "drizzle-orm";

interface Props {
  register: {
    scheduleId: string;
    barberId: string;
  };
  update: {
    shiftId: string;
    barberId: string;
    scheduleId: string;
  };
  cancel: {
    shiftId: string;
  };
  verify: {
    shiftId: string;
  };
}

export default class ShiftModel {
  static async registerShift(data: Props["register"]) {
    if (!data) {
      throw new Error("Error al crear la reserva");
    }

    try {
      const [newShift] = await db.insert(shifts).values(data).returning();
      if (!newShift) {
        throw new Error("Error al crear la reserva");
      }

      return newShift;
    } catch (err: any) {
      console.error(err.message);
    }
  }
  static async updateShift(data: Props["update"]) {
    if (!data) {
      throw new Error("Error al actualizar la reserva");
    }

    try {
      const [newShift] = await db
        .update(shifts)
        .set({
          scheduleId: data.scheduleId,
          barberId: data.barberId,
        })
        .where(eq(shifts.id, data.shiftId))
        .returning();

      if (!newShift) {
        throw new Error("Error al actualizar la reserva");
      }

      return newShift;
    } catch (err: any) {
      console.error(err.message);
    }
  }
  static async cancelShift({ shiftId }: Props["cancel"]) {
    if (!shiftId) {
      throw new Error("Error al cancelar la reserva");
    }

    try {
      const [shiftCancelled] = await db
        .update(shifts)
        .set({
          isCancelled: true,
        })
        .where(eq(shifts.id, shiftId))
        .returning();

      if (!shiftCancelled.isCancelled) {
        throw new Error("Error al cancelar la reserva");
      }

      return shiftCancelled;
    } catch (err: any) {
      console.error(err.message);
    }
  }
  static async verifyShift({ shiftId }: Props["verify"]) {
    try {
      const shift = db.query.shifts.findFirst({
        where: eq(shifts.id, shiftId),
      });

      if (!shift) {
        return false;
      }

      return true;
    } catch (err: any) {
      console.error({ error: err.message });
      return false;
    }
  }
}
