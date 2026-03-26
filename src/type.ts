import type React from "react";
import type { Dispatch } from "react";

export interface User {
  _id: string;
  name: string;
  email: string;
  image: string;
  role: string;
  restaurantId?: string;
}

export interface Location {
  latitude: number;
  longitude: number;
  formattedAddress?: string;
}

export interface AppContextType {
  user: User | null;
  isAuth: boolean;
  loading: boolean;
  setUser: Dispatch<React.SetStateAction<User | null>>;
  setIsAuth: Dispatch<React.SetStateAction<boolean>>;
  setLoading: Dispatch<React.SetStateAction<boolean>>;
  city: string | null;
  location: Location | null;
  loadingLocation: boolean;
  cartLoading: boolean;
  carts: ICart[] | null;
  fetchCart: () => Promise<void>;
  subtotal: number;
  cartLenth: number;
}

export interface IRestaurant {
  _id: string;
  name: string;
  description?: string;
  ownerId: string;
  image: {
    url: string;
    public_id: string;
  };
  phone: number;
  isVerified: boolean;
  autoLocation: {
    type: "Point";
    coordinates: [number, number];
    formatedAddress: string;
  };
  isOpen: boolean;
  createdAt: string;
  updatedAt: string;
  distance?: number;
}

export interface IMenuItem {
  _id: string;
  restaurantId: string;
  name: string;
  description: string;
  image: {
    url: string;
    public_id: string;
  };
  price: number;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICart extends Document {
  _id: string;
  userId: string;
  restaurantId: string | IRestaurant;
  itemId: string | IMenuItem;
  quauntity: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAddress {
  _id: string;
  userId: string;
  mobile: number;
  formattedAddress: string;
  location: {
    type: "Point";
    coordinates: [number, number];
  };
  createdAt: string;
  updatedAt: string;
}

export interface IOrder {
  _id: string;
  userId: string;
  restaurantId: string;
  restaurantName: string;

  riderId?: string | null;
  riderPhone?: number | null;
  riderName?: string | null;
  distance: number;
  riderAmount: number;

  items: {
    itemId: string;
    name: string;
    price: number;
    quantity: number;
  }[];

  subTotal: number;
  deliveryFee: number;
  platformFee: number;
  totalAmount: number;

  addressId: string;

  deliveryAddress: {
    mobile: number;
    formattedAddress: string;
    latitude: number;
    longitude: number;
  };

  status:
    | "placed"
    | "accepted"
    | "preparing"
    | "ready_for_rider"
    | "rider_assigned"
    | "picked_up"
    | "delivered"
    | "cancelled";

  paymentMethod: "razorpay" | "stripe";
  paymentStatus: "pending" | "paid" | "failed";

  expiredAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRider {
  _id: string;
  userId: string;
  picture: {
    url: string;
    public_id: string;
  };
  phoneNumber: string;
  addharNummber: string;
  drivingLicenseNumber: string;
  isVerified: boolean;
  location: {
    type: "Point";
    coordinates: [number, number];
  };
  isAvailble: boolean;
  lastActiveAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
