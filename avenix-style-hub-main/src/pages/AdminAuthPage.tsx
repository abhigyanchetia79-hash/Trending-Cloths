import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LogIn, UserPlus, Mail, Lock, User as UserIcon, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ADMIN_SECRET_CODE = "TRENDING2026";

const AdminAuthPage = () => {
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [secretCode, setSecretCode] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Redirect if already admin
  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await signIn(email, password);
        // Check if user is admin
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: roles } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", user.id)
            .eq("role", "admin");
          if (roles && roles.length > 0) {
            toast.success("Welcome back, Admin!");
            navigate("/admin");
          } else {
            await supabase.auth.signOut();
            toast.error("Access denied. This login is for administrators only.");
          }
        }
      } else {
        if (secretCode !== ADMIN_SECRET_CODE) {
          toast.error("Invalid admin secret code. Contact the store owner.");
          setLoading(false);
          return;
        }
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name } },
        });
        if (error) throw error;
        if (data.user) {
          // Assign admin role
          const { error: roleError } = await supabase
            .from("user_roles")
            .insert({ user_id: data.user.id, role: "admin" });
          if (roleError) {
            console.error("Role assignment error:", roleError);
            toast.error("Account created but role assignment failed. Contact support.");
          } else {
            toast.success("Admin account created! You can now sign in.");
            setIsLogin(true);
          }
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/30 px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-background rounded-lg shadow-xl border border-border p-8 space-y-6"
      >
        <div className="text-center space-y-2">
          <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <ShieldCheck size={28} className="text-primary" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            {isLogin ? "Admin Login" : "Admin Registration"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isLogin ? "Sign in to manage your store" : "Create your store manager account"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <Label htmlFor="name" className="text-xs uppercase tracking-wider">Full Name</Label>
                <div className="relative mt-1">
                  <UserIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Store Manager Name" className="pl-10" required />
                </div>
              </div>
              <div>
                <Label htmlFor="secret" className="text-xs uppercase tracking-wider">Admin Secret Code</Label>
                <div className="relative mt-1">
                  <ShieldCheck size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input id="secret" type="password" value={secretCode} onChange={(e) => setSecretCode(e.target.value)} placeholder="Enter admin secret code" className="pl-10" required />
                </div>
              </div>
            </>
          )}
          <div>
            <Label htmlFor="email" className="text-xs uppercase tracking-wider">Email</Label>
            <div className="relative mt-1">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@store.com" className="pl-10" required />
            </div>
          </div>
          <div>
            <Label htmlFor="password" className="text-xs uppercase tracking-wider">Password</Label>
            <div className="relative mt-1">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="pl-10" minLength={6} required />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 text-sm font-medium tracking-wider uppercase rounded-md hover:bg-brand-hover transition-colors disabled:opacity-50"
          >
            {loading ? "Please wait..." : isLogin ? <><LogIn size={16} /> Admin Sign In</> : <><UserPlus size={16} /> Create Admin Account</>}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          {isLogin ? "Need an admin account?" : "Already have an admin account?"}{" "}
          <button onClick={() => setIsLogin(!isLogin)} className="text-primary font-medium hover:underline">
            {isLogin ? "Register" : "Sign in"}
          </button>
        </p>

        <div className="text-center">
          <a href="/" className="text-xs text-muted-foreground hover:text-primary transition-colors">
            ← Back to Store
          </a>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminAuthPage;
