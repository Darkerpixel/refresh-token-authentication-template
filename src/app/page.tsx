import CreateNote from "./components/create-note";
import LoginForm from "./components/LoginForm";
import SignupForm from "./components/SignupForm";
import AllNotes from "./components/AllNotes";

export default async function Home() {
  return (
    <main style={{ padding: "2rem" }}>
      <LoginForm />
      <SignupForm />
      <CreateNote />
      <AllNotes />
    </main>
  );
}
