import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import { createBrowserRouter, RouterProvider } from "react-router";
import { Toaster } from "sonner";
import Layout from "./components/layout";
import { AppContextProvider } from "./contexts/AppContext";
import AlbumPage from "./routes/album";
import ArtistPage from "./routes/artist";
import HomePage from "./routes/home";

const routes = createBrowserRouter([
	{
		path: "/",
		element: <Layout />,
		children: [
			{
				path: "/",
				element: <HomePage />,
			},
			{
				path: "/artists/:id",
				element: <ArtistPage />,
			},
			{
				path: "/albums/:id",
				element: <AlbumPage />,
			},
		],
	},
]);

// biome-ignore lint/style/noNonNullAssertion: required for react
createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<AppContextProvider>
			<RouterProvider router={routes} />
			<Toaster />
		</AppContextProvider>
	</StrictMode>,
);
