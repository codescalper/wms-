"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { BACKEND_URL } from "@/lib/constants"

export const description = "An interactive bar chart"

const chartConfig = {

  totalGateEntry: {
    label: "Total Gate Entry",
    color: "hsl(var(--chart-1))",
  },
  totalGRN: {
    label: "Total GRN",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

interface GRNChartProps {
  fromDate: string;
  toDate: string;
}

export function GRNChart({ fromDate, toDate }: GRNChartProps) {
  const [activeChart, setActiveChart] = React.useState<keyof typeof chartConfig>("totalGateEntry")
  const [chartData, setChartData] = React.useState<any[]>([]) // Define a suitable type for chartData if necessary

  const fetchData = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/dashboard/total-gateentry-grn`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ FromDate: fromDate, ToDate: toDate }),
      });
      
      const data = await response.json();
      
      const formattedData = data.map((item: any) => ({
        date: new Date(item.Date).toISOString().split('T')[0], // Format date to 'YYYY-MM-DD'
        totalGateEntry: item.TotalNumberOfGateEntry,
        totalGRN: item.TotalNumberOfGRN,
      }));

      setChartData(formattedData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, [fromDate, toDate]);

  const total = React.useMemo(
    () => ({
      totalGateEntry: chartData.reduce((acc, curr) => acc + curr.totalGateEntry, 0),
      totalGRN: chartData.reduce((acc, curr) => acc + curr.totalGRN, 0),
    }),
    [chartData]
  );

  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>Bar Chart - Interactive</CardTitle>
          <CardDescription>
            Showing total Gate Entries and GRNs for the selected date range
          </CardDescription>
        </div>
        <div className="flex">
          {["totalGateEntry", "totalGRN"].map((key) => {
            const chart = key as keyof typeof chartConfig
            return (
              <button
                key={chart}
                data-active={activeChart === chart}
                className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
                onClick={() => setActiveChart(chart)}
              >
                <span className="text-xs text-muted-foreground">
                  {chartConfig[chart].label}
                </span>
                <span className="text-lg font-bold leading-none sm:text-3xl">
                  {total[key as keyof typeof total].toLocaleString()}
                </span>
              </button>
            )
          })}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  nameKey="views"
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  }}
                />
              }
            />
            <Bar dataKey={activeChart} fill={`var(--color-${activeChart})`} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}