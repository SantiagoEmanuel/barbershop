import { db } from "@/db/db";
import { appointments, overbookedAppointments } from "@/db/turso/schema";
import AppError from "@/utils/AppError";
import { and, count, eq, gt, inArray, lt } from "drizzle-orm";

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no_show";

export interface Appointment {
  barberId: string;
  serviceId: string;
  clientId: string | undefined;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  priceSnapshot: number;
  startTime: string;
  endTime: string;
  date: string;
  notes: string | null;
  status: AppointmentStatus;
}

interface AppointmentProps {
  create: Appointment;
  createByAdmin: {
    serviceId: string;
    startTime: string;
    priceSnapshot: number;
    barberId: string;
    endTime: string;
    clientName: string;
    clientPhone: string;
    date: string;
  };
}

export default class AppointmentModel {
  static async getById(id: string) {
    const regular = await db.query.appointments.findFirst({
      where: eq(appointments.id, id),
      with: {
        service: true,
        barber: {
          with: {
            users: true,
          },
        },
        client: true,
      },
    });

    if (regular) return { ...regular, kind: "regular" as const };

    const extraordinary = await db.query.overbookedAppointments.findFirst({
      where: eq(overbookedAppointments.id, id),
      with: { service: true, barber: true },
    });

    if (!extraordinary) throw new AppError("Turno inexistente", 404);

    return {
      ...extraordinary,
      clientEmail: null,
      clientId: null,
      notes: null,
      kind: "extraordinary" as const,
    };
  }
  static async getByDate(barberId: string, date: string) {
    try {
      const [regular, extraordinary] = await Promise.all([
        db.query.appointments.findMany({
          where: and(
            // "all" → todos los barberos (sin filtrar por barbero ni estado),
            // necesario para que el dashboard calcule completados y facturación.
            barberId !== "all"
              ? eq(appointments.barberId, barberId as string)
              : undefined,
            eq(appointments.date, date as string),
          ),
          with: {
            service: true,
            barber: true,
            client: true,
          },
        }),
        db.query.overbookedAppointments.findMany({
          where: and(
            barberId !== "all"
              ? eq(overbookedAppointments.barberId, barberId)
              : undefined,
            eq(overbookedAppointments.date, date),
          ),
          with: { service: true, barber: true },
        }),
      ]);

      return [
        ...regular.map((appointment) => ({
          ...appointment,
          kind: "regular" as const,
        })),
        ...extraordinary.map((appointment) => ({
          ...appointment,
          clientEmail: null,
          clientId: null,
          notes: null,
          kind: "extraordinary" as const,
        })),
      ];
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
  static async createByAdmin({
    serviceId,
    startTime,
    priceSnapshot,
    barberId,
    endTime,
    clientName,
    clientPhone,
    date,
  }: AppointmentProps["createByAdmin"]) {
    const [newAppointment] = await db
      .insert(overbookedAppointments)
      .values({
        serviceId,
        startTime,
        endTime,
        priceSnapshot,
        barberId,
        clientName,
        clientPhone,
        date,
        status: "confirmed",
      })
      .returning();

    if (!newAppointment) {
      throw new AppError("No se pudo generar el turno", 404);
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
    const [regular] = await db
      .update(appointments)
      .set({
        status,
        cancelledAt: status === "cancelled" ? new Date() : null,
      })
      .where(eq(appointments.id, id as string))
      .returning();

    if (regular) return { ...regular, kind: "regular" as const };

    const [extraordinary] = await db
      .update(overbookedAppointments)
      .set({
        status,
        cancelledAt: status === "cancelled" ? new Date() : null,
      })
      .where(eq(overbookedAppointments.id, id))
      .returning();

    if (!extraordinary) {
      throw new AppError("El turno no existe en la base de datos", 400);
    }

    return { ...extraordinary, kind: "extraordinary" as const };
  }
  static async my(clientId: string) {
    const data = await db.query.appointments.findMany({
      where: eq(appointments.clientId, clientId),
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
    const [regular, extraordinary] = await Promise.all([
      db
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
        ),
      db
        .select({ count: count() })
        .from(overbookedAppointments)
        .where(
          and(
            eq(overbookedAppointments.barberId, barberId),
            eq(overbookedAppointments.date, date),
            lt(overbookedAppointments.startTime, endTime),
            gt(overbookedAppointments.endTime, startTime),
            inArray(overbookedAppointments.status, ["pending", "confirmed"]),
          ),
        ),
    ]);

    return regular[0].count + extraordinary[0].count;
  }
}
