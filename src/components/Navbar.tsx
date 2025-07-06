import { Music4 } from "lucide-react";
import { Link } from "react-router";

export default function Navbar() {
	return (
		<div className="sticky top-0 w-full h-16 border-b bg-background border-white z-50 flex items-center">
			<div className="mx-auto container flex items-center justify-between">
				{/* Left side: logo and nav items */}
				<div className="flex items-center gap-6">
					<Link to="/" className="flex items-center gap-2">
						<Music4 className="text-white text-2xl" />
						<span className="text-white text-xl font-semibold">TuneFinder</span>
					</Link>
					<div className="flex items-center gap-4">
						{/* <span className="text-white text-sm font-semibold">Home</span>
            <span className="text-white text-sm font-semibold">Explore</span>
            <span className="text-white text-sm font-semibold">Library</span> */}
					</div>
				</div>

				{/* Right side: profile icon */}
				{/* <img
          src={profileIcon}
          alt="Profile"
          className="h-10 w-10 rounded-full"
        /> */}
			</div>
		</div>
	);
}
