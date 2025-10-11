import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Appointment {
  time: string;
  duration: string;
  patientName: string;
  treatment: string;
  status: "current" | "confirmed" | "pending";
}

interface DayCalendarViewProps {
  date: string;
  time: string;
  duration: string;
  patientName: string;
  treatment: string;
  otherAppointments?: Appointment[];
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

export const DayCalendarView = ({ date, time, duration, patientName, treatment, otherAppointments = [] }: DayCalendarViewProps) => {
  // Combine current appointment with others
  const allAppointments: Appointment[] = [
    { time, duration, patientName, treatment, status: "current" },
    ...otherAppointments
  ];
  
  const appointmentStartHour = parseTime(time);
  const durationHours = parseDuration(duration);
  
  // Always start 1 hour before the current appointment
  let startHour = Math.max(0, Math.floor(appointmentStartHour) - 1);
  // Show 3 hours total
  let endHour = Math.min(23, startHour + 3);
  
  const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => i + startHour);
  
  // Detect overlapping appointments for each hour slot
  const getAppointmentsInSlot = (hour: number) => {
    return allAppointments.map((apt, index) => {
      const aptStart = parseTime(apt.time);
      const aptDuration = parseDuration(apt.duration);
      const aptEnd = aptStart + aptDuration;
      
      if (aptStart < hour + 1 && aptEnd > hour) {
        return { ...apt, index, start: aptStart, duration: aptDuration };
      }
      return null;
    }).filter(Boolean);
  };
  
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
            const appointmentsInSlot = getAppointmentsInSlot(hour);
            const overlappingCount = appointmentsInSlot.length;
            
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
                  {appointmentsInSlot.map((apt: any, idx: number) => {
                    const isFirst = apt.start >= hour && apt.start < hour + 1;
                    
                    if (!isFirst) return null;
                    
                    const widthPercent = overlappingCount > 1 ? 100 / overlappingCount : 100;
                    const leftPercent = idx * widthPercent;
                    const widthOffset = overlappingCount > 1 ? 8 : 4;
                    
                    let bgClass = "bg-gray-200 dark:bg-gray-700";
                    let borderClass = "border-gray-400 dark:border-gray-500";
                    let textClass = "text-foreground";
                    let patternClass = "";
                    
                    if (apt.status === "current") {
                      bgClass = "bg-blue-400 dark:bg-blue-500";
                      borderClass = "border-blue-600 dark:border-blue-700";
                      textClass = "text-white dark:text-white";
                    } else if (apt.status === "confirmed") {
                      bgClass = "bg-gray-200 dark:bg-gray-700";
                      borderClass = "border-gray-400 dark:border-gray-500";
                      textClass = "text-gray-900 dark:text-gray-100";
                    } else if (apt.status === "pending") {
                      patternClass = "striped-background";
                    }
                    
                    return (
                      <div
                        key={`${apt.index}-${hour}`}
                        className={cn(
                          "absolute border-l-4 rounded-md p-2 z-10",
                          bgClass,
                          borderClass,
                          patternClass
                        )}
                        style={{
                          top: `${((apt.start - hour) * 100)}%`,
                          height: `${apt.duration * 64}px`,
                          left: overlappingCount > 1 ? `${leftPercent}%` : '8px',
                          width: overlappingCount > 1 ? `calc(${widthPercent}% - ${widthOffset}px)` : 'calc(100% - 16px)',
                        }}
                      >
                        <div className="flex flex-col h-full overflow-hidden">
                          {apt.duration >= 0.75 ? (
                            <>
                              <p className={cn("text-sm font-semibold truncate", textClass)}>
                                {apt.patientName}
                              </p>
                              <p className={cn("text-xs truncate", textClass, "opacity-90")}>
                                {apt.treatment}
                              </p>
                            </>
                          ) : (
                            <p className={cn("text-sm font-semibold truncate", textClass)}>
                              {apt.patientName} - {apt.treatment}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
