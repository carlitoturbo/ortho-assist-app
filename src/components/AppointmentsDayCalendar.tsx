import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";

interface Appointment {
  id: number;
  time: string;
  duration: string;
  patient: string;
  treatment: string;
  status: string;
}

interface AppointmentsDayCalendarProps {
  appointments: Appointment[];
  selectedDate: string;
  highlightedId: number | null;
  onAppointmentClick: (id: number) => void;
  onAppointmentHover: (id: number | null) => void;
}

const parseTime = (timeStr: string): number => {
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/);
  if (!match) return 9;
  
  const [, hours, minutes, period] = match;
  let hour24 = parseInt(hours);
  
  if (period === "PM" && hour24 !== 12) {
    hour24 = hour24 + 12;
  } else if (period === "AM" && hour24 === 12) {
    hour24 = 0;
  }
  
  return hour24 + parseInt(minutes) / 60;
};

const parseDuration = (durationStr: string): number => {
  const minutes = parseInt(durationStr);
  return minutes / 60;
};

export const AppointmentsDayCalendar = ({
  appointments,
  selectedDate,
  highlightedId,
  onAppointmentClick,
  onAppointmentHover,
}: AppointmentsDayCalendarProps) => {
  const appointmentRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  useEffect(() => {
    if (highlightedId && appointmentRefs.current[highlightedId]) {
      appointmentRefs.current[highlightedId]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [highlightedId]);

  const hours = Array.from({ length: 10 }, (_, i) => i + 8); // 8 AM to 5 PM
  
  // Detect overlapping appointments for each hour slot
  const getAppointmentsInSlot = (hour: number) => {
    return appointments.map((apt) => {
      const aptStart = parseTime(apt.time);
      const aptDuration = parseDuration(apt.duration);
      const aptEnd = aptStart + aptDuration;
      
      if (aptStart < hour + 1 && aptEnd > hour) {
        return { ...apt, start: aptStart, duration: aptDuration };
      }
      return null;
    }).filter(Boolean);
  };

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex items-center justify-between px-4">
        <h3 className="text-lg font-semibold text-foreground">{selectedDate}</h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Day View</span>
        </div>
      </div>
      
      <div className="border border-border rounded-lg overflow-hidden bg-background flex-1 overflow-y-auto">
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
                  "h-20"
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
                    const isHighlighted = highlightedId === apt.id;
                    
                    let bgClass = "bg-gray-200 dark:bg-gray-700";
                    let borderClass = "border-gray-400 dark:border-gray-500";
                    let textClass = "text-gray-900 dark:text-gray-100";
                    
                    if (isHighlighted) {
                      bgClass = "bg-blue-400 dark:bg-blue-500";
                      borderClass = "border-blue-600 dark:border-blue-700";
                      textClass = "text-white dark:text-white";
                    }
                    
                    return (
                      <div
                        key={apt.id}
                        ref={(el) => (appointmentRefs.current[apt.id] = el)}
                        className={cn(
                          "absolute border-l-4 rounded-md p-2 z-10 cursor-pointer transition-all duration-200",
                          bgClass,
                          borderClass,
                          isHighlighted && "shadow-lg scale-105"
                        )}
                        style={{
                          top: `${((apt.start - hour) * 100)}%`,
                          height: `${apt.duration * 80}px`,
                          left: overlappingCount > 1 ? `${leftPercent}%` : "8px",
                          width: overlappingCount > 1 ? `calc(${widthPercent}% - ${widthOffset}px)` : "calc(100% - 16px)",
                        }}
                        onClick={() => onAppointmentClick(apt.id)}
                      >
                        <div className="flex flex-col h-full overflow-hidden">
                          {apt.duration >= 0.75 ? (
                            <>
                              <p className={cn("text-sm font-semibold truncate", textClass)}>
                                {apt.patient}
                              </p>
                              <p className={cn("text-xs truncate", textClass, "opacity-90")}>
                                {apt.treatment}
                              </p>
                            </>
                          ) : (
                            <p className={cn("text-sm font-semibold truncate", textClass)}>
                              {apt.patient} - {apt.treatment}
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
