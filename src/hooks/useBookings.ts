import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Sport } from "@/lib/courts";

export type Booking = {
  id: string;
  sport: Sport;
  court_no: string;
  booking_date: string;
  hour: number;
  nickname: string;
  phone_number: string | null;
  checked_in: boolean;
};

export function useBookings(sport: Sport, date: string) {
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const { data } = await supabase
        .from("bookings")
        .select("*")
        .eq("sport", sport)
        .eq("booking_date", date);
      if (active && data) setBookings(data as Booking[]);
    };
    load();

    const channel = supabase
      .channel(`bookings-${sport}-${date}-${Math.random().toString(36).slice(2, 8)}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookings" },
        () => load(),
      )
      .subscribe();

    const interval = setInterval(load, 5000); // safety refresh: 5s

    return () => {
      active = false;
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [sport, date]);

  return bookings;
}
