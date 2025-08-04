"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

interface Workout {
  id: string;
  exercise: string;
  date: string;
  sets: { weight: number; reps: number }[];
}

export default function WorkoutHistory() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);

  useEffect(() => {
    const fetchWorkouts = async () => {
      const q = query(collection(db, "workouts"), orderBy("timestamp", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Workout[];
      setWorkouts(data);
    };

    fetchWorkouts();
  }, []);

  return (
    <div className="max-w-md mx-auto bg-white p-4 rounded shadow mt-6">
      <h2 className="text-xl font-bold mb-4">Workout History</h2>
      {workouts.map((w) => (
        <div key={w.id} className="mb-4">
          <p className="font-semibold">{w.exercise} — {w.date}</p>
          <ul className="text-sm ml-4 list-disc">
            {w.sets.map((set, i) => (
              <li key={i}>
                {set.weight} lbs x {set.reps} reps
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
