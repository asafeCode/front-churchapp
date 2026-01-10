import {Link, useLocation} from 'react-router-dom';
import {
    ArrowDownCircle,
    ArrowUpCircle, BarChart3,
    Building2, Cake,
    Church,
    LayoutDashboard,
    LogOut,
    Receipt,
    User,
    UserPlus,
} from 'lucide-react';
import {useAuth} from "../../contexts/useAuth.ts";
import {cn} from "../../lib/utils.ts";


interface SidebarProps {
    open: boolean;
    onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({open, onClose}) => {
    const location = useLocation();
    const {isMember, isAdmin, isOwner, logout} = useAuth();

    const getActiveBgColor = (itemName: string) => {
        switch (itemName) {
            case "Saídas":
                return 'bg-red-700 text-white';
            case "Perfil":
                return 'bg-blue-700 text-white';
            case "Aniversários":
                return 'bg-gradient-to-br from-pink-400 to-orange-400 text-white shadow-lg ' +
                    'shadow-pink-200 hover:shadow-pink-300 transition-all duration-300 relative overflow-hidden ' +
                    'before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 ' +
                    'before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-1000';
            default:
                return 'bg-emerald-700 text-white';
        }
    }

    if (isOwner) {
        return (
            <>
                {open && (
                    <div
                        className="fixed inset-0 bg-black/50 z-40 md:hidden"
                        onClick={onClose}
                    />
                )}
                <aside
                    className={cn(
                        "fixed inset-y-0 left-0 w-64 bg-stone-900 text-stone-50 z-50 transform transition-transform duration-300",
                        open ? "translate-x-0" : "-translate-x-full",
                        "md:translate-x-0"
                    )}
                >
                    <div className="flex flex-col h-full">
                        <div className="p-6 border-b border-stone-800">
                            <h1 className="text-2xl font-heading font-semibold tracking-tight">
                                Tesouraria
                            </h1>
                            <p className="text-xs text-stone-400 mt-1 uppercase tracking-widest">
                                Sistema de Gestão
                            </p>
                        </div>

                        <nav className="flex-1 p-4">
                            <Link
                                to="/tenants"
                                className={cn(
                                    'flex items-center gap-3 px-4 py-3 rounded-md',
                                    location.pathname.startsWith('/tenants')
                                        ? 'bg-emerald-700 text-white'
                                        : 'text-stone-300 hover:bg-stone-800'
                                )}
                            >
                                <Building2 className="w-5 h-5"/>
                                <span>Tenants</span>
                            </Link>
                        </nav>

                        <div className="p-4 border-t border-stone-800">
                            <button
                                onClick={logout}
                                className="flex items-center gap-3 px-4 py-3 w-full rounded-md text-stone-300 hover:bg-red-900/20 hover:text-red-400"
                            >
                                <LogOut className="w-5 h-5"/>
                                <span>Sair</span>
                            </button>
                        </div>
                    </div>
                </aside>
            </>
        );
    }

    if (isMember) {
        const navigation = [
            {name: 'Perfil', href: '/profile', icon: User},
        ];

        return (
            <>
                {open && (
                    <div
                        className="fixed inset-0 bg-black/50 z-40 md:hidden"
                        onClick={onClose}
                    />
                )}

                <aside
                    className={cn(
                        'fixed top-0 left-0 bottom-0 w-64 bg-stone-900 text-stone-50 z-50',
                        open ? 'translate-x-0' : '-translate-x-full',
                        'md:translate-x-0 transition-transform'
                    )}
                >
                    {/* 🔝 Cabeçalho com título e subtítulo */}
                    <div className="p-6 border-b border-stone-800">
                        <h1 className="text-2xl font-heading font-semibold tracking-tight">
                            Tesouraria
                        </h1>
                        <p className="text-xs text-stone-400 mt-1 uppercase tracking-widest">
                            Sistema de Gestão
                        </p>
                    </div>

                    <nav className="p-4 space-y-1 overflow-y-auto">
                        {navigation.map((item) => {
                            const active = location.pathname.startsWith(item.href);

                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={cn(
                                        'flex items-center gap-3 px-4 py-3 rounded-md',
                                        active
                                            ? getActiveBgColor(item.name)
                                            : 'text-stone-300 hover:bg-stone-800'
                                    )}
                                >
                                    <item.icon className="w-5 h-5"/>
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="p-4 border-t border-stone-800">
                        <button
                            onClick={logout}
                            className="flex items-center gap-3 px-4 py-3 w-full rounded-md text-stone-300 hover:bg-red-900/20 hover:text-red-400"
                        >
                            <LogOut className="w-5 h-5"/>
                            <span>Sair</span>
                        </button>
                    </div>
                </aside>
            </>
        )
    }
    if (isAdmin) {
        const navigation = [
            {name: 'Painel', href: '/dashboard', icon: LayoutDashboard},
            {name: 'Entradas', href: '/inflows', icon: ArrowDownCircle},
            {name: 'Saídas', href: '/outflows', icon: ArrowUpCircle},
            {name: 'Despesas', href: '/expenses', icon: Receipt},
            {name: 'Cultos', href: '/worships', icon: Church},
            {name: 'Aniversários', href: '/birthdays', icon: Cake},
            {name: 'Membros', href: '/members', icon: UserPlus},
            {name: 'Relatórios', href: '/reports', icon: BarChart3},
            {name: 'Perfil', href: '/profile', icon: User},
        ];

        return (
            <>
                {open && (
                    <div
                        className="fixed inset-0 bg-black/50 z-40 md:hidden"
                        onClick={onClose}
                    />
                )}

                <aside
                    className={cn(
                        'fixed top-0 left-0 bottom-0 w-64 bg-stone-900 text-stone-50 z-50',
                        open ? 'translate-x-0' : '-translate-x-full',
                        'md:translate-x-0 transition-transform'
                    )}
                >
                    {/* 🔝 Cabeçalho com título e subtítulo */}
                    <div className="p-6 border-b border-stone-800">
                        <h1 className="text-2xl font-heading font-semibold tracking-tight">
                            Tesouraria
                        </h1>
                        <p className="text-xs text-stone-400 mt-1 uppercase tracking-widest">
                            Sistema de Gestão
                        </p>
                    </div>

                    <nav className="p-4 space-y-1 overflow-y-auto">
                        {navigation.map((item) => {
                            const active = location.pathname.startsWith(item.href);

                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={cn(
                                        'flex items-center gap-3 px-4 py-3 rounded-md',
                                        active
                                            ? getActiveBgColor(item.name)
                                            : 'text-stone-300 hover:bg-stone-800'
                                    )}
                                >
                                    <item.icon className="w-5 h-5"/>
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="p-4 border-t border-stone-800">
                        <button
                            onClick={logout}
                            className="flex items-center gap-3 px-4 py-3 w-full rounded-md text-stone-300 hover:bg-red-900/20 hover:text-red-400"
                        >
                            <LogOut className="w-5 h-5"/>
                            <span>Sair</span>
                        </button>
                    </div>
                </aside>
            </>
        );
    }
    ;
}

