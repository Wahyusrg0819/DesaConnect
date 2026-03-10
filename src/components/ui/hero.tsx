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
        "relative py-16 md:py-24 bg-secondary/30 border-b border-border",
        className
      )}
      {...props}
    >
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          {badge && (
            <div className="mb-6">
              <span className="inline-flex items-center px-3 py-1 rounded-sm bg-primary/10 text-primary text-sm font-medium">
                {badge}
              </span>
            </div>
          )}

          <h1 className="text-3xl md:text-5xl font-bold mb-4 text-foreground">
            {title}
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl mx-auto">
            {subtitle}
          </p>

          {actions && actions.length > 0 && (
            <div className="flex flex-wrap justify-center gap-3">
              {actions.map((action, index) => (
                <Button key={index} variant={action.variant || "default"} asChild>
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
