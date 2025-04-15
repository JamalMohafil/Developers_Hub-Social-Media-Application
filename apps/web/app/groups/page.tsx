"use client";

import type React from "react";

import { useState } from "react";
import { Bell, Users, Calendar, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
 
export default function GroupsComingSoon() {
  const [email, setEmail] = useState("");

  const handleNotifyMe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast("Notification set, w    e'll notify you when Groups feature launches");
      setEmail("");
    }
  };
  const router = useRouter()

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-card border border-border mt-14 flex flex-col items-center justify-center   py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl w-full rounded-lg  shadow-xl overflow-hidden">
        <div className="px-6 py-8 md:p-10">
          <div className="text-center mb-8">
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-24 w-24 rounded-full bg-primary/10 animate-pulse"></div>
              </div>
              <div className="relative flex justify-center">
                <Users className="h-16 w-16 text-primary" strokeWidth={1.5} />
              </div>
            </div>

            <h1 className="text-4xl font-bold text-foreground mb-2">
              Groups Feature Coming Soon
            </h1>
            <p className="text-xl text-muted-foreground max-w-xl mx-auto">
              We're working hard to bring you a powerful collaboration
              experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-12">
            <div className="bg-muted/30 p-6 rounded-lg border border-border flex flex-col items-center text-center">
              <MessageSquare className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-lg font-medium text-foreground">
                Group Discussions
              </h3>
              <p className="text-muted-foreground mt-2">
                Create topic-based discussions with your team members
              </p>
            </div>

            <div className="bg-muted/30 p-6 rounded-lg border border-border flex flex-col items-center text-center">
              <Calendar className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-lg font-medium text-foreground">
                Event Planning
              </h3>
              <p className="text-muted-foreground mt-2">
                Schedule and coordinate group events and meetings
              </p>
            </div>

            <div className="bg-muted/30 p-6 rounded-lg border border-border flex flex-col items-center text-center">
              <Users className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-lg font-medium text-foreground">
                Team Management
              </h3>
              <p className="text-muted-foreground mt-2">
                Organize your teams with roles and permissions
              </p>
            </div>
          </div>

          <div className="max-w-md mx-auto">
            <div className="bg-muted/20 p-6 rounded-lg border border-border">
              <h3 className="text-lg font-medium text-foreground mb-4 flex items-center">
                <Bell className="h-5 w-5 mr-2 text-accent" />
                Get notified when it's ready
              </h3>

              <form onSubmit={handleNotifyMe} className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background border-border"
                  required
                />
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Notify Me
                </Button>
              </form>

              <p className="text-xs text-muted-foreground mt-3">
                We'll only notify you about the Groups feature launch. No spam.
              </p>
            </div>

            <div className="text-center mt-8">
              <Button
                variant="outline"
                onClick={() => router.push("/")}
                className="border-accent text-accent hover:bg-accent/10"
              >
                Go to Home Page
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
