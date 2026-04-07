"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, AlertTriangle, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function DeleteAccountButton() {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/delete", {
        method: "DELETE",
      });

      if (res.ok) {
        await signOut({ callbackUrl: "/signup" });
      } else {
        const data = await res.json();
        alert(data.message || "Failed to delete account");
        setLoading(false);
        setShowConfirm(false);
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      alert("An error occurred during deletion");
      setLoading(false);
      setShowConfirm(false);
    }
  };

  return (
    <AnimatePresence mode="wait">
      {!showConfirm ? (
        <motion.div
          key="danger-zone"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-red-200/60 dark:border-red-900/30 bg-red-50/30 dark:bg-red-950/10 rounded-2xl overflow-hidden backdrop-blur-sm">
            {/* Danger gradient accent */}
            <div className="h-1 bg-gradient-to-r from-red-400 via-red-500 to-rose-500" />
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold text-red-700 dark:text-red-400 flex items-center gap-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-red-400 to-rose-500 shadow-sm">
                  <AlertTriangle className="h-3.5 w-3.5 text-white" />
                </span>
                Danger Zone
              </CardTitle>
              <CardDescription className="text-red-600/70 dark:text-red-400/60">
                Deleting your account is permanent and cannot be undone.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="destructive" 
                onClick={() => setShowConfirm(true)}
                className="w-full sm:w-auto font-semibold shadow-sm hover:shadow-red-500/20 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          key="confirm"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <Card className="border-red-500/40 bg-white/80 dark:bg-slate-900/80 shadow-xl rounded-2xl overflow-hidden backdrop-blur-sm">
            <div className="h-1 bg-gradient-to-r from-red-500 via-rose-500 to-pink-500 animate-pulse-border" />
            <CardContent className="p-6 sm:p-8 flex flex-col items-center text-center space-y-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.1 }}
                className="h-16 w-16 bg-gradient-to-br from-red-400 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/25"
              >
                <ShieldAlert className="h-8 w-8 text-white" />
              </motion.div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Are you absolutely sure?</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-sm text-sm">
                  This will permanently delete your profile, interests, and progress. This action cannot be undone.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowConfirm(false)}
                  disabled={loading}
                  className="flex-1 sm:w-32 border-slate-200/80 dark:border-slate-700/50 rounded-xl transition-all duration-200"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={loading}
                  className="flex-1 sm:w-32 font-bold rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Yes, Delete"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
