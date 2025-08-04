"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, deleteDoc, doc, getDocs, query, orderBy, where, Timestamp } from "firebase/firestore";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import { format } from "date-fns";
import WorkoutChart from "@/components/WorkoutChart";

type SetEntry = {
  exercise: string;
  weight: number;
  reps: number;
};

type WorkoutDoc = {
  date: any;
  sets: SetEntry[];
  userId?: string;
};

type WorkoutWithId = WorkoutDoc & { id: string };

export default function WorkoutHistory() {
  const { user, loading } = useAuth();
  const [workouts, setWorkouts] = useState<WorkoutWithId[]>([]);
  const [filterExercise, setFilterExercise] = useState<string>(""); // empty = all
  const [dateFrom, setDateFrom] = useState<string>(""); // YYYY-MM-DD
  const [dateTo, setDateTo] = useState<string>("");

  const fetchWorkouts = async () => {
    if (!user) return;
    const q = query(
      collection(db, "workouts"),
      where("userId", "==", user.uid),
      orderBy("date", "desc")
    );
    const snap = await getDocs(q);
    const arr: WorkoutWithId[] = [];
    snap.forEach((d) => {
      arr.push({ id: d.id, ...(d.data() as WorkoutDoc) });
    });
    setWorkouts(arr);
  };

  useEffect(() => {
    fetchWorkouts();
    // eslint-disable-next-line
  }, [user]);

  const filtered = useMemo(() => {
    return workouts.filter((w) => {
      if (filterExercise) {
        const match = w.sets.some((s) => s.exercise === filterExercise);
        if (!match) return false;
      }
      if (dateFrom) {
        const from = new Date(dateFrom);
        if (w.date.toDate() < from) return false;
      }
      if (dateTo) {
        const to = new Date(dateTo);
        if (w.date.toDate() > to) return false;
      }
      return true;
    });
  }, [workouts, filterExercise, dateFrom, dateTo]);

  // grouped by day string
  const grouped = useMemo(() => {
    const map: Record<string, WorkoutWithId[]> = {};
    filtered.forEach((w) => {
      const day = format(w.date.toDate(), "yyyy-MM-dd");
      if (!map[day]) map[day] = [];
      map[day].push(w);
    });
    return map;
  }, [filtered]);

  const deleteWorkout = async (id: string) => {
    if (!confirm("Delete this workout?")) return;
    await deleteDoc(doc(db, "workouts", id));
    fetchWorkouts();
  };

  const totalVolume = (sets: SetEntry[]) => {
    return sets.reduce((sum, s) => sum + s.weight * s.reps, 0);
  };

  if (loading) return <div>Loading history...</div>;
  if (!user) return null;

  return (
    <div className="mt-10 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Workout History</h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label className="block text-sm">Exercise</label>
          <input
            placeholder="e.g. Flat Dumbbell Press"
            value={filterExercise}
            onChange={(e) => setFilterExercise(e.target.value)}
            className="px-3 py-2 rounded bg-white/5"
          />
        </div>
        <div>
          <label className="block text-sm">From</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-3 py-2 rounded bg-white/5"
          />
        </div>
        <div>
          <label className="block text-sm">To</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-3 py-2 rounded bg-white/5"
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={() => {
              setFilterExercise("");
              setDateFrom("");
              setDateTo("");
            }}
            className="px-4 py-2 bg-gray-700 rounded"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Grouped workouts */}
      {Object.entries(grouped).length === 0 && (
        <div className="text-center text-sm text-gray-300">No workouts in this range.</div>
      )}
      {Object.entries(grouped).map(([day, dayWorkouts]) => (
        <div key={day} className="mb-8">
          <div className="flex justify-between items-baseline mb-2">
            <h3 className="text-xl font-semibold">{format(new Date(day), "MMMM do, yyyy")}</h3>
            <div className="text-sm text-gray-400">
              Total volume:{" "}
              {dayWorkouts
                .flatMap((w) => w.sets)
                .reduce((sum, s) => sum + s.weight * s.reps, 0)}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {dayWorkouts.map((w) => (
              <div key={w.id} className="bg-white/5 p-4 rounded-lg relative">
                <div className="absolute top-2 right-2 flex gap-2 text-xs">
                  <button
                    onClick={() => deleteWorkout(w.id)}
                    className="px-2 py-1 bg-red-600 rounded"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => {
                      // duplicate into logger by emitting an event or storing to localStorage
                      // simplest: copy to clipboard for now
                      navigator.clipboard.writeText(JSON.stringify(w.sets, null, 2));
                      alert("Sets copied to clipboard for manual reuse");
                    }}
                    className="px-2 py-1 bg-blue-600 rounded"
                  >
                    Duplicate
                  </button>
                </div>

                <div className="text-sm mb-2">
                  <strong>Volume:</strong> {totalVolume(w.sets)}
                </div>
                <div className="space-y-1 mb-2">
                  {w.sets.map((s, i) => (
                    <div key={i} className="flex justify-between text-xs">
                      <div>
                        {s.exercise} — {s.weight} lbs x {s.reps}
                      </div>
                      <div>{s.weight * s.reps}</div>
                    </div>
                  ))}
                </div>
                {/* mini chart per workout could go here, e.g., max weight per exercise on that day */}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

