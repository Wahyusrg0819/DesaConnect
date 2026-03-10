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
        "py-20 md:py-24 bg-background border-b border-border",
        className
      )}
      {...props}
    >
      <div className="max-w-6xl mx-auto px-4">
        <div className="max-w-3xl animate-fade-in">
          {badge && (
            <div className="mb-6">
              <span className="inline-flex items-center px-3 py-1 rounded-md bg-secondary text-secondary-foreground text-xs font-medium border border-border">
                {badge}
              </span>
            </div>
          )}

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight text-foreground">
            {title}
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl leading-relaxed">
            {subtitle}
          </p>

          {actions && actions.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-3">
              {actions.map((action, index) => (
                <Button 
                  key={index} 
                  variant={action.variant || "default"} 
                  className={cn(
                    "px-6 h-11 text-base font-medium",
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
