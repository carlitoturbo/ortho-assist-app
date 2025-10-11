import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface DayCalendarViewProps {
  date: string;
  time: string;
  duration: string;
  patientName: string;
  treatment: string;
}

const parseTime = (timeStr: string): number => {
  const [time, period] = timeStr.split(" ");
  const [hours, minutes] = time.split(":").map(Number);
  let hour24 = hours;
  
  if (period === "PM" && hours !== 12) {
    hour24 = hours + 12;
  } else if (period === "AM" && hours === 12) {
    hour24 = 0;
  }
  
  return hour24 + minutes / 60;
};

const parseDuration = (durationStr: string): number => {
  const minutes = parseInt(durationStr);
  return minutes / 60;
};

export const DayCalendarView = ({ date, time, duration, patientName, treatment }: DayCalendarViewProps) => {
  const appointmentStartHour = parseTime(time);
  const durationHours = parseDuration(duration);
  
  // Show 1 hour before and 2 hours after the appointment
  const startHour = Math.max(0, Math.floor(appointmentStartHour) - 1);
  const endHour = Math.min(23, Math.ceil(appointmentStartHour + durationHours) + 2);
  const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => i + startHour);
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">{date}</h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Day View</span>
        </div>
      </div>
      
      <div className="border border-border rounded-lg overflow-hidden bg-background">
        <div className="relative">
          {hours.map((hour) => {
            const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
            const period = hour >= 12 ? "PM" : "AM";
            const isAppointmentSlot = appointmentStartHour >= hour && appointmentStartHour < hour + 1;
            
            return (
              <div
                key={hour}
                className={cn(
                  "flex border-b border-border last:border-b-0 relative",
                  "h-16"
                )}
              >
                <div className="w-20 flex-shrink-0 p-2 border-r border-border bg-muted/30">
                  <span className="text-xs font-medium text-muted-foreground">
                    {displayHour}:00 {period}
                  </span>
                </div>
                
                <div className="flex-1 relative">
                  {isAppointmentSlot && (
                    <div
                      className="absolute inset-x-2 bg-primary/10 border-l-4 border-primary rounded-md p-2 z-10"
                      style={{
                        top: `${((appointmentStartHour - hour) * 100)}%`,
                        height: `${durationHours * 64}px`,
                      }}
                    >
                      <div className="flex flex-col h-full">
                        <p className="text-sm font-semibold text-foreground line-clamp-1">
                          {patientName}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {treatment}
                        </p>
                        <p className="text-xs text-muted-foreground mt-auto">
                          {time} • {duration}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
