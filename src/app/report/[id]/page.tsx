"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AttendanceChart from "@/components/AttendanceChart";

export default function ReportPage() {
  const { data: session } = useSession();
  const params = useParams();
  const id = params?.id as string;
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/report/${id}`);
        if (res.ok) {
          const reportData = await res.json();
          // Process names here if needed
          const processedData = reportData.map((item: any) => {
            // Try to find a display name
            let displayName = "Unknown";
            if (item.participant.signedinUser) {
              displayName =
                item.participant.signedinUser.displayName ||
                item.participant.signedinUser.user;
            } else if (item.participant.anonymousUser) {
              displayName =
                item.participant.anonymousUser.displayName || "Anonymous";
            } else if (item.participant.phoneUser) {
              displayName = item.participant.phoneUser.displayName || "Phone";
            }

            // Fallback to ID if name is missing or empty
            if (!displayName) {
              displayName = item.participant.name.split("/").pop();
            }

            return {
              ...item,
              participant: {
                ...item.participant,
                name: displayName, // Override name for chart display
              },
            };
          });
          setData(processedData);
        }
      } catch (error) {
        console.error("Failed to fetch report", error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.accessToken && id) {
      fetchReport();
    }
  }, [session, id]);

  if (!session) return <div>Please sign in</div>;

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8">Meeting Report: {id}</h1>
      {loading ? (
        <p>Loading report data...</p>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow dark:bg-gray-800">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Attendance Timeline
          </h2>
          <AttendanceChart data={data} />
        </div>
      )}
    </div>
  );
}
