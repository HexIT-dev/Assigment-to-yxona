export type Role = "ADMIN" | "OWNER" | "USER";

export type HallStatus = "PENDING" | "APPROVED";

export type BookingStatus =
  | "PENDING"
  | "APPROVED"
  | "UPCOMING"
  | "COMPLETED"
  | "CANCELLED"
  | "REJECTED";

export type ServiceType = "SINGER" | "KARNAY" | "MENU" | "CAR" | "FOOD" | "MUSIC" | "DECOR";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  username: string;
  role: Role;
  avatarUrl?: string | null;
}

export interface HallImage {
  id: string;
  url: string;
  is360: boolean;
  hallId: string;
}

export interface HallService {
  id: string;
  type: ServiceType;
  name: string;
  price: number;
  imageUrl?: string | null;
  description?: string | null;
  hallId: string;
}

export interface Hall {
  id: string;
  name: string;
  district: string;
  address: string;
  capacity: number;
  pricePerSeat: number;
  phone: string;
  status: HallStatus;
  ownerId?: string | null;
  owner?: User | null;
  images: HallImage[];
  services: HallService[];
  bookings?: Booking[];
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  date: string;
  seats: number;
  totalPrice: number;
  advancePayment: number;
  status: BookingStatus;
  rejectReason?: string | null;
  hallId: string;
  hall?: Hall;
  userId: string;
  user?: Pick<User, "id" | "firstName" | "lastName" | "phone" | "avatarUrl">;
  services?: { id: string; serviceId: string; service: HallService }[];
  createdAt: string;
}

/* ---- Form payload shapes ---- */
export interface ServiceInput {
  type: ServiceType;
  name: string;
  price: number;
  imageUrl?: string;
  description?: string;
}

export interface HallInput {
  name: string;
  district: string;
  address: string;
  capacity: number;
  pricePerSeat: number;
  phone: string;
  images: string[];
  services: ServiceInput[];
  ownerId?: string | null;
}
