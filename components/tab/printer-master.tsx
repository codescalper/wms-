"use client";
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';
import Cookies from 'js-cookie';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { toast as sooner } from "sonner";
import { BACKEND_URL } from '@/lib/constants';
import insertAuditTrail from '@/utills/insertAudit';
import { getUserPlant } from '@/utills/getFromSession';
import { delay } from '@/utills/delay';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import CustomDropdown from '../CustomDropdown';

interface PalletData {
    id: number;
    PalletBarcode: string;
    Qty: number;
    Height: number;
    Width: number;
    Status: string;
    CreatedOn: string;
    CreatedBy: string;
    UpdatedBy: string;
    UpdatedOn: string;
}
  
interface PlantCode {
  PlantCode: string;
}
  

const getUserID = () => {
  const token = Cookies.get('token');
  if (token) {
    try {
      const decodedToken: any = jwtDecode(token);
      return decodedToken.user.User_ID;
    } catch (e) {
      console.error("Failed to decode token:", e);
    }
  }
  return 'Guest';
};
interface DropdownOption {
  value: string;
  label: string;
}
const PalletMaster: React.FC = () => {
    const [printerMakeModel, setPrinterMakeModel] = useState<string>('');
    const [printerName, setPrinterName] = useState<string>('');
    const [printerSrNo, setPrinterSrNo] = useState<string>('');
    const [printerIPPort, setPrinterIPPort] = useState<string>('');
    const [plantCode , setPlantCode] = useState<string>('');
    const [plantCodes, setPlantCodes] = useState<DropdownOption[]>([]);

    const [dpi, setDpi] = useState<string>('');
    const [assetCode, setAssetCode] = useState<string>('');
    const [defaultPrinter, setDefaultPrinter] = useState<string>('');
    const [status, setStatus] = useState<string>('');
    const [data, setData] = useState<PalletData[]>([]);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
    const { toast } = useToast();
    const printerMakeModelRef = useRef<HTMLInputElement>(null);
    const printerNameRef = useRef<HTMLInputElement>(null);
    const printerSrNoRef = useRef<HTMLInputElement>(null);
    const printerIPPortRef = useRef<HTMLInputElement>(null);
    const dpiRef = useRef<HTMLInputElement>(null);
    const assetCodeRef = useRef<HTMLInputElement>(null);
    const defaultPrinterRef = useRef<HTMLInputElement>(null);
    const token = Cookies.get('token');
  // for search and pagination
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    useEffect(() => {

      const executeSequentially = async () => {
        await delay(20);
        await fetchData();
        await delay(50);
        await fetchPlantCodes()
        await delay(50);
        // await insertAuditTrail({
        //   AppType: "Web",
        //   Activity: "UOM Master",
        //   Action: `UOM Master Opened by ${getUserID()}`,
        //   NewData: "",
        //   OldData: "",
        //   Remarks: "",
        //   UserId: getUserID(),
        //   PlantCode: getUserPlant()
        // });
      };
      executeSequentially();
     
    }, []);

    
  const fetchPlantCodes = async () => {

    try {
      const response = await fetch(`${BACKEND_URL}/api/master/get-all-plant-code`, {
        headers: {
          'authorization': `Bearer ${token}`
        }
      });
      const data: PlantCode[] = await response.json();
      setPlantCodes(data.map(item => ({ value: item.PlantCode, label: item.PlantCode })));
    } catch (error) {
      console.error('Error fetching plant codes:', error);
      toast({ title: "Error", description: "Failed to fetch plant codes", variant: "destructive" });
    }
  };
  
    const fetchData = async () => {
      try {
        const response = await axios.get<PalletData[]>(`${BACKEND_URL}/api/master/pallet-all-details`, {
          headers: { authorization: `Bearer ${token}` }
        });
        setData(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "Failed to fetch data",
          variant: "destructive",
        });
      }
    };

    const handlePageChange = useCallback((newPage: number) => {
      setCurrentPage(newPage);
    }, []);
    const handleRowSelect = (row: PalletData) => {
    setPrinterMakeModel(row.PalletBarcode);
    setPrinterName(row.Qty.toString());
    setPrinterSrNo(row.Height.toString());
    setPrinterIPPort(row.Width.toString());
    setDpi(row.Status);
    setAssetCode(row.CreatedBy);
    setDefaultPrinter(row.UpdatedBy);
    setStatus(row.Status);
    setIsEditing(true);
      // insertAuditTrail({
      //   AppType: "Web",
      //   Activity: "Pallet Master",
      //   Action: `Pallet Edit Initiated by ${getUserID()}`,
      //   NewData: "",
      //   OldData: JSON.stringify(row),
      //   Remarks: "",
      //   UserId: getUserID(),
      //   PlantCode: getUserPlant()
      // });
    };
  
    const handleCancel = () => {
      setPrinterMakeModel('');
      setPrinterName('');
      setPrinterSrNo('');
      setPrinterIPPort('');
      setDpi('');
      setAssetCode('');
      setDefaultPrinter('');
      setStatus('');
      setIsEditing(false);
      setSelectedUnit(null);
    };
  
    const handleSave = async () => {
    if (!printerMakeModel) {
      sooner("Please fill the printer make-model");
      printerMakeModelRef.current?.focus();
      return;
    }
    if (!printerName) {
      sooner("Please fill the printer name");
      printerNameRef.current?.focus();
      return;
    }
    if (!printerSrNo) {
      sooner("Please fill the printer serial number");
      printerSrNoRef.current?.focus();
      return;
    }
    if (!printerIPPort) {
      sooner("Please fill the printer IP:Port");
      printerIPPortRef.current?.focus();
      return;
    }
    if (!dpi) {
      sooner("Please fill the DPI");
      dpiRef.current?.focus();
      return;
    }
    if (!assetCode) {
      sooner("Please fill the asset code");
      assetCodeRef.current?.focus();
      return;
    }
    if (!defaultPrinter) {
      sooner("Please fill the default printer");
      defaultPrinterRef.current?.focus();
      return;
    }
    if (!status) {
      sooner("Please select the status");
      return;
    }
      try {
        const newUnitData = {
          PalletBarcode: palletBarcode,
          Qty: quantity,
          Height: height,
          Width: width,
          CreatedBy: getUserID(),
        };

        const response = await axios.post(`${BACKEND_URL}/api/master/insert-pallet-master`, newUnitData, {
          headers: { 
            'Content-Type': 'application/json',
            authorization: `Bearer ${token}`
          },
        });
  
        const { Status, Message } = response.data[0];
  
        if (Status === 'T') {
          toast({
            title: 'Success',
            description: Message,
          });
          fetchData();
          handleCancel();
          // insertAuditTrail({
          //   AppType: 'Web',
          //   Activity: 'UOM Master',
          //   Action: `New UOM Added by ${getUserID()}`,
          //   NewData: JSON.stringify(newUnitData),
          //   OldData: '',
          //   Remarks: '',
          //   UserId: getUserID(),
          //   PlantCode: getUserPlant(),
          // });
        } else if (Status === 'F') {
          toast({
            title: 'Error',
            description: Message,
            variant: 'destructive'
          });
        } else {
          toast({
            title: 'Error',
            description: 'Unexpected Error',
            variant: 'destructive'
          });
        }
      } catch (error: any) {
        console.error(error);
        const errorMessage = error.response?.data?.error || error.message;
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive'
        });
      }
    };
  
    const handleUpdate = async () => {
      if (!selectedUnit) return;
    if (!printerMakeModel) {
      sooner("Please fill the printer make-model");
      printerMakeModelRef.current?.focus();
      return;
    }
    if (!printerName) {
      sooner("Please fill the printer name");
      printerNameRef.current?.focus();
      return;
    }
    if (!printerSrNo) {
      sooner("Please fill the printer serial number");
      printerSrNoRef.current?.focus();
      return;
    }
    if (!printerIPPort) {
      sooner("Please fill the printer IP:Port");
      printerIPPortRef.current?.focus();
      return;
    }
    if (!dpi) {
      sooner("Please fill the DPI");
      dpiRef.current?.focus();
      return;
    }
    if (!assetCode) {
      sooner("Please fill the asset code");
      assetCodeRef.current?.focus();
      return;
    }
    if (!defaultPrinter) {
      sooner("Please fill the default printer");
      defaultPrinterRef.current?.focus();
      return;
    }
    if (!status) {
      sooner("Please select the status");
      return;
    }
      try {
        const updatedUnit = {
          PalletBarcode: palletBarcode,
          Qty: quantity,
          UpdatedBy: getUserID(),
        };
  
        const response = await axios.post(`${BACKEND_URL}/api/master/update-pallet-master`, updatedUnit, {
          headers: { 
            'Content-Type': 'application/json',
            authorization: `Bearer ${token}`
          },
        });
  
        const { Status, Message } = response.data[0];
  
        if (Status === 'T') {
          toast({
            title: "Success",
            description: Message
          });
          fetchData();
          handleCancel();
  
          // insertAuditTrail({
          //   AppType: "Web",
          //   Activity: "UOM Master",
          //   Action: `UOM Updated by ${getUserID()}`,
          //   NewData: JSON.stringify(updatedUnit),
          //   OldData: JSON.stringify({ Unit: selectedUnit, Description: unitDesc }),
          //   Remarks: "",
          //   UserId: getUserID(),
          //   PlantCode: getUserPlant()
          // });
        } else if (Status === 'F') {
          toast({
            title: "Error",
            description: Message,
            variant: "destructive"
          });
        } else {
          toast({
            title: "Error",
            description: "Unexpected Error",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Error updating data:', error);
        toast({
          title: "Error",
          description: "Failed to update Pallet Barcode",
          variant: "destructive"
        });
      }
    };
  
    const filteredData = useMemo(() => {
      return data.filter(item => {
        const searchableFields: (keyof PalletData)[] = ['PalletBarcode', 'Qty', 'Height', 'Width', 'Status', 'CreatedBy', 'UpdatedBy'];
        return searchableFields.some(key => {
          const value = item[key];
          return value != null && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
        });
      });
    }, [data, searchTerm]);
  
    const paginatedData = useMemo(() => {
      const startIndex = (currentPage - 1) * itemsPerPage;
      return filteredData.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredData, currentPage, itemsPerPage]);
  
    const totalPages = useMemo(() => Math.ceil(filteredData.length / itemsPerPage), [filteredData, itemsPerPage]);
  
    const handleSearch = useCallback((term: string) => {
      setSearchTerm(term);
      setCurrentPage(1); // Reset to first page when searching
    }, []);
      
  

  return (
    <>
      <Card className="w-full mx-auto mt-5">
        <CardHeader>
          <CardTitle>Printer Master <span className='font-normal text-sm text-muted-foreground'>(* Fields Are Mandatory)</span></CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
                <Label htmlFor="plantCode">Plant Code *</Label>
                <CustomDropdown
                  options={plantCodes}
                  value={plantCode}
                  onValueChange={setPlantCode}
                  placeholder="Select plant code..."
                  searchPlaceholder="Search plant code..."
                  emptyText="No plant code found."
                  disabled={isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="printerMakeModel">Printer Make-Model *</Label>
                <Input 
                  id="printerMakeModel" 
                  value={printerMakeModel} 
                  onChange={(e) => setPrinterMakeModel(e.target.value)} 
                  required 
                  disabled={isEditing}
                  ref={printerMakeModelRef}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="printerName">Printer Name *</Label>
                <Input 
                  id="printerName" 
                  value={printerName} 
                  onChange={(e) => setPrinterName(e.target.value)} 
                  required 
                  ref={printerNameRef}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="printerSrNo">Printer SrNo *</Label>
                <Input 
                  id="printerSrNo" 
                  value={printerSrNo} 
                  onChange={(e) => setPrinterSrNo(e.target.value)} 
                  required 
                  disabled={isEditing}
                    ref={printerSrNoRef}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="printerIPPort">Printer IP:Port *</Label>
                <Input 
                  id="printerIPPort" 
                  value={printerIPPort} 
                  onChange={(e) => setPrinterIPPort(e.target.value)} 
                  required 
                    ref={printerIPPortRef}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dpi">Dpi *</Label>
                <Input 
                  id="dpi" 
                  value={dpi} 
                  onChange={(e) => setDpi(e.target.value)} 
                  required 
                    ref={dpiRef}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="assetCode">Asset Code *</Label>
                <Input 
                  id="assetCode" 
                  value={assetCode} 
                  onChange={(e) => setAssetCode(e.target.value)} 
                  required 
                    ref={assetCodeRef}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Default Printer *</Label>
                <Select value={defaultPrinter} onValueChange={setDefaultPrinter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Yes or No " />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button onClick={handleSave} disabled={isEditing}>Save</Button>
              <Button onClick={handleUpdate} disabled={!isEditing}>Update</Button>
              <Button onClick={handleCancel} variant="outline">Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
      <Card className="w-full mx-auto mt-10">
        <CardContent>
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
             
              <div className="flex items-center space-x-2">
                <span>Search:</span>
                <Input 
                  className="max-w-sm" 
                  placeholder="Search..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm((e.target.value).trim())}
                />
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Select</TableHead>
                  <TableHead>Pallet Barcode</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Height</TableHead>
                  <TableHead>Width</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created by</TableHead>
                  <TableHead>Created on</TableHead>
                  <TableHead>Updated by</TableHead>
                  <TableHead>Updated on</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <Button variant={'ghost'} onClick={() => handleRowSelect(row)}>Select</Button>
                    </TableCell>
                    <TableCell>{row.PalletBarcode}</TableCell>
                    <TableCell>{row.Qty}</TableCell>
                    <TableCell>{row.Height}</TableCell>
                    <TableCell>{row.Width}</TableCell>
                    <TableCell>{row.Status}</TableCell>
                    <TableCell>{row.CreatedBy}</TableCell>
                    <TableCell>{new Date(row.CreatedOn).toLocaleDateString()}</TableCell>
                    <TableCell>{row.UpdatedBy}</TableCell>
                    <TableCell>{row.UpdatedOn ? new Date(row.UpdatedOn).toLocaleDateString() : ""}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

              {/* Pagination Component */}
              <div className="flex justify-between items-center text-sm md:text-md mt-4">
                <div>
                  {filteredData.length > 0 
                    ? `Showing ${((currentPage - 1) * itemsPerPage) + 1} to ${Math.min(currentPage * itemsPerPage, filteredData.length)} of ${filteredData.length} entries`
                    : 'No entries to show'}
                </div>
                {filteredData.length > 0 && (
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => handlePageChange(currentPage - 1)}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                      {[...Array(totalPages)].map((_, index) => {
                        const pageNumber = index + 1;
                        if (
                          pageNumber === 1 ||
                          pageNumber === totalPages ||
                          (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                        ) {
                          return (
                            <PaginationItem key={pageNumber}>
                              <PaginationLink
                                isActive={pageNumber === currentPage}
                                onClick={() => handlePageChange(pageNumber)}
                              >
                                {pageNumber}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        } else if (
                          pageNumber === currentPage - 2 ||
                          pageNumber === currentPage + 2
                        ) {
                          return <PaginationEllipsis key={pageNumber} />;
                        }
                        return null;
                      })}
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => handlePageChange(currentPage + 1)}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default PalletMaster;
