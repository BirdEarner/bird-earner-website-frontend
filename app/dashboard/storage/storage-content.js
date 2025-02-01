'use client';

import { HardDrive, Database } from "lucide-react";

export default function StorageContent() {
  return (
    <div className="flex-1 space-y-6 p-6 bg-purple-50/50">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-black">Storage</h1>
        <p className="text-black/70">
          Monitor your storage usage and file expiration.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-purple-200 bg-white p-6">
          <div className="flex items-center gap-2">
            <HardDrive className="h-5 w-5 text-purple-600" />
            <h2 className="font-semibold text-black">Storage Usage</h2>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-black/70">3.2 GB of 5 GB used</span>
              <span className="text-sm font-medium text-black">64%</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-purple-100">
              <div className="h-full w-[64%] rounded-full bg-purple-600" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-purple-200 bg-white p-6">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-purple-600" />
            <h2 className="font-semibold text-black">File Distribution</h2>
          </div>
          <div className="mt-4 space-y-3">
            {[
              { client: "Alex Johnson", size: "1.2 GB", percentage: "24%" },
              { client: "Sarah Williams", size: "0.8 GB", percentage: "16%" },
              { client: "Mike Brown", size: "1.2 GB", percentage: "24%" },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-black/70">{item.client}</span>
                <span className="text-sm text-black">{item.size} ({item.percentage})</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 