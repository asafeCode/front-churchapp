import {
    UserRole,
    ExpenseType,
    InflowType,
    PaymentMethod,
    Gender,
    DayOfWeek, InflowOrderBy, OrderDirection,
} from './enums';

/* =========================
   Payment Method
========================= */
export const PaymentMethodLabels = {
  [PaymentMethod.FISICO]: 'Físico',
  [PaymentMethod.DIGITAL]: 'Digital',
} as const;

export const getPaymentMethodLabel = (value: PaymentMethod): string =>
  PaymentMethodLabels[value] ?? `Método ${value}`;

/* =========================
   Inflow Type
========================= */
export const InflowTypeLabels = {
  [InflowType.DIZIMO]: 'Dízimo',
  [InflowType.OFERTA]: 'Oferta',
  [InflowType.OUTROS]: 'Outros',
} as const;

export const getInflowTypeLabel = (value: InflowType): string =>
  InflowTypeLabels[value] ?? `Tipo ${value}`;

/* =========================
   Expense Type
========================= */
export const ExpenseTypeLabels = {
  [ExpenseType.FIXA]: 'Fixa',
  [ExpenseType.VARIAVEL]: 'Variável',
  [ExpenseType.PARCELADA]: 'Parcelada',
} as const;

export const getExpenseTypeLabel = (value: ExpenseType): string =>
  ExpenseTypeLabels[value] ?? `Tipo ${value}`;

/* =========================
   User Role
========================= */
export const UserRoleLabels = {
  [UserRole.ADMINISTRADOR]: 'Administrador',
  [UserRole.MEMBRO]: 'Membro',
  [UserRole.VISITANTE]: 'Visitante',
} as const;

export const getUserRoleLabel = (value: UserRole): string =>
  UserRoleLabels[value] ?? `Role ${value}`;

/* =========================
   Gender
========================= */
export const GenderLabels = {
  [Gender.MASCULINO]: 'Masculino',
  [Gender.FEMININO]: 'Feminino',
} as const;

export const getGenderLabel = (value: Gender): string =>
  GenderLabels[value] ?? `Gênero ${value}`;

/* =========================
   Day Of Week
========================= */
export const DayOfWeekLabels = {
  [DayOfWeek.DOMINGO]: 'Domingo',
  [DayOfWeek.SEGUNDA]: 'Segunda-feira',
  [DayOfWeek.TERCA]: 'Terça-feira',
  [DayOfWeek.QUARTA]: 'Quarta-feira',
  [DayOfWeek.QUINTA]: 'Quinta-feira',
  [DayOfWeek.SEXTA]: 'Sexta-feira',
  [DayOfWeek.SABADO]: 'Sábado',
} as const;

export const getDayOfWeekLabel = (value: DayOfWeek): string =>
  DayOfWeekLabels[value] ?? `Dia ${value}`;

export const InflowOrderByLabels = {
    [InflowOrderBy.DATA]: 'Data',
    [InflowOrderBy.VALOR]: 'Valor',
} as const;

export const OrderDirectionLabels = {
    [OrderDirection.CRESCENTE]: 'Crescente',
    [OrderDirection.DECRESCENTE]: 'Decrescente',
} as const;

export const getInflowOrderByLabel = (value: InflowOrderBy): string =>
    InflowOrderByLabels[value] ?? `Ordenado por ${value}`;