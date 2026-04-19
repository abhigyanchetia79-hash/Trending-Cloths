import { useEffect } from "react";
import { initializeDatabase } from "@/lib/database";

const DatabaseInitializer = () => {
  useEffect(() => {
    // Initialize database with sample data on app startup
    initializeDatabase().catch(console.error);
  }, []);

  return null; // This component doesn't render anything
};

export default DatabaseInitializer;
