"use client";

import { format } from "date-fns";

interface Session {
  startTime: string;
  endTime: string;
}

interface ParticipantData {
  participant: {
    name: string;
    signedinUser?: { displayName?: string; user?: string };
    anonymousUser?: { displayName?: string };
    phoneUser?: { displayName?: string };
  };
  sessions: Session[];
}

interface Props {
  data: ParticipantData[];
}

export default function AttendanceChart({ data }: Props) {
  if (data.length === 0) return <p>No attendance data.</p>;

  // Flatten sessions to find min/max time
  const allSessions = data.flatMap((p) => p.sessions);
  if (allSessions.length === 0) return <p>No sessions found.</p>;

  const minTime = Math.min(
    ...allSessions.map((s) => new Date(s.startTime).getTime()),
  );
  const maxTime = Math.max(
    ...allSessions.map((s) => new Date(s.endTime).getTime()),
  );

  // Add some padding (e.g. 5% on each side)
  const duration = maxTime - minTime;
  const padding = duration * 0.05;
  const startDomain = minTime - padding;
  const endDomain = maxTime + padding;
  const totalDuration = endDomain - startDomain;

  // Generate time ticks (e.g., 5 ticks)
  const tickCount = 5;
  const ticks = Array.from({ length: tickCount }).map((_, i) => {
    const time = startDomain + (totalDuration * i) / (tickCount - 1);
    return time;
  });

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[600px]">
        {/* Header / Time Axis */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 pb-2 mb-2">
          <div className="w-1/4 shrink-0 font-semibold text-gray-700 dark:text-gray-300 pl-2">
            Participant
          </div>
          <div className="w-3/4 relative h-6">
            {ticks.map((tick) => (
              <div
                key={tick}
                className="absolute text-xs text-gray-500 transform -translate-x-1/2"
                style={{
                  left: `${((tick - startDomain) / totalDuration) * 100}%`,
                }}
              >
                {format(new Date(tick), "HH:mm")}
              </div>
            ))}
          </div>
        </div>

        {/* Rows */}
        <div className="space-y-2">
          {data.map((p, index) => {
            const pName =
              p.participant.name.split("/").pop() || `Participant ${index + 1}`;
            return (
              <div
                key={index}
                className="flex items-center hover:bg-gray-50 dark:hover:bg-gray-800 rounded py-1"
              >
                <div
                  className="w-1/4 shrink-0 truncate pr-2 pl-2 text-sm font-medium text-gray-900 dark:text-gray-100"
                  title={pName}
                >
                  {pName}
                </div>
                <div className="w-3/4 relative h-8 bg-gray-100 dark:bg-gray-900 rounded overflow-hidden">
                  {/* Grid lines for ticks */}
                  {ticks.map((tick) => (
                    <div
                      key={tick}
                      className="absolute top-0 bottom-0 border-l border-gray-200 dark:border-gray-700 border-dashed"
                      style={{
                        left: `${((tick - startDomain) / totalDuration) * 100}%`,
                      }}
                    />
                  ))}

                  {/* Session Bars */}
                  {p.sessions.map((session, sIndex) => {
                    const start = new Date(session.startTime).getTime();
                    const end = new Date(session.endTime).getTime();
                    const left = ((start - startDomain) / totalDuration) * 100;
                    const width = ((end - start) / totalDuration) * 100;

                    return (
                      <div
                        key={sIndex}
                        className="absolute top-1 bottom-1 bg-blue-500 rounded shadow-sm group cursor-pointer"
                        style={{
                          left: `${left}%`,
                          width: `${Math.max(width, 0.5)}%`, // Min width for visibility
                        }}
                      >
                        {/* Tooltip */}
                        <div className="invisible group-hover:visible absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded whitespace-nowrap z-10">
                          {format(new Date(start), "HH:mm:ss")} -{" "}
                          {format(new Date(end), "HH:mm:ss")}
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
}
