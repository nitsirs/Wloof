// pages/result/[sessionID].js

"use client";
import '../../styles/globals.css'
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { database } from '../../lib/firebaseConfig'; // Ensure this imports the Realtime Database instance
import { ref, query, orderByChild, equalTo, onValue, off } from "firebase/database";
import { Button } from "@/components/ui/button"; // Adjust the import path as needed

export default function ResultPage() {
  const router = useRouter();
  const { sessionID } = router.query;
  const [moodEntries, setMoodEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Ensure router and query parameters are ready
    if (!router.isReady) return;

    let isMounted = true; // To avoid setting state on unmounted component

    const fetchMoodData = () => {
      if (!sessionID) {
        if (isMounted) {
          setError("Invalid or missing session ID.");
          setLoading(false);
        }
        return;
      }

      try {
        // Reference to the 'moods' node in Realtime Database
        const moodsRef = ref(database, "moods");

        // Create a query to find all entries with the given sessionID
        const sessionQuery = query(
          moodsRef,
          orderByChild("sessionID"),
          equalTo(sessionID)
        );

        // Set up a real-time listener
        const unsubscribe = onValue(
          sessionQuery,
          (snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.val();
              // Convert the data object into an array of entries
              const entriesArray = Object.keys(data).map((key) => ({
                id: key,
                ...data[key],
              }));
              if (isMounted) {
                setMoodEntries(entriesArray);
                setLoading(false);
              }
            } else {
              if (isMounted) {
                setError("No mood data found for this session.");
                setLoading(false);
              }
            }
          },
          (err) => {
            console.error("Error fetching mood data:", err);
            if (isMounted) {
              setError(
                "An error occurred while fetching mood data. Please try again. " +
                  err
              );
              setLoading(false);
            }
          }
        );

        // Cleanup function to remove the listener when the component unmounts
        return () => {
          isMounted = false;
          off(sessionQuery);
        };
      } catch (err) {
        console.error("Error fetching mood data:", err);
        if (isMounted) {
          setError(
            "An error occurred while fetching mood data. Please try again. " +
              err
          );
          setLoading(false);
        }
      }
    };

    fetchMoodData();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [router.isReady, sessionID]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading mood data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  // Count the frequency of each mood
  const moodFrequency = {};
  moodEntries.forEach((entry) => {
    moodFrequency[entry.mood] = (moodFrequency[entry.mood] || 0) + 1;
  });

  // Normalize frequencies to determine opacity
  const maxFrequency = Math.max(...Object.values(moodFrequency));

  function getOpacity(mood) {
    return moodFrequency[mood] ? moodFrequency[mood] / maxFrequency : 0.1;
  }

  // Define the grid of emotions
  const emotions = [
    "Enraged", "Panicked", "Stressed", "Jittery", "Shocked", "Surprised", "Upbeat", "Festive", "Exhilarated", "Ecstatic",
    "Livid", "Furious", "Frustrated", "Tense", "Stunned","Hyper", "Cheerful", "Motivated", "Inspired", "Elated",
    "Fuming", "Frightened", "Angry", "Nervous", "Restless","Energized", "Lively", "Excited", "Optimistic", "Enthusiastic",  
    "Anxious", "Apprehensive", "Worried", "Irritated", "Annoyed","Pleased", "Focused", "Happy", "Proud", "Thrilled",
    "Repulsed", "Troubled", "Concerned", "Uneasy", "Peeved", "Pleasant", "Joyful", "Hopeful", "Playful", "Blissful",

    "Disgusted", "Glum", "Disappointed", "Down", "Apathetic", "At Ease", "Easygoing", "Content", "Loving", "Fulfilled",
    "Pessimistic", "Morose", "Discouraged", "Sad", "Bored","Calm", "Secure", "Satisfied", "Grateful", "Touched",
    "Alienated", "Miserable", "Lonely", "Disheartened", "Tired", "Relaxed", "Chill", "Restful", "Blessed", "Balanced",
    "Despondent", "Depressed", "Sullen", "Exhausted", "Fatigued","Mellow", "Thoughtful", "Peaceful", "Comfortable", "Carefree",
    "Despairing", "Hopeless", "Desolate", "Spent", "Drained", "Sleepy", "Complacent", "Tranquil", "Cozy", "Serene"
  ];

  function getBackgroundColor(index) {
    // Red indices
    const redIndices = [
      0, 1, 2, 3, 4, 10, 11, 12, 13, 14, 20, 21, 22, 23, 24,
      30, 31, 32, 33, 34, 40, 41, 42, 43, 44
    ];

    if (redIndices.includes(index)) return 'rgba(255,0,0,'; // Red
    if (redIndices.map(i => i + 5).includes(index)) return `rgba(255,255,0,`; // Yellow
    if (redIndices.map(i => i + 50).includes(index)) return `rgba(0,0,255,`; // Blue
    if (redIndices.map(i => i + 55).includes(index)) return `rgba(0,128,0,`; // Green

    return `rgba(255,255,255,`; // Default to white if not specified
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center text-foreground p-4">
      <Head>
        <title>Mood Results</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <main className="w-full max-w-4xl flex flex-col items-center text-center space-y-6">
        <h1 className="text-4xl font-bold">Mood Results</h1>

        {/* Mood Meter Grid */}
        <div className="grid grid-cols-10 gap-2">
          {emotions.map((emotion, idx) => (
            <div
              key={idx}
              className="p-4 border rounded-md"
              style={{
                backgroundColor: `${getBackgroundColor(idx)}${getOpacity(
                  emotion
                )})`,
              }}
            >
              {/* Optionally display the emotion name */}
              {/* {emotion} */}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}