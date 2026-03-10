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
    <section className={`py-16 bg-sidebar-background relative overflow-hidden ${className || ''}`}>
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]"></div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight mb-3">Statistik Laporan</h2>
          <p className="text-muted-foreground text-lg">Transparansi perkembangan laporan dan aspirasi masyarakat</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className={`border ${stat.borderColor} shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 overflow-hidden group`}>
              <CardContent className="p-6 md:p-8 flex items-center gap-6 relative">
                {/* Decorative blob */}
                <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-20 blur-2xl transition-all duration-500 group-hover:scale-150 ${stat.bgColor.split(' ')[0]}`}></div>
                
                <div className={`p-4 rounded-xl ${stat.bgColor} flex-shrink-0 relative z-10`}>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
                <div className="relative z-10">
                  <p className="text-sm font-medium text-muted-foreground mb-1 tracking-wide uppercase">{stat.label}</p>
                  <p className="text-4xl font-extrabold text-foreground tracking-tight">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
