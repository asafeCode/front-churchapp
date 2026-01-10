const TOAST_LIMIT = 1;
const TOAST_REMOVE_DELAY = 1000000;

export type Toast = {
    id: string;
    title?: string;
    description?: string;
    open: boolean;
    onOpenChange?: (open: boolean) => void;
    [key: string]: any;
};

type ToastState = {
    toasts: Toast[];
};

type ToastAction =
    | { type: "ADD_TOAST"; toast: Toast }
    | { type: "UPDATE_TOAST"; toast: Partial<Toast> & { id: string } }
    | { type: "DISMISS_TOAST"; toastId?: string }
    | { type: "REMOVE_TOAST"; toastId?: string };

let count = 0;
const genId = () => (++count).toString();

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();
let memoryState: ToastState = { toasts: [] };
const listeners: ((state: ToastState) => void)[] = [];

export const dispatch = (action: ToastAction) => {
    memoryState = reducer(memoryState, action);
    listeners.forEach((l) => l(memoryState));
};

const addToRemoveQueue = (id: string) => {
    if (toastTimeouts.has(id)) return;

    toastTimeouts.set(
        id,
        setTimeout(() => {
            toastTimeouts.delete(id);
            dispatch({ type: "REMOVE_TOAST", toastId: id });
        }, TOAST_REMOVE_DELAY)
    );
};

export const reducer = (state: ToastState, action: ToastAction): ToastState => {
    switch (action.type) {
        case "ADD_TOAST":
            return { toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT) };

        case "UPDATE_TOAST":
            return {
                toasts: state.toasts.map((t) =>
                    t.id === action.toast.id ? { ...t, ...action.toast } : t
                ),
            };

        case "DISMISS_TOAST":
            action.toastId
                ? addToRemoveQueue(action.toastId)
                : state.toasts.forEach((t) => addToRemoveQueue(t.id));
            return {
                toasts: state.toasts.map((t) =>
                    !action.toastId || t.id === action.toastId
                        ? { ...t, open: false }
                        : t
                ),
            };

        case "REMOVE_TOAST":
            return {
                toasts: action.toastId
                    ? state.toasts.filter((t) => t.id !== action.toastId)
                    : [],
            };
    }
};

export const toast = (props: Partial<Toast>) => {
    const id = genId();

    dispatch({
        type: "ADD_TOAST",
        toast: {
            ...props,
            id,
            open: true,
            onOpenChange: (open) => !open && dispatch({ type: "DISMISS_TOAST", toastId: id }),
        } as Toast,
    });

    return {
        id,
        dismiss: () => dispatch({ type: "DISMISS_TOAST", toastId: id }),
        update: (p: Partial<Toast>) =>
            dispatch({ type: "UPDATE_TOAST", toast: { ...p, id } }),
    };
};

export const subscribe = (listener: (state: ToastState) => void) => {
    listeners.push(listener);
    return () => {
        const i = listeners.indexOf(listener);
        if (i > -1) listeners.splice(i, 1);
    };
};

export const getState = () => memoryState;
