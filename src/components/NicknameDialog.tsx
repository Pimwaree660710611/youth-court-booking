import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const phoneOk = (p: string) => /^[0-9]{9,15}$/.test(p.replace(/[-\s]/g, ""));

export function NicknameDialog({
  open,
  title,
  description,
  confirmText = "ยืนยัน",
  defaultNick = "",
  defaultPhone = "",
  requirePhone = true,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  defaultNick?: string;
  defaultPhone?: string;
  requirePhone?: boolean;
  onConfirm: (nick: string, phone: string) => void;
  onCancel: () => void;
}) {
  const [nick, setNick] = useState(defaultNick);
  const [phone, setPhone] = useState(defaultPhone);

  const phoneClean = phone.replace(/[-\s]/g, "");
  const canSubmit =
    nick.trim().length > 0 && (!requirePhone || phoneOk(phoneClean));

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label className="text-xs">ชื่อเล่น</Label>
            <Input
              placeholder="ชื่อเล่นของคุณ"
              value={nick}
              onChange={(e) => setNick(e.target.value)}
              maxLength={40}
              autoFocus
              className="mt-1"
            />
          </div>
          {requirePhone && (
            <div>
              <Label className="text-xs">เบอร์โทรศัพท์</Label>
              <Input
                placeholder="0812345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={15}
                inputMode="tel"
                className="mt-1"
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                ใช้ยืนยันตัวตนเมื่อต้องการยกเลิกการจอง
              </p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onCancel}>ยกเลิก</Button>
          <Button
            onClick={() => canSubmit && onConfirm(nick.trim(), phoneClean)}
            disabled={!canSubmit}
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
