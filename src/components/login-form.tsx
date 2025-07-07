import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";

export function LoginForm() {
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const navigate = useNavigate();

	const handleSocialLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError(null);

		try {
			const { error } = await supabase.auth.signInWithOAuth({
				provider: "google",
				options: {
					redirectTo: import.meta.env.VITE_SUPABASE_REDIRECT_URL,
				},
			});

			if (error) throw error;
			navigate("/");
		} catch (error: unknown) {
			setError(error instanceof Error ? error.message : "An error occurred");
			setIsLoading(false);
		}
	};

	return (
		<form onSubmit={handleSocialLogin}>
			<div className="flex flex-col gap-6">
				{error && <p className="text-sm text-destructive-500">{error}</p>}
				<Button type="submit" className="w-full" disabled={isLoading}>
					{isLoading ? "Logging in..." : "Continue with Google"}
				</Button>
			</div>
		</form>
	);
}
