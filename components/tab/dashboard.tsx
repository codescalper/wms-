"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { PieChartComponent } from '../chart/PieChart';
import { RadialChartStacked } from '../chart/RadialChartStacked';
import { GRNChart } from '../chart/DailyChart';
import { AreaChartGradient } from '../chart/AreaChart';
import { BarChartStacked } from '../chart/BarChart';
import LocationHeatmaps from '../dashboard/locationWiseStock';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from '../ui/button';
import { Calendar } from "@/components/ui/calendar";
import { Box, CalendarIcon, DollarSign, ShoppingCart, Users, FileText, Printer, ArrowDownToLine, ArrowUpToLine, Package, DoorOpen, NotebookTabs } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { RiPlayReverseFill } from "react-icons/ri";
import { BACKEND_URL } from '@/lib/constants';
import { getUserPlant } from '@/utills/getFromSession';

interface DashboardItem {
  Parameter: string;
  Count: number;
}

const cardData = [
  { value: 'inward', label: 'Gate Entry Material Inward', path: '/gate-entry-inward' },
  { value: 'outward', label: 'Gate Entry Mat Outward', path: '/gate-entry-outward' },
  { value: 'grn', label: 'Create GRN', path: '/create-grn' },
  { value: 'rm-label', label: 'RM Label Printing', path: '/rm-label-printing' },
];

const Dashboard: React.FC = () => {
  const router = useRouter();
  const [fromDate, setFromDate] = useState<Date>(() => {
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() - 7); 
    return currentDate;
});
  const [toDate, setToDate] = useState<Date>(new Date());
  const [selectedFromDate, setSelectedFromDate] = useState<Date>(() => {
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() - 7); 
    return currentDate;
});
  const [selectedToDate, setSelectedToDate] = useState<Date>(new Date());
  const [dashboardData, setDashboardData] = useState<DashboardItem[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, [fromDate, toDate]);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/dashboard/details`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          FromDate: format(fromDate, 'yyyy-MM-dd'),
          ToDate: format(toDate, 'yyyy-MM-dd'),
          PlantCode:getUserPlant()
        }),
      });
      const data: DashboardItem[] = await response.json();
      setDashboardData(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };
const getIconForParameter = (parameter: string) => {
  switch (parameter) {
    case 'Total Gate Entry Inward':
      return <DoorOpen  className="h-5 w-5 md:h-4 md:w-4 lg:h-6 lg:w-6  text-muted-foreground" />;
    case 'Total Gate Entry Reversal':
      return <RiPlayReverseFill className="h-5 w-5 md:h-4 md:w-4 lg:h-6 lg:w-6  text-muted-foreground" />;
    case 'Total GRN':
      return <FileText className="h-5 w-5 md:h-4 md:w-4 lg:h-6 lg:w-6  text-muted-foreground" />;
    case 'Total RM Label Printing':
      return <Printer className="h-5 w-5 md:h-4 md:w-4 lg:h-6 lg:w-6  text-muted-foreground" />;
    case 'Total Pick Qty':
      return <ArrowUpToLine className="h-5 w-5 md:h-4 md:w-4 lg:h-6 lg:w-6  text-muted-foreground" />;
    case 'Total Put Qty':
      return <ArrowDownToLine className="h-5 w-5 md:h-4 md:w-4 lg:h-6 lg:w-6  text-muted-foreground" />;
    case 'Total Pallet Made':
      return <Package className="h-5 w-5 md:h-4 md:w-4 lg:h-6 lg:w-6  text-muted-foreground" />;
    case 'Total Pending Orders':
      return <NotebookTabs className="h-5 w-5 md:h-4 md:w-4 lg:h-6 lg:w-6  text-muted-foreground" />;
    default:
      return <DollarSign className="h-5 w-5 md:h-4 md:w-4 lg:h-6 lg:w-6  text-muted-foreground" />;
  }
};

  const handleSearch = () => {
    setFromDate(selectedFromDate);
    setToDate(selectedToDate);
  };

  const handleClear = () => {
    const today = new Date();
    setSelectedFromDate(today);
    setSelectedToDate(today);
    setFromDate(today);
    setToDate(today);
  };

  const handleRadioChange = (value: string) => {
    const selectedCard = cardData.find(card => card.value === value);
    if (selectedCard) {
      router.push(selectedCard.path);
    }
  };

  interface DatePickerProps {
    date: Date;
    onChange: (date: Date) => void;
    label: string;
  }

  const DatePicker: React.FC<DatePickerProps> = ({ date, onChange, label }) => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start text-left font-normal">
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>{label}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(date) => date && onChange(date)}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
console.log(dashboardData)
  return (
    <>  
      <Card className="mt-5 p-5 bg-cyan-500/5">
        <CardHeader className="p-0 mb-5 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <CardTitle className="text-2xl font-bold mb-4 sm:mb-0">Dashboard</CardTitle>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
              <DatePicker date={selectedFromDate} onChange={setSelectedFromDate} label="From Date" />
              <DatePicker date={selectedToDate} onChange={setSelectedToDate} label="To Date" />
              <Button onClick={handleSearch} className="w-full sm:w-auto">Search</Button>
              <Button variant="outline" onClick={handleClear} className="w-full sm:w-auto">Clear</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array.isArray(dashboardData) && dashboardData.map((item, index) => (

              <Card key={index} className="flex flex-col shadow-lg rounded-xl p-4">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{item.Parameter}</CardTitle>
                  {getIconForParameter(item.Parameter)}
                </CardHeader>
                <CardContent>
                  <div className="text-xl md:text-2xl lg:text-3xl font-bold">{item.Count}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-5">
            <PieChartComponent />
            <RadialChartStacked />
          </div>
          <div className="mt-5">
            <GRNChart fromDate={format(fromDate, "yyyy-MM-dd")} toDate={format(toDate, "yyyy-MM-dd")} />
          </div>
        </CardContent>
      </Card>

      <h1 className='text-center mt-5 mb-5 bg-clip-text text-transparent text-xl md:text-2xl font-bold 
               bg-gradient-to-r from-lime-500 to-indigo-600 
               dark:bg-gradient-to-r dark:from-lime-200 dark:to-indigo-400'>
        Put Vs Pick Activity
      </h1>
      <div className='mt-5 grid grid-cols-1 md:grid-cols-2 gap-5'>
        <AreaChartGradient />
        <BarChartStacked />
      </div>

      <div className='mt-5'>
        <div className='flex justify-between items-center mb-5'>
          <h1 className='bg-clip-text text-transparent text-xl md:text-2xl font-bold 
                bg-gradient-to-r from-purple-500 to-orange-600 
                dark:bg-gradient-to-r dark:from-purple-200 dark:to-orange-400'>
            Location wise Available Quantity
          </h1>
          <Button
            onClick={() => window.open('/location-wise-aval-3D', '_blank')}
            className='flex items-center space-x-2 border border-x-red-500 border-y-blue-600 button-transition'
            variant={'outline'}
          >
            View Location in 3D
            <Box className='ml-2' />
          </Button>
        </div>
        <LocationHeatmaps />
      </div>
    </>
  );
}

export default Dashboard;