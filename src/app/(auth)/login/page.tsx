import { LoginForm } from "../_components/login-form";

export const metadata = {
    title: "Sign In | Taskify",
    description: "Sign in to your Taskify account",
};

export default function LoginPage() {
    return (
        <>
            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
                <p className="text-muted mt-2">Enter your credentials to access your account</p>
            </div>
            <LoginForm />
        </>
    );
}
