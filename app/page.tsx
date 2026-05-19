"use client";

import { useState } from "react";
import { TravelDashboard } from "@/components/travel-dashboard/TravelDashboard";
import { FloatingChatWidget } from "@/components/voice-agent/FloatingChatWidget";

export default function HomePage() {
  const [chatOpen, setChatOpen] = useState(false);
  const [chatDraft, setChatDraft] = useState<string | undefined>();

  const openChat = (prompt?: string) => {
    setChatDraft(prompt);
    setChatOpen(true);
  };

  return (
    <>
      <TravelDashboard onAskTravelMate={openChat} />
      <FloatingChatWidget
        open={chatOpen}
        draft={chatDraft}
        onOpen={() => openChat()}
        onClose={() => setChatOpen(false)}
        onDraftConsumed={() => setChatDraft(undefined)}
      />
    </>
  );
}
