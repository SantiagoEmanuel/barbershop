import { MAILERSEND_TOKEN, PUBLIC_WEB_URL } from "@/constants/credentials.env";
import { User } from "@/v1/routes/auth/model/auth";
import { EmailParams, MailerSend, Recipient, Sender } from "mailersend";
import { formatARS, translateStatus } from "./formatters";

const mailerSend = new MailerSend({
  apiKey: MAILERSEND_TOKEN,
});

const sentFrom = new Sender(
  "santiago@test-dnvo4d9yr8xg5r86.mlsender.net",
  "PEKO BARBER",
);

type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no_show";

interface Appointment {
  id: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  date: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  priceSnapshot: number;
  notes: string | null;
  service: {
    id?: string;
    name?: string;
    durationMinutes?: number;
    price?: number;
  };
  barber: {
    id?: string;
    name?: string;
  };
  client: {
    id: string;
    name: string;
  } | null;
}

export async function confirmShift(data: Appointment) {
  if (!data) {
    return;
  }
  const recipient = [new Recipient(data.clientEmail, data.clientName)];
  // Apunta al frontend; esa página confirma el turno vía API automáticamente.
  const confirmUrl = `${PUBLIC_WEB_URL}/turno/confirmar/${data.id}`;

  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipient)
    .setReplyTo(sentFrom)
    .setSubject(`PEKO BARBER - CONFIRMA TU TURNO`)
    .setHtml(confirmShiftHTML(data, confirmUrl))
    .setText(confirmShiftTEXT(data, confirmUrl));

  await mailerSend.email.send(emailParams);
}

export function confirmEmail(data: Partial<User>) {
  if (!data) {
    return;
  }
  const recipient = [new Recipient(data.email!, data.name)];
  const confirmUrl = `https://pekobarber.com/api/auth/confirm?id=${data.id}`;

  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipient)
    .setReplyTo(sentFrom)
    .setSubject(`PEKO BARBER - CONFIRMA TU CORREO`)
    .setHtml(confirmEmailHTML(data, confirmUrl))
    .setText(confirmEmailText(data, confirmUrl));

  mailerSend.email.send(emailParams);
  return;
}

function confirmShiftHTML(data: Appointment, confirmUrl: string) {
  const formattedDate = new Date(data.date).toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return `
  <!DOCTYPE html>
  <html lang="es">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Confirmación de Turno</title>
      <style>
        .capitalize {
        text-transform: capitalize
        }
      </style>
    </head>

    <body
      style="
        margin: 0;
        padding: 0;
        background-color: #f0f0f0;
        font-family: Arial, Helvetica, sans-serif;
        color: #ffffff;
        border-radius: 24px
      "
    >
      <table
        width="100%"
        cellpadding="0"
        cellspacing="0"
        border="0"
        style="background-color: #f0f0f0; padding: 40px 16px"
      >
        <tr>
          <td align="center">
            <table
              width="100%"
              cellpadding="0"
              cellspacing="0"
              border="0"
              style="
                max-width: 600px;
                background-color: #;
                border-radius: 16px;
                overflow: hidden;
                border: 1px solid #c1c1c1;
              "
            >
              <tr>
                <td
                  align="center"
                  style="
                    padding: 40px 24px 24px;
                    background-color: #e4e6e7ff;
                    border-bottom: 1px solid #c1c1c1;
                    border-radius: 16px;
                  "
                >
                  <h1
                    style="
                      margin: 0;
                      font-size: 32px;
                      color: #000;
                      letter-spacing: 1px;
                    "
                  >
                    PEKO BARBER
                  </h1>

                  <p
                    style="
                      margin: 12px 0 0;
                      font-size: 14px;
                      color: #454545;
                    "
                  >
                    Confirmación de turno
                  </p>
                </td>
              </tr>

              <tr>
                <td style="padding: 40px 24px">
                  <p
                    style="
                      margin: 0 0 24px;
                      font-size: 18px;
                      line-height: 28px;
                      color: #000;
                    "
                  >
                    ¡Hola, <strong class="capitalize">${data.clientName}</strong>!, tu turno fue
                    registrado correctamente y actualmente se encuentra en estado
                    <strong class="capitalize">${translateStatus(data.status)}</strong>.
                  </p>

                  <table
                    width="100%"
                    cellpadding="0"
                    cellspacing="0"
                    border="0"
                    style="
                      background-color: #f9f9f9;
                      border-radius: 12px;
                      padding: 24px;
                      margin-bottom: 32px;
                    "
                  >
                    <tr>
                      <td style="padding-bottom: 16px">
                        <p
                          style="
                            margin: 0;
                            font-size: 13px;
                            color: #0f0f0f;
                            text-transform: uppercase;
                            letter-spacing: 1px;
                          "
                        >
                          Servicio
                        </p>

                        <p
                         style="
                          margin: 6px 0 0;
                          font-size: 18px;
                          color: #0f0f0f;
                          font-weight: bold;
                          text-transform: capitalize
                          "
                          class="capitalize"
                        >
                          ${data.service.name}
                        </p>
                      </td>
                    </tr>

                    <tr>
                      <td style="padding-bottom: 16px">
                        <p
                          style="
                            margin: 0;
                            font-size: 13px;
                            color: #0f0f0f;
                            text-transform: uppercase;
                            letter-spacing: 1px;
                          "
                        >
                          Barbero
                        </p>

                        <p
                          style="
                          margin: 6px 0 0;
                          font-size: 18px;
                          color: #0f0f0f;
                          font-weight: bold;
                          text-transform: capitalize
                          "
                        >
                          ${data.barber.name}
                        </p>
                      </td>
                    </tr>

                    <tr>
                      <td style="padding-bottom: 16px">
                        <p
                          style="
                            margin: 0;
                            font-size: 13px;
                            color: #0f0f0f;
                            text-transform: uppercase;
                            letter-spacing: 1px;
                          "
                        >
                          Fecha
                        </p>

                        <p
                          style="
                            margin: 6px 0 0;
                            font-size: 18px;
                            color: #0f0f0f;
                            font-weight: bold;
                          "
                          class="capitalize"
                        >
                          ${formattedDate}
                        </p>
                      </td>
                    </tr>

                    <tr>
                      <td style="padding-bottom: 16px">
                        <p
                          style="
                            margin: 0;
                            font-size: 13px;
                            color: #0f0f0f;
                            text-transform: uppercase;
                            letter-spacing: 1px;
                          "
                        >
                          Horario
                        </p>

                        <p
                          style="
                            margin: 6px 0 0;
                            font-size: 18px;
                            color: #0f0f0f;
                            font-weight: bold;
                          "
                        >
                          ${data.startTime}hs - ${data.endTime}hs
                        </p>
                      </td>
                    </tr>

                    <tr>
                      <td>
                        <p
                          style="
                            margin: 0;
                            font-size: 13px;
                            color: #0f0f0f;
                            text-transform: uppercase;
                            letter-spacing: 1px;
                          "
                        >
                          Precio
                        </p>

                        <p
                          style="
                            margin: 6px 0 0;
                            font-size: 22px;
                            color: #0f0f0f;
                            font-weight: bold;
                          "
                        >
                          ${formatARS(data.priceSnapshot)}
                        </p>
                      </td>
                    </tr>
                  </table>

                  <table
                    width="100%"
                    cellpadding="0"
                    cellspacing="0"
                    border="0"
                  >
                    <tr>
                      <td align="center">
                        <a
                          href="${confirmUrl}"
                          style="
                            display: inline-block;
                            background-color: #111111;
                            color: #e9e9e9;
                            text-decoration: none;
                            font-size: 16px;
                            font-weight: bold;
                            padding: 16px 32px;
                            border-radius: 12px;
                          "
                        >
                          Confirmar turno
                        </a>
                      </td>
                    </tr>
                  </table>

                  <p
                    style="
                      margin: 32px 0 0;
                      font-size: 12px;
                      line-height: 24px;
                      color: #9b9b9b;
                      text-align: center;
                    "
                  >
                    Si no solicitaste este turno, puedes ignorar este correo.
                  </p>
                </td>
              </tr>

              <tr>
                <td
                  align="center"
                  style="
                    padding: 24px;
                    border-top: 1px solid #c9c9c9;
                    background-color: #f0f0f0;
                  "
                >
                  <p
                    style="
                      margin: 0;
                      font-size: 12px;
                      color: #0e0e0e;
                    "
                  >
                    © 2026 PEKO BARBER · Todos los derechos reservados
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
  `;
}

function confirmShiftTEXT(data: Appointment, confirmUrl: string) {
  const formattedDate = new Date(data.date).toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return `
    PEKO BARBER

    Hola ${data.clientName}.

    Tu turno está pendiente de confirmación.

    Servicio: ${data.service.name}
    Barbero: ${data.barber.name}
    Fecha: ${formattedDate}
    Horario: ${data.startTime}hs - ${data.endTime}hs
    Precio: $${formatARS(data.priceSnapshot)}

    Confirma tu turno:
    ${confirmUrl}
  `;
}

function confirmEmailHTML(data: Partial<User>, confirmUrl: string) {
  return `
    <!DOCTYPE html>
  <html lang="es">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Confirmación de Correo</title>
      <style>
      .capitalize {
      text-transform: capitalize
      }
      </style>
    </head>

    <body
      style="
        margin: 0;
        padding: 0;
        background-color: #f0f0f0;
        font-family: Arial, Helvetica, sans-serif;
        color: #ffffff;
      "
    >
      <table
        width="100%"
        cellpadding="0"
        cellspacing="0"
        border="0"
        style="background-color: #f0f0f0; padding: 40px 16px"
      >
        <tr>
          <td align="center">
            <table
              width="100%"
              cellpadding="0"
              cellspacing="0"
              border="0"
              style="
                max-width: 600px;
                background-color: #;
                border-radius: 16px;
                overflow: hidden;
                border: 1px solid #c1c1c1;
              "
            >
              <tr>
                <td
                  align="center"
                  style="
                    padding: 40px 24px 24px;
                    background-color: #e4e6e7ff;
                    border-bottom: 1px solid #c1c1c1;
                  "
                >
                  <h1
                    style="
                      margin: 0;
                      font-size: 32px;
                      color: #000;
                      letter-spacing: 1px;
                    "
                  >
                    PEKO BARBER
                  </h1>

                  <p
                    style="
                      margin: 12px 0 0;
                      font-size: 14px;
                      color: #454545;
                    "
                  >
                    Confirmación de corre electrónico
                  </p>
                </td>
              </tr>

              <tr>
                <td style="padding: 40px 24px">
                  <p
                    style="
                      margin: 0 0 24px;
                      font-size: 18px;
                      line-height: 28px;
                      color: #000;
                    "
                  >
                    ¡Hola, <strong class="text-transform: capitalize">${data.name}</strong>!, tu cuenta ha sido creada correctamente
                  </p>
<p
                    style="
                      margin: 0 0 24px;
                      font-size: 18px;
                      line-height: 28px;
                      color: #000;
                    "
                  >
                  Nos gustaría que confirmes tu correo el electrónico
                  </p>

                  <table
                    width="100%"
                    cellpadding="0"
                    cellspacing="0"
                    border="0"
                  >
                    <tr>
                      <td align="center">
                        <a
                          href="${confirmUrl}"
                          style="
                            display: inline-block;
                            background-color: #111111;
                            color: #e9e9e9;
                            text-decoration: none;
                            font-size: 16px;
                            font-weight: bold;
                            padding: 16px 32px;
                            border-radius: 12px;
                          "
                        >
                          Confirmar Correo
                        </a>
                      </td>
                    </tr>
                  </table>

                  <p
                    style="
                      margin: 32px 0 0;
                      font-size: 12px;
                      line-height: 24px;
                      color: #9b9b9b;
                      text-align: center;
                    "
                  >
                    Si no creaste tu cuenta en <a href="https://pekobarber.com.ar" style="text-decoration: none; color: #4a4a4a">pekobarber</a> desestima este correo.
                  </p>
                </td>
              </tr>

              <tr>
                <td
                  align="center"
                  style="
                    padding: 24px;
                    border-top: 1px solid #c9c9c9;
                    background-color: #f0f0f0;
                  "
                >
                  <p
                    style="
                      margin: 0;
                      font-size: 12px;
                      color: #0e0e0e;
                    "
                  >
                    © 2026 PEKO BARBER · Todos los derechos reservados
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
  
  `;
}

function confirmEmailText(data: Partial<User>, confirmUrl: string) {
  return `
  Hola ${data.name}!

  Tu cuenta ha sido creada correctamente, te pedimos que confirmes tu correo electrónico haciendo click en el siguiente enlace

  confirmar correo: ${confirmUrl}
  `;
}
