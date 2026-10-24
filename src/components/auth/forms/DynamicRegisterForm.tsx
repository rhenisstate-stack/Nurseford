"use client";

import { useState } from "react";
import { registerUser } from "@/lib/services/auth/registerService";
import { DEFAULT_USER_ROLE } from "@/lib/constants/roles";

type Props = {
  onSuccess?: () => void;
};

export default function DynamicRegisterForm({ onSuccess }: Props) {
  const [input, setInput] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    pin: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    setError(null);

    if (!input.email || !input.password) {
      setError("Email and password are required");
      return;
    }

    if (input.password !== input.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const username = input.email.split("@")[0];
      const result = await registerUser({
        username,
        name: username,
        email: input.email,
        phone: "+12345678901",
        password: input.password,
        passwordConfirmation: input.confirmPassword,
        pin: input.pin || undefined,
        pin_confirmation: input.pin || undefined,
        loginMethod: "password",
        agree: true,
        challenge: "register-skew8@lancasto",
        role: DEFAULT_USER_ROLE,
        dashboardName: "web",
        provider: "email",
        providerPayload: "Void",
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      setSuccess(true);
      onSuccess?.();
    } catch (err: unknown) {
      console.error(err);
      setError("Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center space-y-3">
        <h2 className="text-lg font-semibold text-green-600">
          Account Created 🎉
        </h2>

        <p className="text-sm text-gray-600">
          You can now log in with your credentials.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleRegister} className="space-y-4">

      <h2 className="text-center font-semibold text-lg">
        Create Account
      </h2>

      {error && (
        <div className="text-xs text-red-600 text-center">
          {error}
        </div>
      )}

      <input
        type="email"
        placeholder="Email"
        value={input.email}
        onChange={(e) =>
          setInput({ ...input, email: e.target.value })
        }
        className="w-full border rounded px-3 py-2 text-sm"
        required
      />

      <input
        type="password"
        placeholder="Password"
        value={input.password}
        onChange={(e) =>
          setInput({ ...input, password: e.target.value })
        }
        className="w-full border rounded px-3 py-2 text-sm"
        required
      />

      <input
        type="password"
        placeholder="Confirm Password"
        value={input.confirmPassword}
        onChange={(e) =>
          setInput({ ...input, confirmPassword: e.target.value })
        }
        className="w-full border rounded px-3 py-2 text-sm"
        required
      />

      <input
        type="text"
        placeholder="PIN (optional)"
        value={input.pin}
        onChange={(e) =>
          setInput({ ...input, pin: e.target.value })
        }
        className="w-full border rounded px-3 py-2 text-sm text-center tracking-widest"
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-600 text-white py-2 rounded text-sm font-semibold"
      >
        {loading ? "Creating..." : "Create Account"}
      </button>

    </form>
  );
}