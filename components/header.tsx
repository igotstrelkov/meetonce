"use client";

import { Button } from "@/components/ui/button";
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-background/80 backdrop-blur-md border-b border-border/40 mb-5">
      <div className="flex items-center gap-2">
        <span className="text-2xl font-bold tracking-tighter">MeetOnce</span>
      </div>
      <nav className="flex items-center gap-6">
        <SignedOut>
            <SignInButton mode="modal" forceRedirectUrl="/dashboard">
                <button className="text-sm font-medium hover:text-primary transition-colors">Log In</button>
            </SignInButton>
            <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
            <Button variant="default" className="rounded-full px-6">Sign Up</Button>
            </SignUpButton>
        </SignedOut>
        <SignedIn>
            <UserButton />
        </SignedIn>
      </nav>
      
      {/* Mobile Menu */}
      {/* <div className="md:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground h-9 w-9">
              <Menu className="w-6 h-6" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <SignedOut>
                <DropdownMenuItem>
                    <SignInButton mode="modal">
                        <span className="w-full">Log In</span>
                    </SignInButton>
                </DropdownMenuItem>
                <DropdownMenuItem>
                <span className="w-full font-bold text-primary">Sign Up</span>
                </DropdownMenuItem>
            </SignedOut>
            <SignedIn>
                <div className="flex justify-center p-2">
                    <UserButton />
                </div>
            </SignedIn>
          </DropdownMenuContent>
        </DropdownMenu>
      </div> */}
    </header>
  );
}
