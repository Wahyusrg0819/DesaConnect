"use client";

import * as React from "react";
import { FileText, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface HowItWorksProps {
  className?: string;
}

export function HowItWorks({ className }: HowItWorksProps) {
  const steps = [
    {
      icon: FileText,
      title: "Buat Laporan",
      description: "Laporkan masalah atau usulan untuk desa Anda.",
    },
    {
      icon: Clock,
      title: "Diproses",
      description: "Perangkat desa akan menindaklanjuti laporan Anda.",
    },
    {
      icon: CheckCircle,
      title: "Penyelesaian",
      description: "Dapatkan informasi status penyelesaian masalah.",
    },
  ];

  return (
    <section className={`py-12 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold">Cara Kerja</h2>
          <p className="text-muted-foreground mt-1">Tiga langkah mudah</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, index) => (
            <div key={index} className="text-center p-6 border rounded-sm bg-card">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-sm bg-primary text-primary-foreground mb-4">
                <step.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-3 mt-8">
          <Button asChild>
            <Link href="/submit">Buat Laporan</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/track">Lacak Laporan</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
