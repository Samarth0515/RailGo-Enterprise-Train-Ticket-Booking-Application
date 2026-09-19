import React from 'react';
import { Check } from 'lucide-react';

export const BookingStepIndicator = ({ currentStep = 1 }) => {
  const steps = [
    { number: 1, label: 'Seats' },
    { number: 2, label: 'Passengers' },
    { number: 3, label: 'Review' },
    { number: 4, label: 'Payment' },
    { number: 5, label: 'Ticket' },
  ];

  return (
    <div className="max-w-xl mx-auto mb-8 px-4">
      <div className="flex items-center justify-between relative">
        {/* Connecting line */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-slate-200 z-0"></div>
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-blue-600 transition-all duration-300 z-0"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        ></div>

        {steps.map((step) => {
          const isCompleted = step.number < currentStep;
          const isCurrent = step.number === currentStep;

          return (
            <div key={step.number} className="relative z-10 flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  isCompleted
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : isCurrent
                    ? 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-sm'
                    : 'bg-white border-2 border-slate-300 text-slate-400'
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : step.number}
              </div>
              <span
                className={`text-[11px] mt-1.5 font-semibold transition-colors ${
                  isCurrent
                    ? 'text-blue-600 font-bold'
                    : isCompleted
                    ? 'text-slate-800'
                    : 'text-slate-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
