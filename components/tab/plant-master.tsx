"use client";
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';
import Cookies from 'js-cookie';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import CustomDropdown from '../CustomDropdown';
import { BACKEND_URL } from '@/lib/constants';
import { useToast } from "@/components/ui/use-toast";
import { toast as sooner } from "sonner";
// import insertAuditTrail from '@/utills/insertAudit';
import { logError } from '@/utills/loggingException';
import { delay } from '@/utills/delay';
import TableSearch from '@/utills/tableSearch';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface CompanyOption {
  value: string;
  label: string;
}

interface PlantDetail {
  PlantID: number;
  PlantCode: string;
  PlantName: string;
  Address: string;
  City: string;
  State: string;
  CompanyCode: string;
  CreatedBy: string;
  CreatedOn: string;
  UpdatedBy: string;
  UpdatedOn: string;
  Status: string;
}

// Function to get User_ID from the JWT token
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

const PlantMasterForm = () => {
  const [plantCode, setPlantCode] = useState('');
  const [plantName, setPlantName] = useState('');
  const [plantAddress, setPlantAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [status, setStatus] = useState('active');
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [data, setData] = useState<PlantDetail[]>([]);
  const [companyNameOptions, setCompanyNameOptions] = useState<CompanyOption[]>([]);
  const [companyName, setCompanyName] = useState('');
  const [selectedPlantId, setSelectedPlantId] = useState<number | null>(null);
  const [oldData, setOldData] = useState<PlantDetail | null>(null);
  const { toast } = useToast();
// for search and pagination
const token = Cookies.get('token');
const [itemsPerPage, setItemsPerPage] = useState(10);
const [currentPage, setCurrentPage] = useState(1);
const [searchTerm, setSearchTerm] = useState('');
const plantCodeRef = useRef<HTMLInputElement>(null);
const plantNameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchDataSequentially = async () => {
      await delay(20);
      fetchCompanyNames();
      await delay(50);
      fetchPlantDetails();
      await delay(50);
      // await insertAuditTrail({
      //   AppType: "Web",
      //   Activity: "Plant Master",
      //   Action: `Plant Master Opened by ${getUserID()}`,
      //   NewData: "",
      //   OldData: "",
      //   Remarks: "",
      //   UserId: getUserID(),
      //   PlantCode: ""
      // });
    };
    fetchDataSequentially();
  }, []);


  const fetchCompanyNames = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/master/company-name`, {
        headers: {
          authorization: `Bearer ${token}`
        }
      });
      const options: CompanyOption[] = response.data.map((company: { CompanyName: string }) => ({
        value: company.CompanyName,
        label: company.CompanyName
      }));
      setCompanyNameOptions(options);
    } catch (error) {
      console.error('Error fetching company names:', error);
    }
  };

  const fetchPlantDetails = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/master/pm-all-details`, {
        headers: {
          authorization: `Bearer ${token}`
        }
      });
      setData(response.data);
    } catch (error: any) {
      console.error('Error fetching plant details:', error);
    }
  };

  // Logic for pagination
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const searchableFields: (keyof PlantDetail)[] = ['PlantID', 'Address', 'City', 'CompanyCode','PlantName','PlantCode' ,'Status','UpdatedBy','CreatedBy'];
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
    setSearchTerm(term.trim());
    setCurrentPage(1); // Reset to first page when searching
  }, []);
  

    const handlePageChange = useCallback((newPage: number) => {
      setCurrentPage(newPage);
    }, []);

    const handleItemsPerPageChange = useCallback((value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
     }, []);

  const handleValueChange = (newValue: string) => {
    setCompanyName(newValue);
  };

  const handleCancel = () => {
    setCompanyName('');
    setPlantCode('');
    setPlantName('');
    setPlantAddress('');
    setCity('');
    setState('');
    setStatus('active');
    setIsUpdateMode(false);
    setSelectedPlantId(null);
    setOldData(null);
  };

  const handleRowSelect = (row: PlantDetail) => {
    setOldData(row);
    setCompanyName(row.CompanyCode);
    setPlantCode(row.PlantCode);
    setPlantName(row.PlantName);
    setPlantAddress(row.Address);
    setCity(row.City);
    setState(row.State);
    setStatus(row.Status);
    setIsUpdateMode(true);
    setSelectedPlantId(row.PlantID);

    // // Insert audit trail for edit action
    // insertAuditTrail({
    //   AppType: "Web",
    //   Activity: "Plant Master",
    //   Action: `Plant Edit Initiated by ${getUserID()}`,
    //   NewData: "",
    //   OldData: JSON.stringify(row),
    //   Remarks: "",
    //   UserId: getUserID(),
    //   PlantCode: row.PlantCode
    // });
  };

  const handleSave = async () => {
    if ( !companyName) {
      sooner("Please select the company name");
      return;
    }
    if (!plantCode.trim()) {
      sooner("Please fill the plant code");
      plantCodeRef.current?.focus()
      return;
    }
    if (!plantName.trim()) {
      sooner("Please fill the plant name");
      plantNameRef.current?.focus()
      return;
    }
    try {
      const newPlantData = {
        CompanyName: companyName.trim(),
        PlantCode: plantCode.trim(),
        PlantName: plantName.trim(),
        Address: plantAddress.trim(),
        City: city.trim(),
        State: state.trim(),
        PStatus: status.trim(),
        Createdby: getUserID(),
      };
  
      const response = await axios.post(`${BACKEND_URL}/api/master/pm-insert-details`, newPlantData, {
        headers: {
          authorization: `Bearer ${token}`
        }
      });
      const responseData = response.data; 
  
      if (responseData.status === "T") {
        toast({
          title: "Success",
          description: "Plant details saved successfully",
        });
        fetchPlantDetails(); 
        handleCancel(); 
  
        // // Insert audit trail for save action
        // insertAuditTrail({
        //   AppType: "Web",
        //   Activity: "Plant Master",
        //   Action: `New Plant Added by ${getUserID()}`,
        //   NewData: JSON.stringify(newPlantData),
        //   OldData: "",
        //   Remarks: "",
        //   UserId: getUserID(),
        //   PlantCode: plantCode
        // });
      } else if (responseData.status === "F") {
        toast({
          variant: 'destructive',
          title: "Error",
          description: responseData.message,
        });
        logError((responseData.message).toLocaleString(),'', 'Plant Master', getUserID());
      }
    } catch (error:any) {
      console.error('Error saving plant details:', error);
      const errorMessage = error.response?.data?.error || error.message;
      logError(errorMessage,error, 'Plant Master Catch error', getUserID());
      toast({
        title: "Error",
        description: `${errorMessage}`,
        variant: "destructive",
      });
    }
  };
  

  const handleUpdate = async () => {
    if ( !companyName) {
      sooner("Please select the company name");
      return;
    }
    if (!plantCode.trim()) {
      sooner("Please fill the plant code");
      plantCodeRef.current?.focus()
      return;
    }
    if (!plantName.trim()) {
      sooner("Please fill the plant name");
      plantNameRef.current?.focus()
      return;
    }
    if (!selectedPlantId || !oldData) return;
    try {
      const updatedPlantData = {
        PlantID: selectedPlantId,
        PlantCode: plantCode.trim(),
        PlantName: plantName.trim(),
        Address: plantAddress.trim(),
        City: city.trim(),
        State: state.trim(),
        Status: status.trim(),
        Updatedby: getUserID()
      };

      const response = await axios.patch(`${BACKEND_URL}/api/master/pm-update-details`, updatedPlantData, {
        headers: {
          authorization: `Bearer ${token}`
        }
      });
      toast({
        title: "Success",
        description: "Plant details updated successfully",
      });
      fetchPlantDetails(); // Refresh the table
      handleCancel(); // Reset the form

      // Prepare audit data
      const changedFields: string[] = [];
      if (oldData.PlantName !== plantName) changedFields.push(`Plant Name: ${oldData.PlantName} -> ${plantName}`);
      if (oldData.Address !== plantAddress) changedFields.push(`Address: ${oldData.Address} -> ${plantAddress}`);
      if (oldData.City !== city) changedFields.push(`City: ${oldData.City} -> ${city}`);
      if (oldData.State !== state) changedFields.push(`State: ${oldData.State} -> ${state}`);
      if (oldData.Status !== status) changedFields.push(`Status: ${oldData.Status} -> ${status}`);

      // Insert audit trail for update action
      // insertAuditTrail({
      //   AppType: "Web",
      //   Activity: "Plant Master",
      //   Action: `Plant Updated by ${getUserID()}`,
      //   NewData: changedFields.join(", "),
      //   OldData: JSON.stringify(oldData),
      //   Remarks: "",
      //   UserId: getUserID(),
      //   PlantCode: plantCode
      // });
    } catch (error:any) {
      const errorMessage = error.response?.data?.error || error.message;
      logError((errorMessage).toLocaleString(),error, 'Plant Master Catch error while updating', getUserID());
      toast({
        title: "Error",
        description: "Failed to update plant details",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Card className="w-full mx-auto mt-5">
        <CardHeader>
          <CardTitle>Plant Master <span className='font-normal text-sm text-muted-foreground'>(* Fields Are Mandatory)</span></CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company *</Label>
                <CustomDropdown
                  options={companyNameOptions}
                  value={companyName}
                  onValueChange={handleValueChange}
                  placeholder="Select company..."
                  searchPlaceholder="Search company..."
                  emptyText="No company found."
                  disabled={isUpdateMode}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plantCode">Plant Code *</Label>
                <Input id="plantCode" ref={plantCodeRef} value={plantCode} onChange={(e) => setPlantCode(e.target.value)} required disabled={isUpdateMode} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plantName">Plant Name *</Label>
                <Input id="plantName" ref={plantNameRef} value={plantName} onChange={(e) => setPlantName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plantAddress">Plant Address </Label>
                <Input id="plantAddress" value={plantAddress} onChange={(e) => setPlantAddress(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City </Label>
                <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State </Label>
                <Input id="state" value={state} onChange={(e) => setState(e.target.value)} />
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
              <Button onClick={handleSave} disabled={isUpdateMode}>Save</Button>
              <Button variant="outline" onClick={handleUpdate} disabled={!isUpdateMode}>Update</Button>
              <Button variant="outline" onClick={handleCancel}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
      <Card className="w-full mx-auto mt-10">
        <CardContent>
          <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-2">
                <span>Show</span>
                <Select
                  defaultValue="10"
                  value={itemsPerPage.toString()}
                  onValueChange={handleItemsPerPageChange}
                >
                  <SelectTrigger className="w-[70px]">
                    <SelectValue placeholder={itemsPerPage.toString()} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                  </SelectContent>
                </Select>
                <span>entries</span>
              </div>
              <div className="flex items-center space-x-2">
              <TableSearch onSearch={handleSearch} />
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Select</TableHead>
                  <TableHead>Company Name</TableHead>
                  <TableHead>Plant Code</TableHead>
                  <TableHead>Plant Name</TableHead>
                  <TableHead>Plant Address</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>State</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created by</TableHead>
                  <TableHead>Created On</TableHead>
                  <TableHead>Updated by</TableHead>
                  <TableHead>Updated On</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.isArray(paginatedData) && paginatedData.length > 0 ? (
                  paginatedData.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Button variant="ghost" onClick={() => handleRowSelect(row)}>Select</Button>
                      </TableCell>
                      <TableCell>{row.CompanyCode}</TableCell>
                      <TableCell>{row.PlantCode}</TableCell>
                      <TableCell>{row.PlantName}</TableCell>
                      <TableCell>{row.Address}</TableCell>
                      <TableCell>{row.City}</TableCell>
                      <TableCell>{row.State}</TableCell>
                      <TableCell>{row.Status}</TableCell>
                      <TableCell>{row.CreatedBy}</TableCell>
                      <TableCell>{new Date(row.CreatedOn).toLocaleDateString()}</TableCell>
                      <TableCell>{row.UpdatedBy}</TableCell>
                      <TableCell>{row.UpdatedOn ? new Date(row.UpdatedOn).toLocaleDateString() : ''}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={12} className="text-center">
                      No data available
                    </TableCell>
                  </TableRow>
                )}
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

export default PlantMasterForm;
