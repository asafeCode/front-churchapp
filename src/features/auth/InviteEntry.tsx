// src/features/auth/InviteEntry.tsx
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { tenantService } from "../../services/tenant.service.ts";
import { toast } from "sonner";

export function InviteEntry() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const code = searchParams.get("Code");
        if (!code) {
            toast.error("Código de convite ausente.");
            navigate("/login");
            return;
        }

        const verifyCode = async () => {
            try {
                const res = await tenantService.verifyInvite(code);

                if (!res.isValid) {
                    navigate("/login");
                    return;
                }

                navigate("/register", {
                    state: {
                        inviteCode: res.code,
                        tenantName: res.tenantName,
                    },
                    replace: true
                });
            } catch {
                navigate("/login");
            }
        };

        verifyCode();
    }, [navigate, searchParams]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-stone-50">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
                <p className="mt-4 text-stone-600">Validando seu convite...</p>
            </div>
        </div>
    );
}