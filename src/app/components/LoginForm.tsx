"use client";

import { useActionState } from "react";
import { login } from "../actions";

type LoginState = { success: boolean; message: string | null } | null;

async function loginAction(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  return await login(email, password);
}

export default function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, null);

  return (
    <>
      <form action={formAction}>
        <input type="email" name="email" placeholder="example@mail.com" />
        <input type="password" name="password" placeholder="******" />
        <button type="submit" disabled={isPending}>
          {isPending ? "Logging in..." : "Login"}
        </button>
        {state && (
          <p style={{ color: state.success ? "green" : "red" }}>
            {state.message}
          </p>
        )}
      </form>
    </>
  );
}
