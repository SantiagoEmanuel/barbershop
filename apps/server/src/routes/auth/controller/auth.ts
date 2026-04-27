import { JWT_SECRET } from "@/constants/credentials.env";
import AppError from "@/utils/AppError";
import { Request, Response } from "express";
import { sign, verify } from "jsonwebtoken";
import AuthModel, { User } from "../model/auth";

export default class AuthController {
  static async login(req: Request, res: Response) {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError("Credenciales inválidas", 400);
    }

    try {
      const user = await AuthModel.login(email);

      if (!AuthModel.hashVerify(password, user.password)) {
        throw new AppError("Credenciales inválidas", 400);
      }

      const token = sign(
        {
          email: user.email,
          username: user.username,
          id: user.id,
          isActive: user.isActive,
          role: user.role,
          name: user.name,
        },
        JWT_SECRET,
      );

      res.cookie("auth_token", token, {
        httpOnly: true,
        maxAge: 60 * 60 * 48 * 1000,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV !== "production" ? "lax" : "none",
      });

      return res.status(200).json({
        message: "Inicio de sesión exitoso",
        data: user,
      });
    } catch (err: any) {
      const status = err.status ?? 500;
      return res.status(status).json({
        message: err.message || "Server Error",
        data: null,
      });
    }
  }
  static async create(req: Request, res: Response) {
    const {
      name,
      email,
      username,
      password,
      role = "client",
      phone,
    } = req.body;

    if (!name || !email || !username || !password || !phone) {
      throw new AppError("Datos insuficientes para registrar un usuario", 400);
    }

    try {
      const passwordHashed = await AuthModel.hashPassword(password);

      const data = await AuthModel.create({
        username,
        name,
        email,
        role,
        phone,
        password: passwordHashed,
      });

      return res.status(201).json({
        message: "Usuario creado exitosamente",
        data: data,
      });
    } catch (err: any) {
      const status = err.status ?? 500;
      return res.status(status).json({
        message: err.message || "Server Error",
      });
    }
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
          email: user.email,
          role: user.role,
          name: user.name,
        },
        JWT_SECRET,
        {
          expiresIn: 60 * 60 * 48 * 1000,
        },
      );

      res.cookie("auth_token", newToken, {
        httpOnly: true,
        maxAge: 60 * 60 * 48 * 1000,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV !== "production" ? "lax" : "none",
      });

      return res.status(200).json({
        message: "Ok",
        data: payload,
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
