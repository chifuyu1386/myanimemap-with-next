"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TrailerModal } from "./TrailerModal";

interface TrailerButtonProps {
  youtubeVideoId: string;
  title: string;
}

export function TrailerButton({ youtubeVideoId, title }: TrailerButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button variant="secondary" size="md" onClick={() => setIsOpen(true)}>
        <Play className="fill-primary text-primary h-4 w-4" />
        تماشای تریلر
      </Button>

      <TrailerModal
        youtubeVideoId={youtubeVideoId}
        title={title}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
