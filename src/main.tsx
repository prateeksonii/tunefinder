import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import { createBrowserRouter, RouterProvider } from "react-router";
import { Toaster } from "sonner";
import LandingPage from "./components/LandingPage";
import { SpotifyTokenProvider } from "./contexts/SpotifyContext";
import ArtistPage from "./routes/ArtistPage";

const routes = createBrowserRouter([
	{
		path: "/",
		element: <LandingPage />,
	},
	{
		path: "/artists/:id",
		element: <ArtistPage />,
	},
]);

// biome-ignore lint/style/noNonNullAssertion: required for react
createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<SpotifyTokenProvider>
			<RouterProvider router={routes} />
			<Toaster />
		</SpotifyTokenProvider>
	</StrictMode>,
);
