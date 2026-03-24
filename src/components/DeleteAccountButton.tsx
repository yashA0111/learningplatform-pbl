"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, AlertTriangle } from "lucide-react";
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

  if (!showConfirm) {
    return (
      <Card className="border-red-200 dark:border-red-900/30 bg-red-50/50 dark:bg-red-950/10">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-bold text-red-700 dark:text-red-400 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription className="text-red-600/80 dark:text-red-400/60">
            Deleting your account is permanent and cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            variant="destructive" 
            onClick={() => setShowConfirm(true)}
            className="w-full sm:w-auto font-semibold shadow-sm hover:shadow-red-500/20"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Account
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-red-500 bg-white dark:bg-slate-900 shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
      <CardContent className="p-6 sm:p-8 flex flex-col items-center text-center space-y-4">
        <div className="h-16 w-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
          <AlertTriangle className="h-10 w-10 text-red-600 dark:text-red-400" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Are you absolutely sure?</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm">
            This will permanently delete your profile, interests, and progress. This action cannot be undone.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto pt-2">
          <Button
            variant="outline"
            onClick={() => setShowConfirm(false)}
            disabled={loading}
            className="flex-1 sm:w-32 border-slate-200 dark:border-slate-700"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 sm:w-32 font-bold"
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
  );
}
