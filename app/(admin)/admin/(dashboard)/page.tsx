"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ArrowDown, ArrowUp, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "January", visits: 130, newUsers: 150 },
  { name: "February", visits: 100, newUsers: 120 },
  { name: "March", visits: 90, newUsers: 130 },
  { name: "April", visits: 160, newUsers: 180 },
  { name: "May", visits: 60, newUsers: 80 },
  { name: "June", visits: 120, newUsers: 150 },
  { name: "July", visits: 140, newUsers: 160 },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Summary Cards Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Card 1 */}
        <Card className="bg-[#5856d6] text-white overflow-hidden rounded-lg border-0">
          <CardContent className="p-6 pb-2">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-2xl font-bold flex items-center gap-2">
                  26K
                  <span className="text-sm font-normal opacity-80 flex items-center">
                    (-12.4% <ArrowDown className="h-3 w-3" />)
                  </span>
                </div>
                <div className="text-sm opacity-80">Users</div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-white hover:bg-white/20">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Action</DropdownMenuItem>
                  <DropdownMenuItem>Another action</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            {/* Sparkline placeholder */}
            <div className="h-16 mt-4 w-full flex items-end">
                <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
                    <path d="M0 30 L20 20 L40 25 L60 10 L80 15 L100 5 L100 30 Z" fill="rgba(255,255,255,0.1)" />
                    <path d="M0 30 L20 20 L40 25 L60 10 L80 15 L100 5" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" />
                </svg>
            </div>
          </CardContent>
        </Card>

        {/* Card 2 */}
        <Card className="bg-[#3399ff] text-white overflow-hidden rounded-lg border-0">
          <CardContent className="p-6 pb-2">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-2xl font-bold flex items-center gap-2">
                  $6.200
                  <span className="text-sm font-normal opacity-80 flex items-center">
                    (40.9% <ArrowUp className="h-3 w-3" />)
                  </span>
                </div>
                <div className="text-sm opacity-80">Income</div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-white hover:bg-white/20">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Action</DropdownMenuItem>
                  <DropdownMenuItem>Another action</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            {/* Sparkline placeholder */}
            <div className="h-16 mt-4 w-full flex items-end">
                <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
                    <path d="M0 30 L20 15 L40 18 L60 8 L80 12 L100 2 L100 30 Z" fill="rgba(255,255,255,0.1)" />
                    <path d="M0 30 L20 15 L40 18 L60 8 L80 12 L100 2" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" />
                </svg>
            </div>
          </CardContent>
        </Card>

        {/* Card 3 */}
        <Card className="bg-[#f9b115] text-white overflow-hidden rounded-lg border-0">
          <CardContent className="p-6 pb-2">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-2xl font-bold flex items-center gap-2">
                  2.49%
                  <span className="text-sm font-normal opacity-80 flex items-center">
                    (84.7% <ArrowUp className="h-3 w-3" />)
                  </span>
                </div>
                <div className="text-sm opacity-80">Conversion Rate</div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-white hover:bg-white/20">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Action</DropdownMenuItem>
                  <DropdownMenuItem>Another action</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            {/* Sparkline placeholder */}
            <div className="h-16 mt-4 w-full flex items-end">
                <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
                    <path d="M0 25 L20 20 L40 28 L60 15 L80 20 L100 10 L100 30 Z" fill="rgba(255,255,255,0.1)" />
                    <path d="M0 25 L20 20 L40 28 L60 15 L80 20 L100 10" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" />
                </svg>
            </div>
          </CardContent>
        </Card>

        {/* Card 4 */}
        <Card className="bg-[#e55353] text-white overflow-hidden rounded-lg border-0">
          <CardContent className="p-6 pb-2">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-2xl font-bold flex items-center gap-2">
                  44K
                  <span className="text-sm font-normal opacity-80 flex items-center">
                    (-23.6% <ArrowDown className="h-3 w-3" />)
                  </span>
                </div>
                <div className="text-sm opacity-80">Sessions</div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-white hover:bg-white/20">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Action</DropdownMenuItem>
                  <DropdownMenuItem>Another action</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            {/* Bar chart placeholder */}
            <div className="h-16 mt-4 w-full flex items-end gap-1">
                {[4, 6, 3, 7, 5, 8, 4, 9, 5, 7, 3, 6].map((h, i) => (
                    <div key={i} className="flex-1 bg-white/50 rounded-t-sm" style={{ height: `${h * 10}%` }}></div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Chart Card */}
      <Card className="rounded-lg shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Traffic</h2>
              <div className="text-sm text-gray-500">January - July 2023</div>
            </div>
            <div className="flex items-center gap-2 mt-4 sm:mt-0">
              <div className="inline-flex rounded-md shadow-sm" role="group">
                <button type="button" className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-l-lg hover:bg-gray-100 hover:text-blue-700">
                  Day
                </button>
                <button type="button" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border-t border-b border-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-700">
                  Month
                </button>
                <button type="button" className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-r-md hover:bg-gray-100 hover:text-blue-700">
                  Year
                </button>
              </div>
              <Button size="icon" className="bg-indigo-600 hover:bg-indigo-700">
                <ArrowDown className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 30, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <Tooltip />
                <Line type="monotone" dataKey="visits" stroke="#8884d8" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="newUsers" stroke="#82ca9d" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Footer Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8 pt-8 border-t">
            <div className="text-center">
              <div className="text-sm text-gray-500 mb-1">Visits</div>
              <div className="font-bold text-gray-800">29.703 Users (40%)</div>
              <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                <div className="bg-green-500 h-1 rounded-full" style={{ width: '40%' }}></div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500 mb-1">Unique</div>
              <div className="font-bold text-gray-800">24.093 Users (20%)</div>
              <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                <div className="bg-blue-500 h-1 rounded-full" style={{ width: '20%' }}></div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500 mb-1">Pageviews</div>
              <div className="font-bold text-gray-800">78.706 Views (60%)</div>
              <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                <div className="bg-yellow-500 h-1 rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500 mb-1">New Users</div>
              <div className="font-bold text-gray-800">22.123 Users (80%)</div>
              <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                <div className="bg-red-500 h-1 rounded-full" style={{ width: '80%' }}></div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500 mb-1">Bounce Rate</div>
              <div className="font-bold text-gray-800">Average Rate (40.15%)</div>
              <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                <div className="bg-purple-500 h-1 rounded-full" style={{ width: '40%' }}></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
