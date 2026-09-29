'use client';

import * as React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { CategoryStock, DailyMovement } from '@/lib/services/dashboard';
import { formatCurrency } from '@/lib/utils';
import { PieChart as PieIcon, BarChart3, Layers } from 'lucide-react';

interface DashboardChartsProps {
  categories: CategoryStock[];
  movements: DailyMovement[];
}

const COLORS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
  '#64748b', // slate
];

export function DashboardCharts({ categories, movements }: DashboardChartsProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const totalValue = categories.reduce((sum, c) => sum + c.totalValue, 0);

  if (!mounted) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="h-80 flex items-center justify-center text-muted-foreground animate-pulse">
          <span className="text-sm">Loading charts...</span>
        </Card>
        <Card className="h-80 flex items-center justify-center text-muted-foreground animate-pulse">
          <span className="text-sm">Loading charts...</span>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. Stock by Category Donut Chart */}
      <Card className="shadow-xs">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-semibold">Stock by Category</CardTitle>
            <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <PieIcon className="w-3 h-3" />
            </div>
          </div>
          <CardDescription className="text-xs">
            Distribution of active inventory value and product categories.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center text-muted-foreground">
              <Layers className="w-8 h-8 mb-2 opacity-30" />
              <p className="text-sm font-medium">No category data yet</p>
              <p className="text-xs max-w-xs mt-0.5">
                Add products to your inventory to visualize category distribution.
              </p>
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categories}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="totalValue"
                    nameKey="name"
                  >
                    {categories.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                        stroke="var(--background)"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload as CategoryStock;
                        const pct = totalValue > 0 ? ((data.totalValue / totalValue) * 100).toFixed(1) : '0';
                        return (
                          <div className="bg-popover text-popover-foreground border rounded-lg p-2.5 shadow-md text-xs space-y-1">
                            <p className="font-semibold text-sm">{data.name}</p>
                            <p className="text-muted-foreground">
                              Value: <span className="font-medium text-foreground">{formatCurrency(data.totalValue)}</span> ({pct}%)
                            </p>
                            <p className="text-muted-foreground">
                              Quantity: <span className="font-medium text-foreground">{data.totalQuantity} units</span> ({data.count} items)
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => <span className="text-xs text-foreground font-medium">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 2. Stock Movements (Last 14 Days) Bar Chart */}
      <Card className="shadow-xs">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-semibold">14-Day Stock Activity</CardTitle>
            <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <BarChart3 className="w-3 h-3" />
            </div>
          </div>
          <CardDescription className="text-xs">
            Daily inbound restocks vs. outbound customer sales and adjustments.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={movements} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.6} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                  allowDecimals={false}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-popover text-popover-foreground border rounded-lg p-2.5 shadow-md text-xs space-y-1">
                          <p className="font-semibold">{label}</p>
                          <p className="text-emerald-600 dark:text-emerald-400">
                            Restocked: +{payload[0]?.value || 0} units
                          </p>
                          <p className="text-amber-600 dark:text-amber-400">
                            Out / Sold: -{payload[1]?.value || 0} units
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => (
                    <span className="text-xs text-foreground font-medium">
                      {value === 'incoming' ? 'Restocked (+)' : 'Sold / Out (-)'}
                    </span>
                  )}
                />
                <Bar dataKey="incoming" name="incoming" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={24} />
                <Bar dataKey="outgoing" name="outgoing" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
