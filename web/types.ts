export interface Trip {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  imageUrl: string;
  status: 'upcoming' | 'planning' | 'past';
  daysLeft?: number;
  timeLabel?: string; // e.g., "Em 2 meses", "Faltam 15 dias"
}

export interface User {
  name: string;
  avatarUrl: string;
}

export enum AppRoute {
  WELCOME = '/',
  LIST = '/list',
  NEW_TRIP = '/new',
  LOGIN = '/login',
  PROFILE = '/profile',
  TRIP_DETAIL = '/trips/:id',
}