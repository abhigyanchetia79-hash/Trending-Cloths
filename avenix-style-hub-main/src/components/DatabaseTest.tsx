import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const DatabaseTest = () => {
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    const testDatabase = async () => {
      addResult("🧪 Starting database connection test...");
      
      try {
        // Test 1: Check Supabase connection
        addResult("📡 Testing Supabase connection...");
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          addResult(`❌ Session error: ${sessionError.message}`);
        } else {
          addResult(`✅ Supabase connected successfully`);
        }

        // Test 2: Check products table
        addResult("📦 Testing products table access...");
        const { data: products, error: productsError } = await supabase
          .from("products")
          .select("count")
          .single();
        
        if (productsError) {
          addResult(`❌ Products table error: ${productsError.message}`);
        } else {
          addResult(`✅ Products table accessible, count: ${products.count}`);
        }

        // Test 3: Try to fetch actual products
        addResult("🔍 Fetching actual products...");
        const { data: actualProducts, error: fetchError } = await supabase
          .from("products")
          .select("*")
          .limit(5);
        
        if (fetchError) {
          addResult(`❌ Fetch error: ${fetchError.message}`);
        } else {
          addResult(`✅ Fetched ${actualProducts.length} products`);
          actualProducts.forEach((product, index) => {
            addResult(`   ${index + 1}. ${product.name} (${product.category})`);
          });
        }

        // Test 4: Check if we need to initialize
        addResult("🚀 Checking if database needs initialization...");
        const { data: existingProducts } = await supabase
          .from("products")
          .select("id")
          .limit(1);
        
        if (!existingProducts || existingProducts.length === 0) {
          addResult("⚠️ Database is empty, needs initialization");
        } else {
          addResult("✅ Database has products");
        }

      } catch (error: any) {
        addResult(`❌ General error: ${error.message}`);
      }
    };

    testDatabase();
  }, []);

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg max-w-md max-h-96 overflow-y-auto text-xs font-mono z-50">
      <div className="font-bold mb-2">Database Test Results:</div>
      {testResults.map((result, index) => (
        <div key={index} className="mb-1">{result}</div>
      ))}
    </div>
  );
};

export default DatabaseTest;
