import { Clock, CheckCheck, ChefHat, PackageCheck, Bike, Home } from 'lucide-react';

const steps = [
  { label: 'รอดำเนินการ', icon: Clock },
  { label: 'ยืนยันแล้ว', icon: CheckCheck },
  { label: 'กำลังเตรียม', icon: ChefHat },
  { label: 'พร้อมจัดส่ง', icon: PackageCheck },
  { label: 'กำลังจัดส่ง', icon: Bike },
  { label: 'ส่งถึงแล้ว', icon: Home },
];

interface OrderStatusTrackerProps {
  currentStep?: number; // 0-5
}

const OrderStatusTracker = ({ currentStep = 0 }: OrderStatusTrackerProps) => {
  return (
    <div className="w-full rounded-lg bg-secondary/60 backdrop-blur-sm border">
      <div className="flex items-start justify-between gap-1 py-3 px-2 sm:px-4">
        {steps.map((step, i) => {
          const Icon = step.icon;
          const isActive = i === currentStep;
          const isDone = i < currentStep;
          const isBike = step.icon === Bike && isActive;

          return (
            <div key={step.label} className="flex flex-1 flex-col items-center gap-1 relative">
              {i > 0 && (
                <div
                  className={`absolute top-3 right-1/2 h-0.5 w-full ${
                    isDone || isActive ? 'bg-primary' : 'bg-border'
                  }`}
                />
              )}
              <div
                className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : isDone
                    ? 'bg-primary/70 text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isBike ? 'animate-motorcycle-move' : ''}`} />
              </div>
              <span className={`text-[10px] text-center leading-tight ${isActive ? 'font-bold text-primary' : 'text-muted-foreground'}`}>
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
