import type { Companion } from "@/lib/aiResponses";
import ChatPage from "@/pages/ChatPage";
import LandingPage from "@/pages/LandingPage";
import OnboardingPage from "@/pages/OnboardingPage";
import { useEffect, useState } from "react";

type Screen = "landing" | "onboarding" | "chat";

const COMPANION_KEY = "heartfelt_companion";

export default function App() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [companion, setCompanion] = useState<Companion | null>(null);

  // Restore companion from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(COMPANION_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Companion;
        setCompanion(parsed);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleGetStarted = () => {
    setScreen("onboarding");
  };

  const handleChatWithPreset = (preset: Companion) => {
    setCompanion(preset);
    localStorage.setItem(COMPANION_KEY, JSON.stringify(preset));
    setScreen("chat");
  };

  const handleOnboardingComplete = (newCompanion: Companion) => {
    setCompanion(newCompanion);
    localStorage.setItem(COMPANION_KEY, JSON.stringify(newCompanion));
    setScreen("chat");
  };

  const handleBackToLanding = () => {
    setScreen("landing");
  };

  if (screen === "onboarding") {
    return (
      <OnboardingPage
        onComplete={handleOnboardingComplete}
        onBack={handleBackToLanding}
      />
    );
  }

  if (screen === "chat" && companion) {
    return <ChatPage companion={companion} onBack={handleBackToLanding} />;
  }

  return (
    <LandingPage
      onGetStarted={handleGetStarted}
      onChatWithPreset={handleChatWithPreset}
    />
  );
}
