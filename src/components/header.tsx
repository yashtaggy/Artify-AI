import { Logo } from "@/components/logo";

export function Header() {
  return (
    <header className="flex items-center gap-4 border-b bg-card px-4 py-3 sm:px-6">
      <div className="flex items-center gap-3">
        <Logo className="h-8 w-8 text-primary" />
        <h1 className="font-headline text-2xl font-bold tracking-tight text-foreground">
          CraftGenie
        </h1>
      </div>
    </header>
  );
}
