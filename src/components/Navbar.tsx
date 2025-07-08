import { Music4 } from "lucide-react";
import { useContext } from "react";
import { Link } from "react-router";
import { AppContext } from "@/contexts/AppContext";
import { supabase } from "@/lib/supabase/client";
import { LoginForm } from "./login-form";
import { Button } from "./ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "./ui/dialog";

export default function Navbar() {
	const { user } = useContext(AppContext);
	return (
		<div className="sticky top-0 w-full h-16 border-b bg-background border-white z-50 flex items-center">
			<div className="mx-auto container px-4 md:px-0 flex items-center justify-between">
				{/* Left side: logo and nav items */}
				<div className="flex items-center gap-6">
					<Link to="/" className="flex items-center gap-2">
						<Music4 className="text-white text-2xl" />
						<span className="text-white text-xl font-semibold">TuneFinder</span>
					</Link>
					<div className="flex items-center gap-4"></div>
				</div>
				{user ? (
					<Button onClick={() => supabase.auth.signOut()}>Log out</Button>
				) : (
					<Dialog>
						<DialogTrigger>Login</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Login</DialogTitle>
							</DialogHeader>
							<LoginForm />
						</DialogContent>
					</Dialog>
				)}
			</div>
		</div>
	);
}
