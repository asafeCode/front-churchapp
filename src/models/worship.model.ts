// worship.model.ts
import { DayOfWeek } from './enums'; // Reutilizando o enum DayOfWeek já existente

// ==========================
// REQUESTS
// ==========================
export interface CreateWorshipRequest {
  dayOfWeek: DayOfWeek;
  time: string; // ISO time string ou "HH:mm:ss" (TimeSpan equivalente)
  description?: string;
}

// ==========================
// RESPONSES
// ==========================
export interface ResponseRegisteredWorship {
  id: string; // Guid convertido para string
}

export interface ResponseWorship {
  id: string;
  dayOfWeek: DayOfWeek;
  time: string; // "HH:mm:ss"
  description?: string;
}

export interface ResponseWorships {
  worships: ResponseWorship[];
}
