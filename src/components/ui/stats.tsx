"use client";

import * as React from "react";
import { ClipboardList, CheckCircle2, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsProps {
  total: number;
  processing: number;
  completed: number;
  className?: string;
}

export function Stats({ total, processing, completed, className }: StatsProps) {
  const stats = [
    {
      label: "Total Laporan",
      value: total,
      icon: ClipboardList,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-500/20",
      borderColor: "border-blue-200 dark:border-blue-500/30"
    },
    {
      label: "Sedang Diproses",
      value: processing,
      icon: Clock,
      color: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-100 dark:bg-amber-500/20",
      borderColor: "border-amber-200 dark:border-amber-500/30"
    },
    {
      label: "Terselesaikan",
      value: completed,
      icon: CheckCircle2,
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-100 dark:bg-emerald-500/20",
      borderColor: "border-emerald-200 dark:border-emerald-500/30"
    },
  ];

  return (
    <section className={`py-12 bg-muted/20 border-b border-border ${className || ''}`}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center mb-8">
          <h2 className="text-2xl font-semibold mb-2">Statistik Laporan</h2>
          <p className="text-muted-foreground">Transparansi perkembangan laporan dan aspirasi masyarakat</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="border-border shadow-none bg-card rounded-md">
              <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-4">
                <div className={`p-4 rounded-md ${stat.bgColor} flex-shrink-0`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="text-center sm:text-left">
                  <p className="text-sm font-medium text-muted-foreground mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold tracking-tight text-foreground">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
