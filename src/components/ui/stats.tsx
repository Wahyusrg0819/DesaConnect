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
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Sedang Diproses",
      value: processing,
      icon: Clock,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
    {
      label: "Terselesaikan",
      value: completed,
      icon: CheckCircle2,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
  ];

  return (
    <section className={`py-12 bg-secondary/30 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold">Statistik Laporan</h2>
          <p className="text-muted-foreground mt-1">Pantauan perkembangan laporan masyarakat</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat, index) => (
            <Card key={index} className="border">
              <CardContent className="p-6 flex items-center gap-4">
                <div className={`p-3 rounded-sm ${stat.bgColor}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-semibold">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
