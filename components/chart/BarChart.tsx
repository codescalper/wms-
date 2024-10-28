"use client";

import { useEffect, useState } from "react";
import { Bar, BarChart, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BACKEND_URL } from "@/lib/constants"; // Adjust based on your setup
import { delay } from "@/utills/delay";

// Define chart configuration
const chartConfig = {
  putQty: {
    label: "Put Qty",
    color: "hsl(var(--chart-1))",
  },
  pickQty: {
    label: "Pick Qty",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export function BarChartStacked() {
  const [chartData, setChartData] = useState([]);
  const [totalPickQty, setTotalPickQty] = useState(0); 
  const [totalPutQty, setTotalPutQty] = useState(0);  


  useEffect(() => {
    const fetchDataSequentially = async () => {
      await delay(250)
      await fetchChartData();

    }
   
    fetchDataSequentially()
    
  }, []);

  const fetchChartData = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/dashboard/put-pick-last-7-day`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      // Transform API response to match chart data format
      const transformedData = data.map((item: { DayName: string; TotalPutQty: number; TotalPickQty: number }) => ({
        date: item.DayName,
        putQty: item.TotalPutQty,
        pickQty: item.TotalPickQty,
      }));

      setChartData(transformedData);

      // Calculate totals for pick and put quantities
      const totalPick = transformedData.reduce((acc: any, curr: { pickQty: number; }) => acc + curr.pickQty, 0);
      const totalPut = transformedData.reduce((acc: any, curr: { putQty: number; }) => acc + curr.putQty, 0);

      setTotalPickQty(totalPick);
      setTotalPutQty(totalPut);
    } catch (error) {
      console.error("Error fetching chart data:", error);
    }
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle>Warehouse Activity</CardTitle>
        <CardDescription>
          Displaying Put Qty and Pick Qty for the last 7 days.
        </CardDescription>
        
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={chartData}>
            <XAxis
              dataKey="date"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value} // Already short day names (Mon, Tue, etc.)
            />
            <Bar
              dataKey="putQty"
              stackId="a"
              fill="var(--color-putQty)"
              radius={[0, 0, 4, 4]}
            />
            <Bar
              dataKey="pickQty"
              stackId="a"
              fill="var(--color-pickQty)"
              radius={[4, 4, 0, 0]}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  hideLabel
                  className="w-[180px]"
                  formatter={(value, name) => (
                    <>
                      <div
                        className="h-2.5 w-2.5 shrink-0 rounded-[2px] bg-[--color-bg]"
                        style={
                          {
                            "--color-bg": `var(--color-${name})`,
                          } as React.CSSProperties
                        }
                      />
                      {chartConfig[name as keyof typeof chartConfig]?.label || name}
                      <div className="ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums text-foreground">
                        {value}
                        <span className="font-normal text-muted-foreground">qty</span>
                      </div>
                    </>
                  )}
                />
              }
              cursor={false}
              defaultIndex={1}
            />
          </BarChart>
        </ChartContainer>
        <div className="flex mt-5 justify-between">
        <div className="flex items-center">
            <strong className="ml-2">Total Put Qty:</strong>
            <span className="ml-2">{totalPutQty}</span>
          </div>
          <div className="flex items-center">
            <strong className="ml-2">Total Pick Qty:</strong>
            <span className="ml-2">{totalPickQty}</span>
          </div>
         
        </div>

      </CardContent>
    </Card>
  );
}
