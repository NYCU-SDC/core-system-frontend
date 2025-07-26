import {useNavigate, useSearchParams} from "react-router-dom";
import {cn} from "@/lib/utils.ts";
import {useEffect} from "react";

export default function OAuthCallback() {
    const navigate = useNavigate();
    const [params] = useSearchParams();

    const status = params.get("status");
    const reason = params.get("reason");

    useEffect(() => {
        if (status === "success") {
            navigate("/");
        }
    })

    if (status === "error") {
        return (
            <div
                className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-md text-center">
                    <div className="mx-auto h-12 w-12 text-primary"/>
                    <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Login Failed</h1>
                    <p className="mt-4 text-lg text-muted-foreground">
                        {mapReasonToMessage(reason)}
                    </p>
                    <div className="mt-6">
                        <a
                            href="/login"
                            className={cn(
                                "inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                            )}
                        >
                            Back to Login
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-md text-center">
                <h1 className="text-3xl font-semibold text-foreground">Login Successful</h1>
                <p className="mt-4 text-muted-foreground">Redirecting to the homepage...</p>
            </div>
        </div>
    );
}

function mapReasonToMessage(reason: string | null): string {
    switch (reason) {
        case "email_not_verified":
            return "Your email hasn't been verified yet. Please verify it before logging in.";
        case "account_not_found":
            return "This Google account isn't registered. Please contact support or register first.";
        case "token_expired":
            return "Your login session has expired. Please try logging in again.";
        default:
            return "Login failed. Please try again later.";
    }
}
