import type {AuthContextValue} from "../models/auth.model.ts";
import {createContext} from "react";

export const AuthContext = createContext<AuthContextValue | null>(null);