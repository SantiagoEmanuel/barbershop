import { JWT_SECRET } from "@/constants/credentials.env";
import AppError from "@/utils/AppError";
import { confirmEmail } from "@/utils/sendMail";
import { CookieOptions, Request, Response } from "express";
import { sign, verify } from "jsonwebtoken";
import AuthModel, { User } from "../model/auth";

// Duración de la sesión. OJO con las unidades:
//   · jsonwebtoken `expiresIn` (número) → SEGUNDOS
//   · Express cookie `maxAge`           → MILISEGUNDOS
// Confundirlas hacía que la cookie expirara a los ~3 min (86400*2 ms) aunque
// el JWT durara 2 días, cortando la sesión enseguida.
const SESSION_TTL_SECONDS = 86400 * 2; // 2 días

const authCookieOptions: CookieOptions = {
  httpOnly: true,
  maxAge: SESSION_TTL_SECONDS * 1000,
  secure: process.env.NODE_ENV === "production",
  // Web y API viven bajo el mismo dominio raíz (p. ej. peko.santiagomustafa.com.ar
  // y api.peko.santiagomustafa.com.ar) → son same-site, así que usamos Lax
  // (mejor protección CSRF). Si alguna vez el front y la API quedan en dominios
  // raíz distintos (cross-site), esto debe volver a "none".
  sameSite: "lax",
};

export default class AuthController {
  static async login(req: Request, res: Response) {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Credenciales inválidas",
        data: null,
      });
    }

    try {
      const user = await AuthModel.login(email);

      if (!(await AuthModel.hashVerify(password, user.password))) {
        throw new AppError("Credenciales inválidas", 400);
      }

      const token = sign(
        {
          id: user.id,
          role: user.role,
          email: user.email,
        },
        JWT_SECRET,
        {
          expiresIn: SESSION_TTL_SECONDS,
        },
      );

      return res
        .cookie("auth_token", token, authCookieOptions)
        .status(200)
        .json({
          message: "Inicio de sesión exitoso",
          data: user,
        });
    } catch (err: any) {
      const status = err.status ?? 500;
      const message = err.message || "Server Error";
      return res.status(status).json({
        message,
        data: null,
      });
    }
  }
  static async create(req: Request, res: Response) {
    const { name, email, username, password, phone } = req.body;

    if (!name || !email || !username || !password || !phone) {
      return res.status(400).json({
        message: "Datos inválidos",
        data: null,
      });
    }

    try {
      const passwordHashed = await AuthModel.hashPassword(password);

      const data = await AuthModel.create({
        username,
        name,
        email,
        phone,
        password: passwordHashed,
      });

      confirmEmail(data);

      return res.status(201).json({
        message: "Usuario creado exitosamente",
        data: data,
      });
    } catch (err: any) {
      const status = err.status ?? 500;
      const message = err.message || "Server Error";
      return res.status(status).json({
        message,
        data: null,
      });
    }
  }
  static async confirm(req: Request, res: Response) {
    const id = req.query.id as string;

    if (!id) {
      return res.status(403).json({
        message: "Datos inválidos",
        data: null,
      });
    }

    try {
      const userExist = await AuthModel.getById(id);
      if (!userExist) {
        throw new AppError("Usuario inexistente", 404);
      }

      const check = await AuthModel.confirm(id);

      if (!check) {
        return res.status(400).json({
          message: "No se pudo verificar tu usuario",
          data: null,
        });
      }

      return res.status(200).json({
        message: "Usuario verificado correctamente",
        data: check,
      });
    } catch (err: any) {
      const status = err.status ?? 500;
      const message = err.message ?? "Server Error";
      return res.status(status).json({ message, data: null });
    }
  }
  static async logout(_req: Request, res: Response) {
    return res.clearCookie("auth_token").status(200).json({
      message: "Sesión cerrada",
      data: null,
    });
  }
  static async restoreSession(req: Request, res: Response) {
    const token = req.cookies.auth_token;

    if (!token) {
      return res.status(404).json({
        message: "Token inválido",
        data: null,
      });
    }

    try {
      const payload = verify(token, JWT_SECRET) as User;

      if (!payload) {
        throw new AppError("Token inválido", 404);
      }

      const user = await AuthModel.getById(payload.id);

      const newToken = sign(
        {
          id: user.id,
          role: user.role,
          email: user.email,
        },
        JWT_SECRET,
        {
          expiresIn: SESSION_TTL_SECONDS,
        },
      );

      return res
        .clearCookie("auth_token")
        .cookie("auth_token", newToken, authCookieOptions)
        .status(200)
        .json({
          message: "Ok",
          data: {
            ...user,
            password: "Is not for u",
          },
        });
    } catch (err: any) {
      const status = err.status ?? 500;
      const message = err.message ?? "Server Error";

      return res.status(status).json({
        message,
        data: null,
      });
    }
  }
}
