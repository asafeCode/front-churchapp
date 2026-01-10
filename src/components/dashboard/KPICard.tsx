import {cn} from "../../lib/utils.ts";
import React from "react";


type Trend = {
  type: 'up' | 'down';
  value: string | number;
  label: string;
};

interface KPICardProps {
  title: string;
  value: string | number;
  icon?: React.ComponentType<{ className?: string }>;
  trend?: Trend;
  className?: string;
  testId?: string;
}

export const KPICard = ({ title, value, icon: Icon, trend, className, testId }: KPICardProps) => {
  return (
    <div
      className={cn(
        'bg-white p-3 sm:p-4 md:p-6 border-l-4 border-emerald-700 shadow-sm rounded-md overflow-hidden',
        className
      )}
      data-testid={testId}
    >
      <div className="flex items-start justify-between gap-3 min-w-0">
        <div className="min-w-0">
          <p className="text-[10px] sm:text-xs text-stone-500 uppercase tracking-widest mb-1 sm:mb-2 truncate">
            {title}
          </p>

          <p className="font-heading font-semibold text-stone-900 text-base sm:text-lg md:text-xl lg:text-2xl truncate">
            {value}
          </p>

          {trend && (
            <p className="text-xs sm:text-sm text-stone-600 mt-1 sm:mt-2 truncate">
              <span className={trend.type === 'up' ? 'text-green-600' : 'text-red-600'}>
                {trend.value}
              </span>{' '}
              {trend.label}
            </p>
          )}
        </div>

        {Icon && (
          <div className="shrink-0 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-emerald-100 rounded-md flex items-center justify-center">
            <Icon className="w-4 h-4 sm:w-6 sm:h-6 md:w-6 md:h-6 text-emerald-700 max-w-full max-h-full" />
          </div>
        )}
      </div>
    </div>
  );
};
