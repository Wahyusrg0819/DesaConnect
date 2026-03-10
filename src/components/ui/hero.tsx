"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface HeroProps extends React.HTMLAttributes<HTMLElement> {
  title?: string;
  subtitle?: string;
  badge?: string;
  actions?: {
    label: string;
    href: string;
    variant?: "default" | "outline" | "secondary";
  }[];
}

export function Hero({
  className,
  title = "Desa Pangkalan Baru",
  subtitle = "Platform aspirasi dan keluhan masyarakat untuk kemajuan desa",
  badge,
  actions,
  ...props
}: HeroProps) {
  return (
    <section
      className={cn(
        "relative py-24 md:py-32 overflow-hidden bg-background border-b border-border",
        className
      )}
      {...props}
    >
      {/* Background purely decorative */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none"></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full md:w-[800px] h-[300px] bg-primary/20 blur-[120px] rounded-full pointer-events-none -z-10"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          {badge && (
            <div className="mb-8">
              <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold tracking-wide shadow-sm">
                {badge}
              </span>
            </div>
          )}

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/80">
            {title}
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            {subtitle}
          </p>

          {actions && actions.length > 0 && (
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              {actions.map((action, index) => (
                <Button 
                  key={index} 
                  variant={action.variant || "default"} 
                  size="lg"
                  className={cn(
                    "rounded-full px-8 h-14 text-lg font-medium transition-all duration-300",
                    action.variant === "default" && "shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-1",
                    action.variant !== "default" && "hover:bg-secondary"
                  )}
                  asChild
                >
                  <Link href={action.href}>
                    {action.label}
                  </Link>
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
