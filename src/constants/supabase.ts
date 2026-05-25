import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://rualnjvyjgkzxtharhfr.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1YWxuanZ5amdrenh0aGFyaGZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyMjY2ODUsImV4cCI6MjA5NDgwMjY4NX0.USCfbx97yDv6I2QtFIQu-hZBg6pndKEdTZQPL2MrJcA'
);