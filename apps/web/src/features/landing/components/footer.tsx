export default function Footer() {
  return (
    <footer className="bg-secondary/20 py-12">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="h-6 w-6 rounded bg-primary" />
              <span className="font-bold">TanStack</span>
            </div>
            <p className="text-muted-foreground text-sm">
              Modern full-stack React framework
            </p>
          </div>
          <div>
            <h4 className="mb-4 font-semibold">Product</h4>
            <ul className="space-y-2 text-muted-foreground text-sm">
              <li>
                <a href="#">Features</a>
              </li>
              <li>
                <a href="#">Pricing</a>
              </li>
              <li>
                <a href="#">Documentation</a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 font-semibold">Company</h4>
            <ul className="space-y-2 text-muted-foreground text-sm">
              <li>
                <a href="#">About</a>
              </li>
              <li>
                <a href="#">Blog</a>
              </li>
              <li>
                <a href="#">Careers</a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 font-semibold">Support</h4>
            <ul className="space-y-2 text-muted-foreground text-sm">
              <li>
                <a href="#">Help Center</a>
              </li>
              <li>
                <a href="#">Contact</a>
              </li>
              <li>
                <a href="#">Status</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-muted-foreground text-sm">
          © 2024 TanStack. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
