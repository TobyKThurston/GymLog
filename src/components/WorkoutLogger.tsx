"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import AuthForm from "@/components/AuthForm";
import { db } from "@/lib/firebase";
import WorkoutChart from "@/components/WorkoutChart";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  where,
  Timestamp,
  type QueryDocumentSnapshot,
  type DocumentData,
} from "firebase/firestore";

type SetEntry = {
  exercise: string;
  weight: number;
  reps: number;
};

type WorkoutDoc = {
  date: Timestamp;
  sets: SetEntry[];
  userId?: string;
};

type ChartData = Record<string, { date: string; weight: number }[]>;

const exercises = [
  "Flat Dumbbell Press",
  "Chest Press",
  "Incline Dumbbell Press",
  "Incline Machine Press",
  "High to Low Cable Fly",
  "Pec Fly",
  "Rope Tricep Pushdowns",
  "Overhead Tricep Extensions",
  "Dumbbell Shoulder Press",
  "Lateral Raises",
  "Barbell Bench Press",
  "Lat Pulldown",
  "Seated Cable Row",
  "Straight Arm Cable Pulldown",
  "Preacher Curls",
  "Incline Dumbbell Curls",
  "Rear Delt Flys",
  "Face Pulls",
  "Leg Press",
  "Bulgarian Split Squat",
  "Squat Machine",
  "Leg Curls",
  "Standing Calf Raises",
  "Roman Chair",
  "Hammer Curls",
  "Dumbbell Lateral Raises",
  "Shoulder Press",
  "Overhead Cable Triceps Extensions",
  "Pec Deck Rear Fly",
  "Abs",
];

export default function WorkoutLogger() {
  const { user, loading, logout } = useAuth();
  const [selectedExercise, setSelectedExercise] = useState("");
  const [weight, setWeight] = useState(135);
  const [reps, setReps] = useState(8);
  const [sets, setSets] = useState<SetEntry[]>([]);
  const [chartData, setChartData] = useState<ChartData>({});

  const addSet = () => {
    if (!selectedExercise) return;
    setSets((prev) => [...prev, { exercise: selectedExercise, weight, reps }]);
  };

  const removeSet = (index: number) => {
    setSets((prev) => prev.filter((_, i) => i !== index));
  };

  const saveWorkout = async () => {
    if (!user) return;
    if (sets.length === 0) return;
    try {
      await addDoc(collection(db, "workouts"), {
        date: Timestamp.now(),
        sets,
        userId: user.uid,
      });
      setSets([]);
      await fetchChartData();
    } catch (e) {
      console.error("Save failed", e);
    }
  };

  const fetchChartData = async () => {
    if (!user) return;
    const q = query(
      collection(db, "workouts"),
      where("userId", "==", user.uid),
      orderBy("date")
    );
    const snapshot = await getDocs(q);

    const temp: Record<string, Record<string, number>> = {};

    snapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
      const workout = doc.data() as WorkoutDoc;
      let dateStr = "";
      if (workout.date && typeof workout.date.toDate === "function") {
        dateStr = workout.date.toDate().toISOString().split("T")[0];
      } else {
        dateStr = String(workout.date);
      }

      workout.sets.forEach((set) => {
        const ex = set.exercise;
        const w = set.weight;
        if (!temp[ex]) temp[ex] = {};
        if (!temp[ex][dateStr] || w > temp[ex][dateStr]) {
          temp[ex][dateStr] = w;
        }
      });
    });

    const finalData: ChartData = {};
    Object.entries(temp).forEach(([ex, dateMap]) => {
      finalData[ex] = Object.entries(dateMap).map(([date, weight]) => ({
        date,
        weight,
      }));
    });

    setChartData(finalData);
  };

  useEffect(() => {
    if (user) {
      void fetchChartData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white font-bebas">
      <header className="text-5xl text-center font-extrabold tracking-wide pt-10 pb-6 relative">
        GymLog
        {user && (
          <div className="absolute right-4 top-0 mt-2 flex items-center gap-2 text-sm">
            <span>{user.displayName || user.email || user.uid.slice(0, 6)}</span>
            <button onClick={() => void logout()} className="underline text-xs">
              Log out
            </button>
          </div>
        )}
      </header>

      {loading && (
        <div className="min-h-screen flex items-center justify-center">
          <div>Loading...</div>
        </div>
      )}

      {!loading && !user && (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white font-bebas flex flex-col items-center pt-10">
          <h1 className="text-5xl font-extrabold mb-4">GymLog</h1>
          <AuthForm />
        </div>
      )}

      {!loading && user && (
        <>
          <section className="bg-white/5 p-6 rounded-2xl shadow-lg max-w-xl mx-auto">
            <h2 className="text-xl font-bold mb-4">Log Workout</h2>

            <select
              className="w-full bg-white/10 text-white p-3 rounded mb-4 focus:outline-none"
              value={selectedExercise}
              onChange={(e) => setSelectedExercise(e.target.value)}
            >
              <option value="">Select Exercise</option>
              {exercises.map((ex, i) => (
                <option key={i} value={ex}>
                  {ex}
                </option>
              ))}
            </select>

            <div className="flex justify-between items-center mb-4">
              <div>
                <label className="block text-sm">Weight</label>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setWeight((w) => Math.max(0, w - 5))}
                    className="px-2 py-1 bg-white/10 rounded"
                  >
                    -
                  </button>
                  <span>{weight} lbs</span>
                  <button
                    onClick={() => setWeight((w) => w + 5)}
                    className="px-2 py-1 bg-white/10 rounded"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm">Reps</label>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setReps((r) => Math.max(1, r - 1))}
                    className="px-2 py-1 bg-white/10 rounded"
                  >
                    -
                  </button>
                  <span>{reps}</span>
                  <button
                    onClick={() => setReps((r) => r + 1)}
                    className="px-2 py-1 bg-white/10 rounded"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={addSet}
              className="w-full py-2 rounded bg-gradient-to-r from-blue-500 to-blue-300 mb-2 text-lg font-semibold"
            >
              Add Set
            </button>

            {sets.length > 0 && (
              <div className="mb-4">
                <p className="text-sm mb-2">
                  {sets.length} {sets.length === 1 ? "set" : "sets"} added:
                </p>
                <div className="flex flex-col gap-2">
                  {sets.map((s, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center bg-white/10 p-2 rounded"
                    >
                      <div className="text-sm">
                        {s.exercise} — {s.weight} lbs x {s.reps} reps
                      </div>
                      <button
                        onClick={() => removeSet(idx)}
                        className="text-xs px-2 py-1 bg-red-600 rounded"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={saveWorkout}
              className="w-full py-2 rounded bg-gradient-to-r from-green-400 to-teal-300 text-lg font-semibold"
            >
              Save Workout
            </button>
          </section>

          <section className="mt-10 max-w-5xl mx-auto px-4">
            <h2 className="text-2xl font-bold mb-4">Progress</h2>
            <div className="flex overflow-x-auto gap-4 snap-x snap-mandatory scroll-smooth pb-2">
              {Object.entries(chartData).map(([exercise, dataPoints]) => (
                <WorkoutChart
                  key={exercise}
                  exercise={exercise}
                  dataPoints={dataPoints}
                />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}







