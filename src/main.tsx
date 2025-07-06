import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import { createBrowserRouter, RouterProvider } from "react-router";
import { Toaster } from "sonner";
import HomePage from "./routes/home";
import { SpotifyTokenProvider } from "./contexts/SpotifyContext";
import ArtistPage from "./routes/artist";

const routes = createBrowserRouter([
	{
		path: "/",
		element: <HomePage />,
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
