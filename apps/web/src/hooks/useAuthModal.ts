import { useContext } from "react";
import { AuthModalContext } from "../context/authModalContext";

export const useAuthModal = () => useContext(AuthModalContext);
