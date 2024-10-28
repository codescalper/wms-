"use client"
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Oval } from 'react-loader-spinner';
import { BACKEND_URL } from '@/lib/constants';
import { useToast } from "@/components/ui/use-toast";
import { toast as sooner } from "sonner";
import insertAuditTrail from '@/utills/insertAudit';
import Cookies from 'js-cookie';
import { getUserID } from '@/utills/getFromSession';
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

interface CompanyData {
  CID: number;
  CompanyCode: string;
  CompanyName: string;
  Address: string;
  City: string;
  State: string;
  Status: string | null;
  CreatedBy: string;
  CreatedOn: string;
  UpdatedBy: string | null;
  UpdatedOn: string | null;
}



const CompanyMasterForm: React.FC = () => {
  const [companyCode, setCompanyCode] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [status, setStatus] = useState('active');
  const [data, setData] = useState<CompanyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCID, setSelectedCID] = useState<number | null>(null);
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [oldData, setOldData] = useState<CompanyData | null>(null);
  const { toast } = useToast();
// for search and pagination
const [itemsPerPage, setItemsPerPage] = useState(10);
const [currentPage, setCurrentPage] = useState(1);
const [searchTerm, setSearchTerm] = useState('');

 
  const companyCodeRef = useRef<HTMLInputElement>(null);
  const companyNameRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const fetchDataSequentially = async () => {
      await delay(100);
      fetchData();
      await delay(100);
      await  insertAuditTrail({
        AppType: "Web",
        Activity: "Company Master",
        Action: `Company Master Opened by ${getUserID()}`,
        NewData: "",
        OldData: "",
        Remarks: "",
        UserId: getUserID(),
        PlantCode: ""
      });
    };
    fetchDataSequentially();
  }, []);

  const fetchData = () => {
    setLoading(true);
    axios.get(`${BACKEND_URL}/api/master/all-company-details`)
      .then((response: any) => {
        setData(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        setLoading(false);
        toast({
          variant: 'destructive',
          title: "Failed to fetch details",
          description: `Try again`,
        });
      });
  };


  const filteredData = useMemo(() => {
    return data.filter(item => {
      const searchableFields: (keyof CompanyData)[] = ['CID', 'Address', 'City', 'State', 'CompanyCode','CompanyName' ,'Status','UpdatedBy','CreatedBy'];
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

  const handleSave = () => {
    if (!companyCode.trim()) {
      sooner(`Please fill Company Code`);
      companyCodeRef.current?.focus();
      return;
    }
    if(!companyName.trim()){
      sooner(`Please fill Company Name`);
      companyNameRef.current?.focus();
      return;
    }
    const newCompanyData = {
      cCode: companyCode.trim(),
      cName: companyName.trim(),
      address: companyAddress.trim(),
      city:city.trim(),
      state:state.trim(),
      status:status.trim(),
      createdBy: getUserID().trim(), 
    };

    axios.post(`${BACKEND_URL}/api/master/insert-details`, newCompanyData)
    .then((response) => {
      const responseData = response.data[0];
      if (responseData.Status === "F") {
        toast({
          variant: 'destructive',
          title: "Error",
          description: responseData.Message,          
        });
        logError((responseData.Message).toLocaleString(),"", 'Company Master', getUserID());
      } else if (responseData.Status === "T") {
        toast({
          title: "Details inserted successfully",
          description: `Details updated for ${companyCode}`,
        });
        fetchData();
        handleCancel();
        // Insert audit trail for save action
        insertAuditTrail({
          AppType: "Web",
          Activity: "Company Master",
          Action: `New Company Added by ${getUserID()}`,
          NewData: JSON.stringify(newCompanyData),
          OldData: "",
          Remarks: "",
          UserId: getUserID(),
          PlantCode: ""
        });
      }
    })
    .catch((error) => {
      const errorMessage = error.response?.data?.error || error.message;
      logError(errorMessage,error, 'Company Master', getUserID());
      toast({
        variant: 'destructive',
        title: "Error",
        description: errorMessage,
      });
    });
  };
  

  const handleRowSelect = (index: number) => {
    const selectedData = data[index];
    setOldData(selectedData);
    setCompanyCode(selectedData.CompanyCode);
    setCompanyName(selectedData.CompanyName);
    setCompanyAddress(selectedData.Address);
    setCity(selectedData.City);
    setState(selectedData.State);
    setStatus(selectedData.Status || 'inactive');
    setSelectedCID(selectedData.CID);
    setIsUpdateMode(true);
    // Insert audit trail for edit action
    insertAuditTrail({
      AppType: "Web",
      Activity: "Company Master",
      Action: `Company Edit Initiated by ${getUserID()}`,
      NewData: "",
      OldData: JSON.stringify(selectedData),
      Remarks: "",
      UserId: getUserID(),
      PlantCode: ""
    });
  };

  const handleCancel = () => {
    setCompanyCode('');
    setCompanyName('');
    setCompanyAddress('');
    setCity('');
    setState('');
    setStatus('active');
    setSelectedCID(null);
    setIsUpdateMode(false);
    setOldData(null);
  };

  const handleUpdate = () => {
    if (!selectedCID || !oldData) return;
    if (!companyCode.trim()) {
      sooner(`Please fill Company Code`);
      companyCodeRef.current?.focus();
      return;
    }
    if(!companyName.trim()){
      sooner(`Please fill Company Name`);
      companyNameRef.current?.focus();
      return;
    }
    const updatedData = {
      cID: selectedCID,
      companyName:companyName.trim(),
      address: companyAddress.trim(),
      city:city.trim(),
      state:state.trim(),
      status:status.trim(),
      updatedBy: getUserID().trim()
    };

    axios.patch(`${BACKEND_URL}/api/master/update-details`, updatedData)
      .then(() => {
        fetchData();
        handleCancel();
        toast({
          title: "Details updated successfully",
          description: `Details updated for ${companyCode}`,
        });
        // Prepare audit data
        const changedFields: string[] = [];
        if (oldData.CompanyName !== companyName) changedFields.push(`Company Name: ${oldData.CompanyName} -> ${companyName}`);
        if (oldData.Address !== companyAddress) changedFields.push(`Address: ${oldData.Address} -> ${companyAddress}`);
        if (oldData.City !== city) changedFields.push(`City: ${oldData.City} -> ${city}`);
        if (oldData.State !== state) changedFields.push(`State: ${oldData.State} -> ${state}`);
        if (oldData.Status !== status) changedFields.push(`Status: ${oldData.Status} -> ${status}`);
        
        // Insert audit trail for update action
        insertAuditTrail({
          AppType: "Web",
          Activity: "Company Master",
          Action: `Company Updated by ${getUserID()}`,
          NewData: changedFields.join(", "),
          OldData: JSON.stringify(oldData),
          Remarks: "",
          UserId: getUserID(),
          PlantCode: ""
        });
      })
      .catch((error) => {
        console.error('Error updating company:', error);
        toast({
          variant: 'destructive',
          title: "Failed to update details",
          description: `Try again`,
        });
      });
  };


  return (
    <>
      <Card className="w-full mx-auto mt-5">
        <CardHeader>
          <CardTitle>Company Master <span className='font-normal text-sm text-muted-foreground'>(* Fields Are Mandatory)</span></CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyCode">Company Code *</Label>
                <Input ref={companyCodeRef} id="companyCode" value={companyCode} onChange={(e) => setCompanyCode(e.target.value)} required disabled={isUpdateMode} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name *</Label>
                <Input ref={companyNameRef} id="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyAddress">Company Address </Label>
                <Input id="companyAddress" value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)}  />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City </Label>
                <Input id="city" value={city} onChange={(e) => setCity(e.target.value)}  />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State </Label>
                <Input id="state" value={state} onChange={(e) => setState(e.target.value)}  />
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
              <Button onClick={handleSave} disabled={isUpdateMode} type="submit">Save</Button>
              <Button onClick={handleUpdate} disabled={!isUpdateMode}>Update</Button>
              <Button onClick={handleCancel} variant="outline">Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
      <Card className="w-full mt-5 mx-auto">
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
                  <TableHead>Action</TableHead> {/* Empty header for the Select column */}
                  <TableHead>Company Code</TableHead>
                  <TableHead>Company Name</TableHead>
                  <TableHead>Address</TableHead>
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
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center">
                      <div className="flex justify-center items-center h-64">
                        <Oval
                          height={40}
                          width={40}
                          color="#4fa94d"
                          visible={true}
                          ariaLabel='oval-loading'
                          secondaryColor="#4fa94d"
                          strokeWidth={2}
                          strokeWidthSecondary={2}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((row, index) => (
                    <TableRow key={row.CID}>
                      <TableCell>
                        <Button variant={'ghost'} onClick={() => handleRowSelect(index)}>Edit</Button>
                      </TableCell>
                      <TableCell>{row.CompanyCode}</TableCell>
                      <TableCell>{row.CompanyName}</TableCell>
                      <TableCell>{row.Address ? row.Address : ""}</TableCell>
                      <TableCell>{row.City ? row.City : ""}</TableCell>
                      <TableCell>{row.State ? row.State : ""}</TableCell>
                      <TableCell>{row.Status ? row.Status : ''}</TableCell>
                      <TableCell>{row.CreatedBy}</TableCell>
                      <TableCell>{new Date(row.CreatedOn).toLocaleDateString()}</TableCell>
                      <TableCell>{row.UpdatedBy ?row.UpdatedBy : '' }</TableCell>
                      <TableCell>{row.UpdatedOn ? new Date(row.UpdatedOn).toLocaleDateString() : ''}</TableCell>
                    </TableRow>
                  ))
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

export default CompanyMasterForm;
