
-- Bookings table
CREATE TABLE public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sport text NOT NULL CHECK (sport IN ('badminton','futsal','tennis','pingpong')),
  court_no text NOT NULL,
  booking_date date NOT NULL,
  hour int NOT NULL CHECK (hour >= 9 AND hour <= 20),
  nickname text NOT NULL,
  checked_in boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (sport, court_no, booking_date, hour)
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Public read/write (no auth required per spec - anyone with nickname can book)
CREATE POLICY "anyone can read bookings" ON public.bookings FOR SELECT USING (true);
CREATE POLICY "anyone can insert bookings" ON public.bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "anyone can delete bookings" ON public.bookings FOR DELETE USING (true);
CREATE POLICY "anyone can update bookings" ON public.bookings FOR UPDATE USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
ALTER TABLE public.bookings REPLICA IDENTITY FULL;

-- Cleanup expired bookings: past hour ended OR 15min no check-in
CREATE OR REPLACE FUNCTION public.cleanup_expired_bookings()
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  DELETE FROM public.bookings
  WHERE (booking_date + (make_interval(hours => hour + 1))) < now()
     OR (checked_in = false AND (booking_date + make_interval(hours => hour) + interval '15 minutes') < now());
$$;
