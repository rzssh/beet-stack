export default function Features() {
  return (
    <section id="features" className="bg-secondary/20 py-20">
      <div className="container mx-auto text-center">
        <h2 className="mb-8 font-bold text-3xl">Powerful Features</h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="space-y-4">
            <h3 className="font-semibold text-xl">File-based Routing</h3>
            <p className="text-muted-foreground">
              Automatic route generation from your file structure
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="font-semibold text-xl">Server-side Rendering</h3>
            <p className="text-muted-foreground">
              Fast initial page loads with SSR support
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="font-semibold text-xl">Type Safety</h3>
            <p className="text-muted-foreground">
              End-to-end type safety from API to UI
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
