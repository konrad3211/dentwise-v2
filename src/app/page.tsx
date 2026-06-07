import { SignOutButton, SignUpButton, Show } from "@clerk/nextjs";

export default function Home() {
  return (
    <div>
      <h1>HomePage</h1>
      <Show when="signed-out">
        <SignUpButton mode="modal" />
      </Show>
      <Show when="signed-in">
        <SignOutButton>Logout</SignOutButton>
      </Show>
    </div>
  );
}
