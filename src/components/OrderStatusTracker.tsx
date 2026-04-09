import { Clock, ChefHat, Bike, CheckCircle2 } from 'lucide-react';

const steps = [
  { label: 'รอดำเนินการ', icon: Clock },
  { label: 'กำลังเตรียม', icon: ChefHat },
  { label: 'กำลังจัดส่ง', icon: Bike },
  { label: 'สำเร็จ', icon: CheckCircle2 },
];

interface OrderStatusTrackerProps {
  currentStep?: number; // 0-3
}

const OrderStatusTracker = ({ currentStep = 0 }: OrderStatusTrackerProps) => {
  return (
    <div className="w-full bg-secondary/60 backdrop-blur-sm border-b">
      <div className="container flex items-center justify-between py-2 px-4">
        {steps.map((step, i) => {
          const Icon = step.icon;
          const isActive = i === currentStep;
          const isDone = i < currentStep;
          const isBike = step.icon === Bike && isActive;

          return (
            <div key={step.label} className="flex flex-col items-center gap-0.5 relative">
              {/* connector line */}
              {i > 0 && (
                <div
                  className={`absolute top-3 -left-[calc(50%+8px)] w-[calc(100%-16px)] h-0.5 ${
                    isDone ? 'bg-primary' : 'bg-border'
                  }`}
                  style={{ width: '40px', left: '-28px' }}
                />
              )}
              <div
                className={`relative flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : isDone
                    ? 'bg-primary/70 text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isBike ? 'animate-motorcycle-move' : ''}`} />
              </div>
              <span className={`text-[10px] leading-tight ${isActive ? 'font-bold text-primary' : 'text-muted-foreground'}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderStatusTracker;
