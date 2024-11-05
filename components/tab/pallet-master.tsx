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

const PalletMaster: React.FC = () => {
    const [palletBarcode, setPalletBarcode] = useState<string>('');
    const [quantity, setQuantity] = useState<number>();
    const [width, setWidth] = useState<number>();
    const [height, setHeight] = useState<number>();
    const [data, setData] = useState<PalletData[]>([]);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
    const { toast } = useToast();
    const unitRef = useRef<HTMLInputElement>(null);
    const descRef = useRef<HTMLInputElement>(null);
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
      setPalletBarcode(row.PalletBarcode);
      setQuantity(row.Qty);
      setWidth(row.Width);
      setHeight(row.Height);
      setSelectedUnit(row.Status);
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
      setPalletBarcode('');
      setQuantity(0);
      setWidth(0);
      setHeight(0);
      setIsEditing(false);
      setSelectedUnit(null);
    };
  
    const handleSave = async () => {
      if (!palletBarcode) {
        sooner("Please fill the palletbarcode");
        unitRef.current?.focus();
        return;
      }
    if (!quantity) {
      sooner("Please fill the quantity");
      unitRef.current?.focus();
      return;
    }
    if (!width) {
      sooner("Please fill the width");
      unitRef.current?.focus();
      return;
    }
    if (!height) {
      sooner("Please fill the height");
      unitRef.current?.focus();
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
    if (!palletBarcode) {
      sooner("Please fill the pallet barcode");
      unitRef.current?.focus();
      return;
    }
    if (!quantity) {
      sooner("Please fill the quantity");
      unitRef.current?.focus();
      return;
    }
    if (!width) {
      sooner("Please fill the width");
      unitRef.current?.focus();
      return;
    }
    if (!height) {
      sooner("Please fill the height");
      unitRef.current?.focus();
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
          <CardTitle>Pallet Master <span className='font-normal text-sm text-muted-foreground'>(* Fields Are Mandatory)</span></CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="palletBarcode">Pallet Barcode *</Label>
                <Input 
                  id="palletBarcode" 
                  value={palletBarcode} 
                  onChange={(e) => setPalletBarcode(e.target.value)} 
                  ref={unitRef}
                  required 
                  disabled={isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input 
                     type='number'
                  id="quantity" 
                  value={quantity} 
                  onChange={(e) => setQuantity(Number(e.target.value))} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="width">Width *</Label>
                <Input 
                    type='number'
                  id="width" 
                  value={width} 
                  onChange={(e) => setWidth(Number(e.target.value))} 
                  required 
                  disabled={isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Height *</Label>
                <Input 
                    type='number'
                  id="height" 
                  value={height} 
                  onChange={(e) => setHeight(Number(e.target.value))} 
                  required 
                  disabled={isEditing}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && isEditing && document.activeElement === e.target) {
                      handleUpdate();
                    }
                  }}
                />
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
