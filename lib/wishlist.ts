
import { Timestamp } from "firebase/firestore";

export interface Wishlist {
  uid: string;
  age: string;
  gender: string;
  wishlist: {
    large: string;
    medium: string;
    small: string;
  };
  claimedBy?: string;
  claimedAt?: Timestamp;
}
