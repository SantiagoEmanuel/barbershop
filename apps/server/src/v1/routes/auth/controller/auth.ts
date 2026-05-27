import { JWT_SECRET } from "@/constants/credentials.env";
import AppError from "@/utils/AppError";
import { confirmEmail } from "@/utils/sendMail";
import { Request, Response } from "express";
import { sign, verify } from "jsonwebtoken";
import AuthModel, { User } from "../model/auth";

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
          expiresIn: 86400 * 2,
        },
      );

      return res
        .cookie("auth_token", token, {
          httpOnly: true,
          maxAge: 86400 * 2 * 1000,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV !== "production" ? "lax" : "lax",
        })
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
    const token = req.query.token as string;

    if (!id || !token) {
      return res.status(403).json({
        message: "Datos inválidos",
        data: null,
      });
    }

    try {
      const payload = verify(token, JWT_SECRET) as any;

      const userExist = await AuthModel.getById(id);
      if (!userExist) {
        throw new AppError("Usuario inexistente", 404);
      }

      const user = await AuthModel.confirm(id);

      if (!user) {
        return res.status(400).json({
          message: "No se pudo verificar tu usuario",
          data: null,
        });
      }

      if (payload.email !== user.email) {
        return res
          .status(400)
          .json({ message: "No se pudo verificar tu usuario", data: null });
      }

      const newToken = sign(
        {
          id: user.id,
          role: user.role,
          email: user.email,
        },
        JWT_SECRET,
        {
          expiresIn: 86400 * 2,
        },
      );

      return res
        .clearCookie("auth_token")
        .cookie("auth_token", newToken, {
          httpOnly: true,
          maxAge: 86400 * 2 * 1000,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV !== "production" ? "lax" : "lax",
        })
        .status(200)
        .json({
          message: "Inicio de sesión exitoso",
          data: {
            ...user,
            password: "queti",
          },
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
          expiresIn: 86400 * 2,
        },
      );

      return res
        .clearCookie("auth_token")
        .cookie("auth_token", newToken, {
          httpOnly: true,
          maxAge: 86400 * 2 * 1000,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV !== "production" ? "lax" : "lax",
        })
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
