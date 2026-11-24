"use client";

import { Modal } from "@/components/ui/Modal";

interface TrailerModalProps {
  youtubeVideoId: string | null;
  title: string;
  isOpen: boolean;
  onClose: () => void;
}

export function TrailerModal({
  youtubeVideoId,
  title,
  isOpen,
  onClose,
}: TrailerModalProps) {
  if (!youtubeVideoId) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`تریلر ${title}`}
      maxWidthClass="max-w-3xl"
    >
      <div className="border-border-subtle relative aspect-video w-full overflow-hidden rounded-xl border bg-black">
        {isOpen && (
          <iframe
            src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1`}
            title={`Trailer for ${title}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
          />
        )}
      </div>
    </Modal>
  );
}
