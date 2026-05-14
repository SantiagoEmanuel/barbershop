import { JWT_SECRET } from "@/constants/credentials.env";
import AvailabilityModel from "@/routes/availability/model/availability";
import ServiceModel from "@/routes/services/model/service";
import { minutesToTime, timeToMinutes } from "@/utils/availability";
import { sendEmailToClient } from "@/utils/sendMail";
import { Request, Response } from "express";
import { JwtPayload, verify } from "jsonwebtoken";
import AppointmentModel, { Appointment } from "../model/appointment";

export default class AppointmentController {
  static async create(req: Request, res: Response) {
    const {
      barberId,
      date,
      serviceId,
      startTime,
      clientName,
      clientPhone,
      notes,
    }: Appointment = req.body;
    let { clientEmail }: Appointment = req.body;
    const token = req.cookies.auth_token;
    let clientId = null;

    if (token) {
      const payload = verify(token, JWT_SECRET) as JwtPayload;
      clientId = payload.id;
      clientEmail = payload.email;
    }

    if (
      !barberId ||
      !date ||
      !serviceId ||
      !startTime ||
      !clientName ||
      !clientPhone ||
      !clientEmail
    ) {
      return res.status(400).json({
        message:
          "Por favor, verifica que la fecha, barbero y servicios estén seleccionados",
      });
    }

    try {
      const isWorkDay = await AvailabilityModel.getSlots(barberId, date);

      if (isWorkDay.length === 0) {
        return res.status(400).json({
          message: "Lo siento, no hay turnos disponibles para esa fecha",
          data: null,
        });
      }

      const service = await ServiceModel.getById(serviceId);

      if (!service) {
        return res.status(404).json({
          message: "Servicio inválido",
          data: null,
        });
      }

      const newEndTime = timeToMinutes(startTime) + service.durationMinutes;

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
        clientEmail,
        clientId,
        notes,
        endTime: minutesToTime(newEndTime),
        priceSnapshot: service.price,
      });

      if (!newAppointment) {
        return res.status(500).json({
          message: "Ha ocurrido un error al guardar tu turno",
          data: null,
        });
      }

      const appointment = await AppointmentModel.getById(newAppointment.id);

      await sendEmailToClient(appointment);

      return res.status(201).json({
        message: "Turno agendado correctamente",
        data: newAppointment,
      });
    } catch (err: any) {
      const status = typeof err.status === "number" ? err.status : 500;
      console.log({ err });
      res
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
      res
        .status(status)
        .json({ message: err.message ?? "Error interno", data: null });
    }
  }
  static async update(req: Request, res: Response) {
    const { id } = req.params;
    const { status } = req.body;
    const user = req.user;

    if (!id || !status || !user) {
      return res.status(user ? 404 : 401).json({
        message: user
          ? "Datos insuficientes"
          : "No tienes autorización para hacer eso",
        data: null,
      });
    }

    try {
      const appointmentData = await AppointmentModel.getById(id as string);

      if (!appointmentData) {
        return res.status(404).json({
          message: "Turno inexistente",
          data: null,
        });
      }

      if (user.role === "admin") {
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
      res
        .status(status)
        .json({ message: err.message ?? "Error interno", data: null });
    }
  }
  static async my(req: Request, res: Response) {
    const id = req.user!.id;

    try {
      // ¿Un usuario puede tener varios turnos el mismo día? -> R: No veo porqué impedirlo
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
      res
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
      res
        .status(status)
        .json({ message: err.message ?? "Error interno", data: null });
    }
  }
}
