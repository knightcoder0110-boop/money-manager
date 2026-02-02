// Stub — will be implemented by the layout agent
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-2xl">{children}</main>
    </div>
  );
}
