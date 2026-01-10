import {useContext} from 'react';
import type {AuthContextValue} from '../models/auth.model';
import {AuthContext} from "./AuthContext.ts";

export const useAuth = (): AuthContextValue => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
