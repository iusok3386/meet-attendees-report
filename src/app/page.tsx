"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Calendar, Clock, LogOut, User } from "lucide-react";

// Define type for ConferenceRecord based on API response
interface ConferenceRecord {
  name: string;
  startTime: string;
  endTime: string;
}

export default function Home() {
  const { data: session } = useSession();
  const [conferences, setConferences] = useState<ConferenceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConferences = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/conferences");
        if (res.ok) {
          const data = await res.json();
          setConferences(data);
        } else {
          setError("Failed to fetch conferences. Please try again later.");
        }
      } catch (error) {
        console.error("Failed to fetch conferences", error);
        setError("An unexpected error occurred. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (session?.accessToken) {
      fetchConferences();
    }
  }, [session]);

  useEffect(() => {
    if (session?.error === "RefreshAccessTokenError") {
      signOut({ callbackUrl: "/" }); // Force sign out to clear bad session
    }
  }, [session]);

  if (!session) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50 dark:bg-gray-900">
        <div className="text-center space-y-6">
          <div className="bg-blue-100 p-4 rounded-full inline-block dark:bg-blue-900">
            <Calendar className="w-12 h-12 text-blue-600 dark:text-blue-300" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Meet Attendees Report
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            Visualize your Google Meet conference attendance with detailed
            timelines.
          </p>
          <button
            type="button"
            onClick={() => signIn("google")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all transform hover:scale-105 flex items-center gap-2 mx-auto"
          >
            <User className="w-5 h-5" />
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Calendar className="w-8 h-8 text-blue-600" />
              Your Conferences
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Select a meeting to view the attendance report.
            </p>
          </div>
          <div className="flex items-center gap-4 bg-white dark:bg-gray-800 p-2 rounded-full shadow-sm px-6">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {session.user?.email}
            </span>
            <button
              type="button"
              onClick={() => signOut()}
              className="text-gray-500 hover:text-red-600 transition-colors p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
              title="Sign out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {conferences.length === 0 ? (
              <div className="col-span-full text-center py-20 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-dashed border-gray-300 dark:border-gray-700">
                <p className="text-gray-500 text-lg">
                  No conference records found.
                </p>
              </div>
            ) : (
              conferences.map((conf) => {
                const id = conf.name.split("/").pop();
                return (
                  <Link
                    key={conf.name}
                    href={`/report/${id}`}
                    className="group block p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all dark:bg-gray-800 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
                        <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="text-xs font-mono text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {id}
                      </span>
                    </div>
                    <h5 className="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {conf.startTime
                        ? format(new Date(conf.startTime), "MMM d, yyyy")
                        : "Unknown Date"}
                    </h5>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      {conf.startTime
                        ? format(new Date(conf.startTime), "h:mm a")
                        : ""}
                    </p>
                  </Link>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
