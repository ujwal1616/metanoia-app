import { auth } from "./firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

// Register function
export function register(email: string, password: string) {
  return createUserWithEmailAndPassword(auth, email, password);
}

// Login function
export function login(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}