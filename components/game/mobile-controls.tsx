import { ArrowDown, ArrowLeft, ArrowRight, RotateCcw, RotateCw, Pause, Hand } from "lucide-react";

import { Button } from "@/components/ui/button";

export function MobileControls({
  onLeft,
  onRight,
  onDown,
  onRotateLeft,
  onRotateRight,
  onHold,
  onPause,
}: {
  onLeft: () => void;
  onRight: () => void;
  onDown: () => void;
  onRotateLeft: () => void;
  onRotateRight: () => void;
  onHold: () => void;
  onPause: () => void;
}) {
  return (
    <div className="grid gap-3 md:hidden">
      <div className="grid grid-cols-3 gap-3">
        <Button variant="subtle" onClick={onRotateLeft}>
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button variant="subtle" onClick={onPause}>
          <Pause className="h-4 w-4" />
        </Button>
        <Button variant="subtle" onClick={onRotateRight}>
          <RotateCw className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-4 gap-3">
        <Button variant="subtle" onClick={onLeft}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Button variant="subtle" onClick={onDown}>
          <ArrowDown className="h-4 w-4" />
        </Button>
        <Button variant="subtle" onClick={onRight}>
          <ArrowRight className="h-4 w-4" />
        </Button>
        <Button variant="subtle" onClick={onHold}>
          <Hand className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
