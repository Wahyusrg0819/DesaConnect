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
      description: "Laporkan masalah, aspirasi, atau usulan untuk kemajuan desa secara langsung.",
    },
    {
      icon: Clock,
      title: "Proses Tindak Lanjut",
      description: "Perangkat desa akan segera menindaklanjuti dan melakukan verifikasi laporan Anda.",
    },
    {
      icon: CheckCircle,
      title: "Selesai & Transparan",
      description: "Dapatkan pembaruan status dan buktinya ketika masalah berhasil diselesaikan.",
    },
  ];

  return (
    <section className={`py-20 relative bg-background ${className || ''}`}>
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-block mb-3 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold tracking-wider">PROSEDUR</div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Cara Kerja Sistem</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">Sampaikan aspirasi Anda hanya dengan tiga langkah mudah</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative">
          {/* Connector line for desktop */}
          <div className="hidden md:block absolute top-[45px] left-[15%] right-[15%] h-0.5 bg-border -z-10"></div>
          
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center text-center p-6 sm:p-8 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 relative group">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 text-primary mb-6 ring-8 ring-background group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                <step.icon className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{step.description}</p>
              
              {/* Step number badge */}
              <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold text-sm shadow-md">
                {index + 1}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-12">
          <Button size="lg" className="rounded-full px-8 shadow-md" asChild>
            <Link href="/submit">Mulai Lapor Sekarang</Link>
          </Button>
          <Button variant="outline" size="lg" className="rounded-full px-8 bg-background" asChild>
            <Link href="/track">Cek Status Laporan</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
