"use client";
import React, { useState, useEffect ,useMemo, useCallback} from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import CustomDropdown from '../CustomDropdown';
import { BACKEND_URL } from '@/lib/constants';
import generateUniqueCode from '@/lib/uniqueCode';
import { useToast } from "@/components/ui/use-toast";
import { toast as sooner } from "sonner";
import insertAuditTrail from '@/utills/insertAudit';
import { delay } from '@/utills/delay';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { MultiSelect } from '../multi-select';
import { getUserPlant } from '@/utills/getFromSession';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import TableSearch from '@/utills/tableSearch';
interface WarehouseCode {
  WarehouseCode: string;
}


interface DropdownOption {
  value: string;
  label: string;
}

interface WarehouseLocation {
  ID: number;
  CompanyCode: string;
  PlantCode: string;
  WarehouseCode: string;
  Location: string;
  Rack: string;
  Bin: string;
  UniqueCode: string;
  DisplayCode: string | null;
  Status: string;
  CreatedBy: string;
  CreatedOn: string;
  UpdatedBy: string | null;
  UpdatedOn: string | null;
  WH_Category_Code: string;
  Height: string;
  Width: string;
  UOM: string;
  Length: string;
  Capacity: string;
  RestrictToMaterial: string;
}

interface UnitCode {
  Unit: string;
}

interface MatCode {
  MatCode: string;
}
const WarehouseLocationMaster: React.FC = () => {
  const [warehouseValue, setWarehouseValue] = useState("");
  const [warehouseCodes, setWarehouseCodes] = useState<WarehouseCode[]>([]);
  const [locations, setLocations] = useState<WarehouseLocation[]>([]);
  const [location, setLocation] = useState("");
  const [rack, setRack] = useState("");
  const [bin, setBin] = useState("");
  const [uniqueCode, setUniqueCode] = useState("");
  const [status, setStatus] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<WarehouseLocation | null>(null);
  const [oldData, setOldData] = useState<WarehouseLocation | null>(null);
  const [units, setUnits] = useState<DropdownOption[]>([]);
  const [matCode, SetMatCode] = useState<DropdownOption[]>([]);
  const [restrictMatCode, setRestrictMatCode] = useState<string[]>([]);
  const { toast } = useToast();

 const [showAdditionalDetails, setShowAdditionalDetails] = useState(false);
 const [height, setHeight] = useState("");
 const [width, setWidth] = useState("");
 const [uom, setUom] = useState("");
 const [length, setLength] = useState("");
 const [capacity, setCapacity] = useState("");
 const [restrictToMaterial, setRestrictToMaterial] = useState("");
// for search and pagination
const [itemsPerPage, setItemsPerPage] = useState(10);
const [currentPage, setCurrentPage] = useState(1);
const [searchTerm, setSearchTerm] = useState('');
 
 const fetchUnitCode = async () => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/master/all-uom-unit`);
    const data: UnitCode[] = await response.json();
    setUnits(data.map(item => ({ value: item.Unit, label: item.Unit })));
  } catch (error) {
    console.error('Error fetching plant codes:', error);
    toast({ title: "Error", description: "Failed to fetch plant codes", variant: "destructive" });
  }
};

const fetchMatCode = async () => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/master/get-all-mat-code`);
    const data: MatCode[] = await response.json();
    SetMatCode(data.map(item => ({ value: item.MatCode, label: item.MatCode })));
  } catch (error) {
    console.error('Error fetching plant codes:', error);
    toast({ title: "Error", description: "Failed to fetch plant codes", variant: "destructive" });
  }
};

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
    return '';
  };

  useEffect(() => {
    const fetchDataSequentially = async () => {

      await fetchUnitCode();
      await delay(50);
      await fetchMatCode();
      await delay(50);
      
      await fetchWarehouseCodes();
      await delay(50);
      
      await fetchLocations();
      await delay(50);
      
      // Insert audit trail for page load
      await insertAuditTrail({
        AppType: "Web",
        Activity: "Warehouse Location Master",
        Action: `Warehouse Location Master Opened by ${getUserID()}`,
        NewData: "",
        OldData: "",
        Remarks: "",
        UserId: getUserID(),
        PlantCode: getUserPlant()
      });
    };
    fetchDataSequentially();
  }, []);

  const fetchWarehouseCodes = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/master/get-all-wh-code`);
      if (response.status === 200) {
        setWarehouseCodes(response.data);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch warehouse codes",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch warehouse codes",
        variant: "destructive",
      });
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/master/get-all-wh-location`);
      if (response.status === 200) {
        setLocations(response.data);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch warehouse locations",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch warehouse locations",
        variant: "destructive",
      });
    }
  };

    // Logic for pagination
  
    const filteredData = useMemo(() => {
      return locations.filter(item => {
        const searchableFields: (keyof WarehouseLocation)[] = ['CompanyCode', 'WH_Category_Code', 'WarehouseCode', 'PlantCode', 'UpdatedBy', 'CreatedBy','Location','Rack','Bin','UniqueCode','DisplayCode','Status','WH_Category_Code','Height','Capacity'];
        return searchableFields.some(key => {
          const value = item[key];
          return value != null && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
        });
      });
    }, [locations, searchTerm]);
    
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
    

 const handleSave = async () => {
    if (!warehouseValue.trim() || !uniqueCode.trim() || !location.trim()|| !rack.trim() || !status.trim()) {
      sooner(`Please fill mandatory fields marked as *`);
      return;
    }

    const userID = getUserID();
    if (!userID) {
      toast({
        title: "Error",
        description: "Failed to retrieve user ID",
        variant: "destructive",
      });
      return;
    }

    const newLocationData = {
      WarehouseCode: warehouseValue.trim(),
      Location: location.trim(),
      Rack: rack.trim(),
      Bin: bin.trim(),
      UniqueCode: uniqueCode.trim(),
      User: userID.trim(),
      WStatus: status.trim(),
      Height: height.trim(),
      Width: width.trim(),
      UOM: uom.trim(),
      Length: length.trim(),
      Capacity: capacity.trim(),
      RestrictToMaterial:restrictMatCode ? restrictMatCode.join(',') : '',
    };

    try {
      const response = await axios.post(`${BACKEND_URL}/api/master/insert-wh-location`, newLocationData);

      if (response.status === 200) {
        toast({
          title: "Success",
          description: "Warehouse location added successfully",
        });
        fetchLocations();
        resetForm();

        insertAuditTrail({
          AppType: "Web",
          Activity: "Warehouse Location Master",
          Action: `Warehouse Location Added by ${userID}`,
          NewData: JSON.stringify(newLocationData),
          OldData: "",
          Remarks: "",
          UserId: userID,
          PlantCode: ""
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to save warehouse location",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save warehouse location",
        variant: "destructive",
      });
    }
  };

  const handleUpdate = async () => {
    if (!selectedLocation) return;

    const userID = getUserID();
    if (!userID) {
      toast({
        title: "Error",
        description: "Failed to retrieve user ID",
        variant: "destructive",
      });
      return;
    }

    const updatedLocationData = {
      Id: selectedLocation.ID,
      WarehouseCode: warehouseValue.trim(),
      Location: location.trim(),
      Rack: rack.trim(),
      Bin: bin.trim(),
      UniqueCode: uniqueCode.trim(),
      User: userID.trim(),
      Status: status.trim(),
      Height: height.trim(),
      Width: width.trim(),
      UOM: uom.trim(),
      Length: length.trim(),
      Capacity: capacity.trim(),
      RestrictToMaterial: Array.isArray(restrictMatCode) ? restrictMatCode : null
    };

    try {
      const response = await axios.patch(`${BACKEND_URL}/api/master/update-wh-location`, updatedLocationData);

      if (response.status === 200) {
        toast({
          title: "Success",
          description: "Warehouse location updated successfully",
        });
        fetchLocations();
        resetForm();
        setIsUpdating(false);

        const changedFields: string[] = [];
        if (oldData) {
          // ... (keep existing changed fields logic)
          if (oldData.Height !== height) changedFields.push(`Height: ${oldData.Height} -> ${height}`);
          if (oldData.Width !== width) changedFields.push(`Width: ${oldData.Width} -> ${width}`);
          if (oldData.UOM !== uom) changedFields.push(`UOM: ${oldData.UOM} -> ${uom}`);
          if (oldData.Length !== length) changedFields.push(`Length: ${oldData.Length} -> ${length}`);
          if (oldData.Capacity !== capacity) changedFields.push(`Capacity: ${oldData.Capacity} -> ${capacity}`);
          if (oldData.RestrictToMaterial !== restrictToMaterial) changedFields.push(`RestrictToMaterial: ${oldData.RestrictToMaterial} -> ${restrictToMaterial}`);
        }

        insertAuditTrail({
          AppType: "Web",
          Activity: "Warehouse Location Master",
          Action: `Warehouse Location Updated by ${userID}`,
          NewData: changedFields.join(", "),
          OldData: oldData ? JSON.stringify(oldData) : "",
          Remarks: "",
          UserId: userID,
          PlantCode: ""
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update warehouse location",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update warehouse location",
        variant: "destructive",
      });
    }
  };

  

  const handleUniqueCodeFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    const generatedCode = generateUniqueCode();
    e.currentTarget.value = generatedCode;
    setUniqueCode(generatedCode);
  };

  const resetForm = () => {
    setWarehouseValue("");
    setLocation("");
    setRack("");
    setBin("");
    setUniqueCode("");
    setStatus("Active");
    setSelectedLocation(null);
    setOldData(null);
    setHeight("");
    setWidth("");
    setUom("");
    setLength("");
    setCapacity("");
    setRestrictMatCode([]);
    setShowAdditionalDetails(false);
  };

  const handleRowClick = (location: WarehouseLocation) => {
    console.log("Checking location   -",location)
    setSelectedLocation(location);
    setOldData(location);
    setWarehouseValue(location.WarehouseCode);
    setLocation(location.Location);
    setRack(location.Rack);
    setBin(location.Bin || "");
    setUniqueCode(location.UniqueCode);
    setStatus(location.Status);
    setHeight(location.Height || "");
    setWidth(location.Width || "");
    setUom(location.UOM || "");
    setLength(location.Length || "");
    setCapacity(location.Capacity || "");
    setRestrictMatCode(location.RestrictToMaterial?.split(',') || null);
    setIsUpdating(true);
    const hasAdditionalData = location.Height===null || location.Width===null || location.UOM===null || location.Length===null || location.Capacity===null|| location.RestrictToMaterial==='';
    setShowAdditionalDetails(!hasAdditionalData);
    console.log(!hasAdditionalData)
    insertAuditTrail({
      AppType: "Web",
      Activity: "Warehouse Location Master",
      Action: `Warehouse Location Edit Initiated by ${getUserID()}`,
      NewData: "",
      OldData: JSON.stringify(location),
      Remarks: "",
      UserId: getUserID(),
      PlantCode: ""
    });
  };

  const warehouseOptions = warehouseCodes.map(code => ({
    value: code.WarehouseCode,
    label: code.WarehouseCode,
  }));

  return (
    <>
       <Card className="w-full mx-auto mt-5">
        <CardHeader>
          <CardTitle>Warehouse Location Master <span className='font-normal text-sm text-muted-foreground'>(* Fields Are Mandatory)</span> </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="warehouse">Warehouse *</Label>
                <CustomDropdown
                  options={warehouseOptions}
                  value={warehouseValue}
                  onValueChange={setWarehouseValue}
                  placeholder="Select warehouse..."
                  searchPlaceholder="Search warehouse..."
                  emptyText="No warehouse found."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input id="location" required value={location} onChange={(e) => setLocation(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rack">Rack *</Label>
                <Input id="rack" required value={rack} onChange={(e) => setRack(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bin">Bin </Label>
                <Input id="bin" value={bin} onChange={(e) => setBin(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="uniqueCode">Unique Code *</Label>
                <Input 
                  id="uniqueCode" 
                  value={uniqueCode} 
                  onFocus={handleUniqueCodeFocus} 
                  onChange={(e) => setUniqueCode(e.target.value)} 
                  disabled={isUpdating} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Deactive">Deactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 flex items-end">
                <Button
                    className="border border-x-red-500 border-y-blue-600 button-transition"
                    variant="ghost"
                    type="button"
                    onClick={() => setShowAdditionalDetails(!showAdditionalDetails)}
                >
                    {showAdditionalDetails ? (
                        <>
                            Hide <ChevronDown className={`ml-1 icon-transition ${showAdditionalDetails ? 'rotate-180' : ''}`} />
                        </>
                    ) : (
                        <>
                            Add more details <ChevronDown className={`ml-1 icon-transition ${showAdditionalDetails ? 'rotate-180' : ''}`} />
                        </>
                    )}
                </Button>
              </div>
            </div>

            {showAdditionalDetails && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="height">Height</Label>
                  <Input id="height" type="number" value={height} onChange={(e) => setHeight(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="width">Width</Label>
                  <Input id="width" type="number" value={width} onChange={(e) => setWidth(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="uom">UOM</Label>
                  <CustomDropdown
                      options={units}
                      value={uom}
                      onValueChange={setUom}
                      placeholder="Select UOM..."
                      searchPlaceholder="Search UOM..."
                      emptyText="No UOM found."
                    />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="length">Length</Label>
                  <Input id="length" type="number" value={length} onChange={(e) => setLength(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input id="capacity" value={capacity} onChange={(e) => setCapacity(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="restrictToMaterial">Restrict to material</Label>
                  <MultiSelect
                  className='w-full'
                  options={matCode}
                  onValueChange={(value: string[]) => setRestrictMatCode(value)}
                  defaultValue={restrictMatCode}
                  placeholder="Select Material Code"
                  variant="inverted"
                />
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <Button type="button" onClick={handleSave} disabled={isUpdating}>Save</Button>
              <Button type="button" onClick={handleUpdate} disabled={!isUpdating}>Update</Button>
              <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
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
                  <TableHead>Company Code</TableHead>
                  <TableHead>Plant Code</TableHead>
                  <TableHead>Warehouse Code</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Rack</TableHead>
                  <TableHead>Unique Code</TableHead>
                  <TableHead>Bin</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>WH Category Code</TableHead>
                  <TableHead>Created by</TableHead>
                  <TableHead>Created On</TableHead>
                  <TableHead>Updated by</TableHead>
                  <TableHead>Updated On</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.isArray(paginatedData) && paginatedData.map((location) => (
                  <TableRow key={location.ID}>
                    <TableCell>
                      <Button variant="ghost" onClick={() => handleRowClick(location)}>Select</Button>
                    </TableCell>
                    <TableCell>{location.CompanyCode}</TableCell>
                    <TableCell>{location.PlantCode}</TableCell>
                    <TableCell>{location.WarehouseCode}</TableCell>
                    <TableCell>{location.Location}</TableCell>
                    <TableCell>{location.Rack}</TableCell>
                    <TableCell>{location.UniqueCode}</TableCell>

                    <TableCell>{location.Bin}</TableCell>
                    <TableCell>{location.Status}</TableCell>
                    <TableCell>{location.WH_Category_Code}</TableCell>
                    <TableCell>{location.CreatedBy}</TableCell>
                    <TableCell>{new Date(location.CreatedOn).toLocaleDateString()}</TableCell>
                    <TableCell>{location.UpdatedBy}</TableCell>
                    <TableCell>{location.UpdatedOn ? new Date(location.UpdatedOn).toLocaleDateString() : ''}</TableCell>
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

export default WarehouseLocationMaster;
