import { hasPermission, PERMISSIONS } from "@/middleware/permissions";
import { minutesToTime, timeToMinutes } from "@/utils/availability";
import { confirmShift } from "@/utils/sendMail";
import AuthModel from "@/v1/auth/model/auth";
import AvailabilityModel from "@/v1/availability/model/availability";
import BarberModel from "@/v1/barber/model/barber";
import ServiceModel from "@/v1/services/model/service";
import { isValidBusinessDate } from "@config/utils";
import { Request, Response } from "express";
import { z } from "zod";
import AppointmentModel from "../model/appointment";

const appointmentCreateSchema = z
  .object({
    barberId: z.string().trim().min(1).max(100),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    serviceId: z.string().trim().min(1).max(100),
    startTime: z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/),
    clientName: z.string().trim().min(2).max(120).optional(),
    clientPhone: z.string().trim().min(6).max(30).optional(),
    clientEmail: z.string().trim().email().max(254).optional(),
    notes: z.string().trim().max(500).optional(),
    appointmentType: z.enum(["appointment", "walk_in"]).default("appointment"),
  })
  .strict();

export default class AppointmentController {
  static async create(req: Request, res: Response) {
    const parsed = appointmentCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message:
          "Datos de turno inválidos; no se aceptan estados ni precios del cliente",
        data: null,
      });
    }

    const {
      barberId,
      date,
      serviceId,
      startTime,
      notes,
      clientEmail: requestedEmail,
      appointmentType,
    } = parsed.data;
    const user = req.user;
    const isOverbook = appointmentType === "walk_in";

    if (isOverbook && !user) {
      return res.status(401).json({
        message: "Debes iniciar sesión para crear un sobre turno",
        data: null,
      });
    }

    if (
      isOverbook &&
      user &&
      !hasPermission(user.role, PERMISSIONS.APPOINTMENTS_OVERBOOK)
    ) {
      return res.status(403).json({
        message: "Solo un barbero o administrador puede crear un sobre turno",
        data: null,
      });
    }

    try {
      if (!isValidBusinessDate(date)) {
        return res.status(400).json({ message: "Fecha inválida", data: null });
      }

      const barber = await BarberModel.getById(barberId);
      if (!barber || !barber.isActive) {
        return res
          .status(404)
          .json({ message: "Barbero inválido", data: null });
      }

      const service = await ServiceModel.getById(serviceId);

      if (!service || !service.isActive) {
        return res.status(404).json({
          message: "Servicio inválido",
          data: null,
        });
      }

      const newEndTime = timeToMinutes(startTime) + service.durationMinutes;
      if (newEndTime > 24 * 60) {
        return res
          .status(400)
          .json({ message: "El turno excede el horario válido", data: null });
      }

      let clientName = parsed.data.clientName;
      let clientPhone = parsed.data.clientPhone;
      let clientEmail = requestedEmail ?? user?.email;
      let clientId: string | undefined;

      // Para clientes autenticados, la identidad persistida siempre sale de la
      // cuenta actual; el frontend no puede suplantar nombre, teléfono o email.
      if (user?.role === "client") {
        const account = await AuthModel.getById(user.id);
        clientName = account.name;
        clientPhone = account.phone;
        clientEmail = account.email;
        clientId = account.id;
      }

      if (!clientName || !clientPhone || (!isOverbook && !clientEmail)) {
        return res.status(400).json({
          message: "Los datos de contacto del cliente son obligatorios",
          data: null,
        });
      }

      // Un sobre turno se crea deliberadamente fuera de la grilla de slots y
      // puede solaparse con otro turno. No debe pasar por availability.
      if (isOverbook) {
        const newAppointment = await AppointmentModel.createByAdmin({
          barberId,
          date,
          serviceId,
          startTime,
          clientName,
          clientPhone,
          endTime: minutesToTime(newEndTime),
          priceSnapshot: service.price,
        });

        return res.status(201).json({
          message: "Sobre turno agendado correctamente",
          data: newAppointment,
        });
      }

      const availableSlots = await AvailabilityModel.getSlots(barberId, date);

      if (!availableSlots.some((slot) => slot.startTime === startTime)) {
        return res.status(400).json({
          message: "El horario solicitado no está disponible",
          data: null,
        });
      }

      const conflict = await AppointmentModel.verifyConflict(
        barberId,
        date,
        startTime,
        minutesToTime(newEndTime),
      );

      if (conflict > 0) {
        return res.status(409).json({
          message: "Lo sentimos, justo alguien acaba de reservar ese turno",
          data: null,
        });
      }

      const newAppointment = await AppointmentModel.create({
        barberId,
        date,
        serviceId,
        startTime,
        clientName,
        clientPhone,
        clientEmail: clientEmail ?? "",
        clientId,
        notes,
        endTime: minutesToTime(newEndTime),
        priceSnapshot: service.price,
      });

      const appointment = await AppointmentModel.getById(newAppointment.id);

      await confirmShift(appointment);

      return res.status(201).json({
        message: "Turno agendado correctamente",
        data: newAppointment,
      });
    } catch (err: any) {
      const status = typeof err.status === "number" ? err.status : 500;
      return res
        .status(status)
        .json({ message: err.message ?? "Error interno", data: null });
    }
  }
  static async get(req: Request, res: Response) {
    const { date, barberId } = req.query;

    if (!date || !barberId) {
      return res.status(404).json({
        message: "Debes completar los campos",
        data: null,
      });
    }

    try {
      const appointmentsForToday = await AppointmentModel.getByDate(
        barberId as string,
        date as string,
      );

      if (appointmentsForToday.length === 0) {
        return res.status(200).json({
          message: "No tienes turnos hoy",
          data: [],
        });
      }

      return res.status(200).json({
        message: "Tienes turnos hoy",
        data: appointmentsForToday,
      });
    } catch (err: any) {
      const status = typeof err.status === "number" ? err.status : 500;
      return res
        .status(status)
        .json({ message: err.message ?? "Error interno", data: null });
    }
  }
  static async update(req: Request, res: Response) {
    const { id } = req.params;
    const parsed = z
      .object({
        status: z.enum([
          "pending",
          "confirmed",
          "completed",
          "cancelled",
          "no_show",
        ]),
      })
      .strict()
      .safeParse(req.body);
    const user = req.user;

    if (!id || !parsed.success || !user) {
      return res.status(user ? 404 : 401).json({
        message: user
          ? "Estado de turno inválido"
          : "No tienes autorización para hacer eso",
        data: null,
      });
    }
    const { status } = parsed.data;

    try {
      const appointmentData = await AppointmentModel.getById(id as string);

      if (!appointmentData) {
        return res.status(404).json({
          message: "Turno inexistente",
          data: null,
        });
      }

      if (hasPermission(user.role, PERMISSIONS.APPOINTMENTS_UPDATE_ANY)) {
        const appointmentUpdate = await AppointmentModel.update(
          status,
          id as string,
        );

        return res.status(200).json({
          message: "El turno ha sido modificado",
          data: appointmentUpdate,
        });
      } else {
        if (status === "cancelled" && appointmentData.clientId === user.id) {
          const appointmentUpdate = await AppointmentModel.update(
            status,
            id as string,
          );

          return res.status(200).json({
            message: "Tu turno ha sido cancelado",
            data: appointmentUpdate,
          });
        }

        return res.status(403).json({
          message: "No tienes autorización para hacer eso",
          data: null,
        });
      }
    } catch (err: any) {
      const status = typeof err.status === "number" ? err.status : 500;
      return res
        .status(status)
        .json({ message: err.message ?? "Error interno", data: null });
    }
  }
  /**
   * Confirmación pública desde el link del email (cliente sin sesión).
   * El id es un UUID no adivinable → oficia de token de capacidad.
   * Solo transiciona pending → confirmed; idempotente si ya está confirmado.
   */
  static async confirm(req: Request, res: Response) {
    const id = req.params.id as string;

    if (!id) {
      return res.status(400).json({ message: "Turno inválido", data: null });
    }

    try {
      const appointment = await AppointmentModel.getById(id);

      if (appointment.status === "confirmed") {
        return res.status(200).json({
          message: "Tu turno ya estaba confirmado",
          data: appointment,
        });
      }

      if (appointment.status !== "pending") {
        return res.status(409).json({
          message: "Este turno ya no puede confirmarse",
          data: null,
        });
      }

      await AppointmentModel.update("confirmed", id);
      const confirmed = await AppointmentModel.getById(id);

      return res.status(200).json({
        message: "Turno confirmado",
        data: confirmed,
      });
    } catch (err: any) {
      const status = typeof err.status === "number" ? err.status : 500;
      return res
        .status(status)
        .json({ message: err.message ?? "Error interno", data: null });
    }
  }
  static async my(req: Request, res: Response) {
    const id = req.user!.id;

    try {
      const appointmentData = await AppointmentModel.my(id);

      if (appointmentData.length === 0) {
        return res.status(200).json({
          message: "No tienes turnos registrados",
        });
      }

      return res.status(200).json({
        message: "Historial de turnos",
        data: appointmentData,
      });
    } catch (err: any) {
      const status = typeof err.status === "number" ? err.status : 500;
      return res
        .status(status)
        .json({ message: err.message ?? "Error interno", data: null });
    }
  }
  static async getById(req: Request, res: Response) {
    const id = req.params.id as string;

    if (!id) {
      return res.status(404).json({
        message: "Turno inexistente",
        data: null,
      });
    }

    try {
      const data = await AppointmentModel.getById(id);

      if (!data) {
        return res.status(404).json({
          message: "Turno inexistente",
          data: null,
        });
      }

      return res.status(200).json({
        message: "Turno encontrado",
        data,
      });
    } catch (err: any) {
      const status = typeof err.status === "number" ? err.status : 500;
      return res
        .status(status)
        .json({ message: err.message ?? "Error interno", data: null });
    }
  }
}
