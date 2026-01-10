"use client";

import { useEffect, useState } from "react";
import { dispatch, getState, subscribe, toast } from "../lib/toast-store.ts";


export function useToast() {
    const [state, setState] = useState(getState());

    useEffect(() => subscribe(setState), []);

    return {
        ...state,
        toast,
        dismiss: (toastId?: string) =>
            dispatch({ type: "DISMISS_TOAST", toastId }),
    };
}
