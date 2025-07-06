import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import { createBrowserRouter, RouterProvider } from "react-router";
import LandingPage from "./components/LandingPage";
import { SpotifyTokenProvider } from "./contexts/SpotifyContext"; 
import { Toaster } from "sonner";

const routes = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SpotifyTokenProvider>
      <RouterProvider router={routes} />
      <Toaster/>
    </SpotifyTokenProvider>
  </StrictMode>
);
