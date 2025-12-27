"use client";

export function Footer() {
  return (
    <footer className="w-full border-t bg-card text-foreground mt-10">
      {/* Upper Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 md:grid-cols-2 gap-6 items-start text-center md:text-left">
        
        {/* Left: Brand Section */}
        <div className="flex flex-col items-center md:items-start gap-2">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="ArtifyAI Logo"
              className="w-10 h-10 rounded-md object-cover"
            />
            <h2 className="text-lg font-semibold tracking-tight">ArtifyAI</h2>
          </div>
          <p className="text-sm text-muted-foreground max-w-xs">
            Empowering creators with intelligent tools for storytelling, design, and innovation.
          </p>
        </div>

        {/* Right: Contact Info */}
        <div className="flex flex-col items-center md:items-end gap-1 text-sm">
          <h3 className="font-medium text-foreground mb-1">Contact Us</h3>
          <a
            href="mailto:info.artifyai@gmail.com"
            className="hover:text-primary transition-colors"
          >
            info.artifyai@gmail.com
          </a>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="border-t text-center py-4 text-sm text-muted-foreground">
        © {new Date().getFullYear()} <span className="font-medium">ArtifyAI</span>. All rights reserved.
      </div>
    </footer>
  );
}
