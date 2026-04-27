import { db } from "@/db/db";
import { appointments } from "@/db/turso/schema";
import AppError from "@/utils/AppError";
import { and, count, eq, gt, inArray, lt } from "drizzle-orm";

export interface Appointment {
  barberId: string;
  serviceId: string;
  clientId: string | undefined;
  clientName: string;
  clientPhone: string;
  priceSnapshot: number;
  startTime: string;
  endTime: string;
  date: string;
  notes: string | undefined;
}

interface AppointmentProps {
  create: Appointment;
}

export default class AppointmentModel {
  static async getById(id: string) {
    const data = await db.query.appointments.findFirst({
      where: eq(appointments.id, id),
    });

    if (!data) {
      throw new AppError("Turno inexistente", 404);
    }

    return data;
  }
  static async getByDate(barberId: string, date: string) {
    try {
      const data = await db.query.appointments.findMany({
        where: and(
          eq(appointments.barberId, barberId as string),
          eq(appointments.date, date as string),
        ),
        with: {
          service: true,
          barber: true,
          client: true,
        },
      });
      return data;
    } catch (err: any) {
      throw new AppError(
        err.message || "Ha ocurrido un error al obtener los turnos solicitados",
        500,
      );
    }
  }
  static async create(data: AppointmentProps["create"]) {
    const [newAppointment] = await db
      .insert(appointments)
      .values(data)
      .returning();

    if (!newAppointment) {
      throw new AppError("No se pudo guardar el turno", 404);
    }

    return newAppointment;
  }
  static async update(
    status:
      | "pending"
      | "confirmed"
      | "completed"
      | "cancelled"
      | "no_show"
      | undefined,
    id: string,
  ) {
    const [dataUpdated] = await db
      .update(appointments)
      .set({
        status,
        cancelledAt: status === "cancelled" ? new Date() : null,
      })
      .where(eq(appointments.id, id as string))
      .returning();

    if (!dataUpdated) {
      throw new AppError("El turno no existe en al base de datos", 400);
    }

    return dataUpdated;
  }
  static async my(clientId: string) {
    const data = await db.query.appointments.findMany({
      where: and(eq(appointments.clientId, clientId)),
      orderBy: (appointments, { desc }) => [
        desc(appointments.date),
        desc(appointments.startTime),
      ],
      with: {
        service: true,
        barber: true,
      },
    });

    return data;
  }
  static async verifyConflict(
    barberId: string,
    date: string,
    startTime: string,
    endTime: string,
  ) {
    const [data] = await db
      .select({ count: count() })
      .from(appointments)
      .where(
        and(
          eq(appointments.barberId, barberId),
          eq(appointments.date, date),
          lt(appointments.startTime, endTime), // a.startTime < endTime
          gt(appointments.endTime, startTime), // a.endTime > startTime
          inArray(appointments.status, ["pending", "confirmed"]), // Solo turnos que bloquean
        ),
      );

    return data.count;
  }
}
