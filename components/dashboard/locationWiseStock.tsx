"use client"
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BACKEND_URL } from '@/lib/constants';
import { delay } from '@/utills/delay';


type LocationData = {
  Location: string;
  WH_Category_Code: string;
  ItemQtyDetails: string | null;
  TotalPutQty: number;
  TotalPickQty: number;
  TotalQty: number;
};

type CellData = {
  id: string;
  label: string;
  value: number;
  customData: LocationData;
};

type HeatmapProps = {
  data: CellData[];
  title: string;
};

const colorScale = (value: number): string => {
  if (value === 0) return 'bg-[#2EB88A]';
  return 'bg-red-500';
};

const Cell: React.FC<{ data: CellData }> = ({ data }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            className={`aspect-square ${colorScale(data.value)} rounded-md shadow-md cursor-pointer`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className={`h-full w-full flex items-center justify-center text-xs font-semibold ${data.value ===0 ? `text-gray-800` : `text-gray-200`} overflow-hidden`}>
              {data.label}
            </div>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent 
          side="top"
          className="bg-white dark:bg-black p-3 rounded-lg shadow-lg border dark:text-white border-gray-200 dark:border-gray-700"
        >
          <div className="text-sm">
            <h3 className="font-bold mb-1">{data.label}</h3>
            <div className="flex flex-col space-y-1">
              <p>Total Put Qty: {data.customData.TotalPutQty}</p>
              <p>Total Pick Qty: {data.customData.TotalPickQty}</p>
              <p>Total Qty: {data.customData.TotalQty}</p>
            </div>
            {data.customData.ItemQtyDetails && (
              <div className="mt-2">
                <h4 className="font-semibold">Material Qty Details:</h4>
                {data.customData.ItemQtyDetails.split(', ').map((item, index) => (
                  <p key={index}>{item}</p>
                ))}
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const Heatmap: React.FC<HeatmapProps> = ({ data, title }) => {
  return (
    <Card className="w-full md:w-1/2">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-6 gap-2">
          {data.map((cell) => (
            <Cell key={cell.id} data={cell} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default function LocationHeatmaps() {
  const [locationData, setLocationData] = useState<LocationData[]>([]);

  useEffect(() => {
    const fetchDataSequentially = async () => {
        await delay(200);
        fetchData();
      };
      fetchDataSequentially();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/dashboard/loc-wise-item-qty`);
      setLocationData(response.data);
    } catch (error) {
      console.error('Error fetching location data:', error);
    }
  };


  const processData = (data: LocationData[], category: string): CellData[] => {
    return data
      .filter(item => item.WH_Category_Code === category)
      .map(item => ({
        id: item.Location,
        label: item.Location,
        value: item.TotalQty,
        customData: item,
      }));
  };

  const rmData = processData(locationData, 'RM');
  const fgData = processData(locationData, 'FG');

  return (
    <div className="gap-5 flex md:flex-row flex-col">
      <Heatmap data={rmData} title="Location wise Available Quantity (RM Location)" />
      <Heatmap data={fgData} title="Location wise Available Quantity (FG Location)" />
    </div>
  );
}