import { createClient } from "@libsql/client";
import { hashSync } from "bcrypt";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema.js";
import {
  barbers,
  barberSchedules,
  paymentMethods,
  services,
  users,
} from "./schema.js";

// ─── Config ──────────────────────────────────────────────────
// Ejecutar con: npx tsx apps/server/src/db/turso/seed.ts
// Requiere TURSO_URL y TURSO_TOKEN en el entorno (o .env)
import { config } from "dotenv";
config();

const client = createClient({
  url: process.env.TURSO_URL!,
  authToken: process.env.TURSO_TOKEN!,
});

const db = drizzle(client, { schema });

// ─── Helpers ──────────────────────────────────────────────────
const SALT = 10;

function hash(password: string) {
  return hashSync(password, SALT);
}

// ─── Data ─────────────────────────────────────────────────────

const USERS = [
  {
    name: "Admin Principal",
    email: "admin@barbershop.com",
    username: "admin",
    password: hash("Admin1234!"),
    role: "admin" as const,
    phone: "+5493512000001",
    isActive: true,
  },
  {
    name: "Carlos Pérez",
    email: "carlos@gmail.com",
    username: "carlos_p",
    password: hash("Cliente123!"),
    role: "client" as const,
    phone: "+5493512000002",
    isActive: true,
  },
  {
    name: "Lucía Fernández",
    email: "lucia@gmail.com",
    username: "luci_f",
    password: hash("Cliente123!"),
    role: "client" as const,
    phone: "+5493512000003",
    isActive: true,
  },
];

const BARBERS = [
  {
    name: "Juan Rodríguez",
    slug: "juan-rodriguez",
    bio: "Especialista en cortes clásicos y degradados. 8 años de experiencia.",
    experienceYears: 8,
    isActive: true,
  },
  {
    name: "Matías López",
    slug: "matias-lopez",
    bio: "Referente en cortes modernos y diseño de barba.",
    experienceYears: 5,
    isActive: true,
  },
  {
    name: "Diego Morales",
    slug: "diego-morales",
    bio: "Maestro barbero con formación internacional.",
    experienceYears: 12,
    isActive: true,
  },
];

const SERVICES = [
  {
    name: "Corte clásico",
    description: "Corte tijera o máquina con terminación prolija.",
    price: 350000, // $3.500 ARS en centavos
    durationMinutes: 30,
    isActive: true,
  },
  {
    name: "Corte + barba",
    description: "Corte completo más arreglo y diseño de barba.",
    price: 550000, // $5.500 ARS
    durationMinutes: 50,
    isActive: true,
  },
  {
    name: "Degradado",
    description: "Fade o degradado con máquina, acabado a mano.",
    price: 400000, // $4.000 ARS
    durationMinutes: 40,
    isActive: true,
  },
  {
    name: "Diseño de barba",
    description: "Perfilado, recorte y diseño de barba exclusivamente.",
    price: 250000, // $2.500 ARS
    durationMinutes: 20,
    isActive: true,
  },
  {
    name: "Lavado + corte",
    description: "Lavado de cabello con productos premium y corte a elección.",
    price: 480000, // $4.800 ARS
    durationMinutes: 45,
    isActive: true,
  },
];

const PAYMENT_METHODS = [
  { name: "Efectivo", type: "cash" as const, isActive: true },
  { name: "Débito / Crédito", type: "card" as const, isActive: true },
  { name: "Mercado Pago", type: "online" as const, isActive: true },
];

// lunes=1 … sábado=6 (domingo=0 libre)
// Slots de 30 min, 09:00 – 19:00
function weekdaySchedule(barberId: string) {
  return [1, 2, 3, 4, 5, 6].map((day) => ({
    barberId,
    dayOfWeek: day,
    startTime: day === 6 ? "09:00" : "09:00",
    endTime: day === 6 ? "14:00" : "19:00", // sábados medio día
    slotDurationMinutes: 30,
    isActive: true,
  }));
}

// ─── Main ─────────────────────────────────────────────────────
async function seed() {
  console.log("🌱  Iniciando seed...\n");

  // 1. Usuarios
  console.log("👤  Insertando usuarios...");
  const insertedUsers = await db
    .insert(users)
    .values(USERS)
    .onConflictDoNothing()
    .returning({ id: users.id, email: users.email });
  console.log(`    ${insertedUsers.length} usuarios insertados`);

  // 2. Barberos
  console.log("✂️   Insertando barberos...");
  const insertedBarbers = await db
    .insert(barbers)
    .values(BARBERS)
    .onConflictDoNothing()
    .returning({ id: barbers.id, slug: barbers.slug });
  console.log(`    ${insertedBarbers.length} barberos insertados`);

  // 3. Servicios
  console.log("📋  Insertando servicios...");
  const insertedServices = await db
    .insert(services)
    .values(SERVICES)
    .onConflictDoNothing()
    .returning({ id: services.id, name: services.name });
  console.log(`    ${insertedServices.length} servicios insertados`);

  // 4. Métodos de pago
  console.log("💳  Insertando métodos de pago...");
  const insertedPM = await db
    .insert(paymentMethods)
    .values(PAYMENT_METHODS)
    .onConflictDoNothing()
    .returning({ id: paymentMethods.id });
  console.log(`    ${insertedPM.length} métodos de pago insertados`);

  // 5. Horarios de barberos
  console.log("📅  Insertando horarios...");
  let scheduleCount = 0;
  for (const barber of insertedBarbers) {
    const schedules = weekdaySchedule(barber.id);
    const result = await db
      .insert(barberSchedules)
      .values(schedules)
      .onConflictDoNothing()
      .returning({ id: barberSchedules.id });
    scheduleCount += result.length;
  }
  console.log(`    ${scheduleCount} horarios insertados`);

  // ── Resumen ──────────────────────────────────────────────────
  console.log("\n✅  Seed completado:\n");
  console.log("  Credenciales de prueba:");
  console.log("  ├─ admin@barbershop.com  / Admin1234!   (rol: admin)");
  console.log("  ├─ carlos@gmail.com      / Cliente123!  (rol: client)");
  console.log("  └─ lucia@gmail.com       / Cliente123!  (rol: client)\n");
  console.log("  Barberos:", insertedBarbers.map((b) => b.slug).join(", "));
  console.log("  Servicios:", insertedServices.map((s) => s.name).join(", "));

  process.exit(0);
}

seed().catch((err) => {
  console.error("❌  Error en el seed:", err);
  process.exit(1);
});
