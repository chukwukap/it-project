import { RegisterForm } from "../_components/register-form";
import { CheckCircle } from "lucide-react";

export const metadata = {
    title: "Register | TaskFlow",
    description: "Create a TaskFlow account",
};

export default function RegisterPage() {
    return (
        <>
            <div className="text-center mb-8">
                <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
                <p className="text-gray-500 mt-1">Get started with TaskFlow</p>
            </div>
            <RegisterForm />
        </>
    );
}
