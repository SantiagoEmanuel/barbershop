import { create } from "zustand";

export interface Barber {
  id: string;
  name: string;
  slug: string;
  bio?: string;
  experienceYears?: number;
}

export interface Service {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  durationMinutes: number;
  key?: number;
}

export interface Slot {
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
}

export type BookingStep = 1 | 2 | 3 | 4 | 5;

interface BookingState {
  isOpen: boolean;
  step: BookingStep;

  barberId: string;
  barberName: string;

  serviceId: string;
  serviceName: string;
  servicePrice: number;
  serviceDuration: number; // minutos

  date: string;
  startTime: string;

  clientName: string;
  clientPhone: string;
  notes: string;

  // Acciones
  openModal: () => void;
  closeModal: () => void;
  setStep: (step: BookingStep) => void;
  setBarber: (id: string, name: string) => void;
  setService: (
    id: string,
    name: string,
    price: number,
    duration: number,
  ) => void;
  setDate: (date: string) => void;
  setSlot: (startTime: string) => void;
  setClient: (name: string, phone: string, notes: string) => void;
  reset: () => void;
}

const defaultState = {
  isOpen: false,
  step: 1 as BookingStep,
  barberId: "",
  barberName: "",
  serviceId: "",
  serviceName: "",
  servicePrice: 0,
  serviceDuration: 0,
  date: "",
  startTime: "",
  clientName: "",
  clientPhone: "",
  notes: "",
};

export const useBookingStore = create<BookingState>((set) => ({
  ...defaultState,

  openModal: () => set({ isOpen: true, step: 1 }),
  closeModal: () => set({ isOpen: false }),
  setStep: (step) => set({ step }),
  setBarber: (id, name) => set({ barberId: id, barberName: name }),
  setService: (id, name, price, duration) =>
    set({
      serviceId: id,
      serviceName: name,
      servicePrice: price,
      serviceDuration: duration,
    }),
  setDate: (date) => set({ date }),
  setSlot: (startTime) => set({ startTime }),
  setClient: (clientName, clientPhone, notes) =>
    set({ clientName, clientPhone, notes }),
  reset: () => set(defaultState),
}));
