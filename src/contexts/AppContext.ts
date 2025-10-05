import type { User } from "@supabase/supabase-js";
import { createContext } from "react";

export type AppContextType = {
  token: string | null;
  user: User | null;
};

export const AppContext = createContext<AppContextType>({
  token: null,
  user: null,
});
