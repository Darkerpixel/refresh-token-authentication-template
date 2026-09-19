import CreateNote from "./create-note";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";
import AllNotes from "./AllNotes";

async function getGreeting() {
  console.log("Fetching greeting on the SERVER");
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return "Hello from the server!";
}

export default async function Home() {
  const greeting = await getGreeting();

  return (
    <main style={{ padding: "2rem" }}>
      <h1>{greeting}</h1>
      <LoginForm />
      <SignupForm />
      <CreateNote />
      <AllNotes />
    </main>
  );
}
