export interface Schedule {
  id?: string;
  dayOfWeek: number; // 0 = domingo
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
  isActive: boolean;
  startBreak: string;
  endBreak: string;
}

export interface Barber {
  id: string;
  name: string;
  slug: string;
  bio?: string | null;
  avatarUrl?: string | null;
  experienceYears?: number | null;
  isActive?: boolean;
  schedules: Schedule[];
}
