"use client";

import { useState, useEffect, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import HeroGreeting from "@/components/panel/dashboard/HeroGreeting";
import ActionQueue from "@/components/panel/dashboard/ActionQueue";
import ProjectContext from "@/components/panel/dashboard/ProjectContext";
import MaintenanceUpsell from "@/components/panel/dashboard/MaintenanceUpsell";
import ActivityFeed from "@/components/panel/dashboard/ActivityFeed";
import WelcomeOverlay from "@/components/panel/onboarding/WelcomeOverlay";
import SpotlightTour from "@/components/panel/onboarding/SpotlightTour";
import FirstAction from "@/components/panel/onboarding/FirstAction";
import { useActionCount } from "@/lib/context/ActionCountContext";

const ONBOARDING_KEY = "makeit_onboarding_done";
type OnboardingStep = "welcome" | "tour" | "firstAction" | null;

export default function PanelPage() {
  const { actionCount } = useActionCount();
  const [onboardingStep, setOnboardingStep] = useState<OnboardingStep>(null);
  const [firstName, setFirstName] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const done = localStorage.getItem(ONBOARDING_KEY);
      if (!done) setOnboardingStep("welcome");
    }
  }, []);

  const finishOnboarding = useCallback(() => {
    setOnboardingStep(null);
    localStorage.setItem(ONBOARDING_KEY, "true");
  }, []);

  const handleWelcomeContinue = useCallback((name: string) => {
    setFirstName(name);
    setOnboardingStep("tour");
  }, []);

  return (
    <>
      <div className="max-w-[1060px] flex flex-col gap-8">

        {/* Greeting */}
        <HeroGreeting actionCount={actionCount} firstName={firstName || undefined} />

        {/* Two-column layout */}
        <div className="grid grid-cols-[1fr_340px] gap-8 items-start">

          {/* Left */}
          <div className="flex flex-col gap-6">
            <div data-tour="actions">
              <ActionQueue />
            </div>
            <ProjectContext />
            <ActivityFeed />
          </div>

          {/* Right — upsell sidebar */}
          <MaintenanceUpsell />

        </div>
      </div>

      <AnimatePresence>
        {onboardingStep === "welcome" && (
          <WelcomeOverlay onContinue={handleWelcomeContinue} />
        )}
        {onboardingStep === "tour" && (
          <SpotlightTour onComplete={() => setOnboardingStep("firstAction")} />
        )}
        {onboardingStep === "firstAction" && (
          <FirstAction
            onAction={() => {
              finishOnboarding();
              window.location.href = "/panel/design-review";
            }}
            onSkip={finishOnboarding}
          />
        )}
      </AnimatePresence>
    </>
  );
}
