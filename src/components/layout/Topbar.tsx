import {User, Menu } from 'lucide-react';

import type { JSX } from 'react';
import {useAuth} from "../../contexts/useAuth.ts";
import { Button } from "../ui/button.tsx";
import {useNavigate} from "react-router-dom";

interface TopbarProps {
  onMenuClick: () => void;
}

export const Topbar = ({ onMenuClick }: TopbarProps): JSX.Element => {
  const { user, isOwner, isAdmin } = useAuth();
  const navigate = useNavigate();

  return (
    <header
      className="
        fixed top-0 left-0 right-0
        h-18 md:h-16 pt-4 pb-3
        bg-white/80 backdrop-blur-md
        border-b border-stone-200
        z-40
        md:ml-64
      "
      data-testid="topbar"
    >
      <div className="h-full px-4 md:px-6 flex items-center justify-between">
        {/* ESQUERDA */}
        <div className="flex items-center gap-3">
          {/* ☰ Mobile */}
          < Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="md:hidden"
          >
            <Menu className="w-6 h-6" />
          </Button>

          <div className="leading-tight">
            <h2 className="text-base md:text-xl font-heading font-semibold text-stone-900">
              Bem-vindo, {user?.name || 'Usuário'}
            </h2>
            <p className="text-xs md:text-sm text-stone-500">
              {isOwner ? 'Dono' : isAdmin ? "Administrador" : "Membro"}
            </p>
          </div>
        </div>

        {/* DIREITA */}
        <div className="flex items-center gap-2 md:gap-3">
          <button onClick={() => navigate('/profile')} className="hidden sm:flex items-center gap-2 px-3 py-2 bg-stone-100 rounded-md">
            <div className="w-8 h-8 bg-emerald-700 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <span className="font-medium text-sm">
              {user?.name || 'Usuário'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
