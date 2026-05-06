import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function NicknameDialog({
  open,
  title,
  description,
  confirmText = "ยืนยัน",
  defaultNick = "",
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  defaultNick?: string;
  onConfirm: (nick: string) => void;
  onCancel: () => void;
}) {
  const [nick, setNick] = useState(defaultNick);
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </DialogHeader>
        <Input
          placeholder="ชื่อเล่นของคุณ"
          value={nick}
          onChange={(e) => setNick(e.target.value)}
          maxLength={40}
          autoFocus
        />
        <DialogFooter>
          <Button variant="ghost" onClick={onCancel}>ยกเลิก</Button>
          <Button onClick={() => nick.trim() && onConfirm(nick.trim())} disabled={!nick.trim()}>
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
