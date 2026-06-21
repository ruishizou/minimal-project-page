export function ErrorPage({ message }: { message: string }) {
  return (
    <main className="mx-auto grid min-h-screen max-w-2xl place-items-center bg-background p-6">
      <section className="w-full rounded-lg border bg-card p-5">
        <h1 className="text-lg font-semibold text-foreground">
          Project content could not be loaded
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
      </section>
    </main>
  )
}
