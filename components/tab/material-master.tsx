"use client"
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { BACKEND_URL } from '@/lib/constants';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';
import insertAuditTrail from '@/utills/insertAudit'; 
import { Checkbox } from "@/components/ui/checkbox";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ClipLoader } from "react-spinners";
import { useRef } from 'react';
import TableSearch from '@/utills/tableSearch';
import CustomDropdown from '../CustomDropdown';
import { delay } from '@/utills/delay';
import { ChevronDown } from 'lucide-react';
import { toast as sooner } from "sonner";
interface Material {
  M_Id: number;
  MatCode: string | null;
  MatDesc: string;
  MatType: string;
  UOM: string;
  MaterialGroup: string;
  SerilizationFlag: string;
  LotControlled: string;
  Tolerance: string;
  CompanyCode: string;
  CreatedBy: string;
  CreatedDate: string | null;
  UpdateBy: string | null;
  UpdateDate: string | null;
  QC: string | null;
  QC_Percentage: string | null;
  PalletCount: string | null;
  PackSize: string | null;
  Cost: number | null;
  MaterialCategory: string | null;
  WMSApplicable: string | null;
  flag: string | null;
  PlantCode: string | null;
  Status: string | null;

}

interface UnitCode {
  Unit: string;
}

interface DropdownOption {
  value: string;
  label: string;
}

interface PlantCode {
  PlantCode: string;
}
const MaterialMaster: React.FC = () => {
  const [materialCode, setMaterialCode] = useState<string>("");
  const [materialDescription, setMaterialDescription] = useState<string>("");
  const [materialType, setMaterialType] = useState<string>("");
  const [uom, setUom] = useState<string>("");
  const [productType, setProductType] = useState<string>("");
  const [companyCode, setCompanyCode] = useState<string>("");
  const [serializationReq, setSerializationReq] = useState(false);
  const [lotControlled, setLotControlled] = useState(false);
  const [tolerance, setTolerance] =  useState<number | string>('');
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [units, setUnits] = useState<DropdownOption[]>([]);
  const { toast } = useToast();
  const [displayedMaterials, setDisplayedMaterials] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [qcChecked, setQcChecked] = useState(false);
  const [qcPercentage, setQcPercentage] = useState<number | string>('');
  const [filteredMaterials, setFilteredMaterials] = useState<Material[]>([]);
  const [showAdditionalDetails, setShowAdditionalDetails] = useState(false);
  const [palletSize, setPalletSize] = useState<string>('');
  const [packSize, setPackSize] = useState<string>('');
  const [cost, setCost] = useState<number | string>('');
  const [materialCategory, setMaterialCategory] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [wmsApplicable , setWmsApplicable] = useState<string>('');
  const [plantCode , setPlantCode] = useState<string>('');
  const [flag , setFlag] = useState<string>('');
  const [plantCodes, setPlantCodes] = useState<DropdownOption[]>([]);


  const materialCodeRef = useRef<HTMLInputElement>(null);
  const materialDescRef = useRef<HTMLInputElement>(null);
  const MaterialTypeRef = useRef<HTMLInputElement>(null);
  const productTypeRef = useRef<HTMLInputElement>(null);
  const toleranceRef = useRef<HTMLInputElement>(null);
  // for search and pagination
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  useEffect(() => {
    setFilteredMaterials(materials);
  }, [materials]);
  console.log("Hello",tolerance)

  useEffect(() => {
    const fetchDataSequentially = async () => {
      await fetchPlantCodes()
      await delay(50);
      await fetchUnitCode();
      await delay(50);
      await fetchMaterials();
      await delay(100);
      await fetchUnitCode();
      await delay(50);
      
      await insertAuditTrail({
        AppType: "Web",
        Activity: "Material Master",
        Action: `Material Master Opened by ${getUserID()}`,
        NewData: "",
        OldData: "",
        Remarks: "",
        UserId: getUserID(),
        PlantCode: ""
      });
    };
    fetchDataSequentially();
  }, []);

  const filteredData = useMemo(() => {
    return materials.filter(item => {
      const searchableFields: (keyof Material)[] = ['MatCode', 'MatDesc', 'MatType', 'UOM', 'MaterialGroup', 'CompanyCode' , 'WMSApplicable' , 'flag', 'PlantCode'];
      return searchableFields.some(key => {
        const value = item[key];
        return value != null && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
      });
    });
  }, [materials, searchTerm]);

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


  const fetchPlantCodes = async () => {

    try {
      const response = await fetch(`${BACKEND_URL}/api/master/get-all-plant-code`);
      const data: PlantCode[] = await response.json();
      setPlantCodes(data.map(item => ({ value: item.PlantCode, label: item.PlantCode })));
    } catch (error) {
      console.error('Error fetching plant codes:', error);
      toast({ title: "Error", description: "Failed to fetch plant codes", variant: "destructive" });
    }
  };


  const fetchMaterials = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/master/get-all-material-details`);
      const data: Material[] = await response.json();
      setMaterials(data);
    } catch (error) {
      console.error('Error fetching materials:', error);
      toast({ title: "Error", description: "Failed to fetch materials", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

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
  const handleSave = async () => {
    if (!plantCode  ) {
      sooner(`Please select the plant code`);
      return;
    }
    if (!materialCode  ) {
      materialCodeRef.current?.focus()
      sooner(`Please fill the Material code`);
      return;
    }
    if (!materialDescription  ) {
      materialDescRef.current?.focus()
      sooner(`Please fill the Material descirption`);
      return;
    }

    if(!materialType){
      MaterialTypeRef.current?.focus()
      sooner(`Please fill the material type`);
      return;
    }

    if( !uom ){
      sooner(`Please select the material unit of measurment`);
      return;
    }

    if(!productType){
      productTypeRef.current?.focus()
      toast({ title: "Error", description: "Please fill all required fields", variant: "destructive" });
      return;
    }
    try {
      const newMaterial = {
        PlantCode : plantCode,
        MatCode: materialCode,
        MatDesc: materialDescription,
        MatType: materialType,
        UOM: uom,
        MaterialGroup: productType,
        CreatedBy: getUserID(),
        CompanyCode: companyCode,
        // Only include additional fields if they are shown
        ...(showAdditionalDetails ? {
          SerilizationFlag: serializationReq ? "1" : "2",
          LotControlled: lotControlled ? "1" : "2",
          Tolerance: tolerance ? tolerance.toString() : null,
          QC: qcChecked ? "1" : "2",
          QC_Quantity_NEW: qcChecked ? qcPercentage.toString() : null,
          PalletCount: palletSize || null,
          PackSize: packSize || null,
          Cost: cost ? cost.toString() : null,
          MaterialCategory: materialCategory || null,
          Status: status || null,
          WMSApplicable: wmsApplicable || null,
          flag : flag || null,

        } : {
          SerilizationFlag: null,
          LotControlled: null,
          Tolerance: null,
          QC: null,
          QC_Quantity_NEW: null,
          PalletCount: null,
          PackSize: null,
          Cost: null,
          MaterialCategory: null,
          Status: null,
          WMSApplicable : null,
          flag : null,
        })
      };

      const response = await fetch(`${BACKEND_URL}/api/master/insert-material-details`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMaterial),
      });
      const data = await response.json();
      if (data[0].RES === "Save") {
        toast({ title: "Success", description: "Material saved successfully" });
        fetchMaterials();
        handleCancel();

        insertAuditTrail({
          AppType: "Web",
          Activity: "Material Master",
          Action: `New Material Added by ${getUserID()}`,
          NewData: JSON.stringify(newMaterial),
          OldData: "",
          Remarks: "",
          UserId: getUserID(),
          PlantCode: companyCode,
        });
      } else if (data[0].RES === "Duplicate") {
        toast({ title: "Error", description: "Material Code already exists", variant: "destructive" });
      } else {
        toast({ title: "Error", description: "Failed to save material", variant: "destructive" });
      }
    } catch (error) {
      console.error('Error saving material:', error);
      toast({ title: "Error", description: "Failed to save material", variant: "destructive" });
    }
  };

  const handleUpdate = async () => {
    if (!selectedId) return;
    try {
      const updatedMaterial = {
        M_Id: selectedId,
        MatCode: materialCode,
        MatDesc: materialDescription,
        MatType: materialType,
        UOM: uom,
        MaterialGroup: productType,  // Ensure this matches with MaterialGroup
        CreatedBy: getUserID(),
        SerilizationFlag: showAdditionalDetails ? (serializationReq ? "1" : "2") : null,
        LotControlled: showAdditionalDetails ? (lotControlled ? "1" : "2") : null,
        Tolerance: showAdditionalDetails ? tolerance : null,
        QC: showAdditionalDetails ? (qcChecked ? "1" : "2") : null,
        QC_Quantity_NEW: showAdditionalDetails ? (qcChecked ? qcPercentage.toString() : null) : null,
        PalletCount: showAdditionalDetails ? (palletSize || null) : null,
        Packsize: showAdditionalDetails ? (packSize || null) : null,
        Cost: showAdditionalDetails ? (cost ? cost.toString() : null) : null,
        MaterialCategory: showAdditionalDetails ? (materialCategory || null) : null,
        Status: showAdditionalDetails ? (status || null) : null,
        WMSApplicable:showAdditionalDetails ? (wmsApplicable || null) : null,
        flag:showAdditionalDetails ? (flag || null) : null,
      };
    
  

      const response = await fetch(`${BACKEND_URL}/api/master/update-material-details`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedMaterial),
      });
      const data = await response.json();
      if (data[0].Message === "Updated successfully") {
        toast({ title: "Success", description: "Material updated successfully" });
        fetchMaterials();
        handleCancel();

        const oldMaterial = materials.find(m => m.M_Id === selectedId);
        if (oldMaterial) {
          insertAuditTrail({
            AppType: "Web",
            Activity: "Material Master",
            Action: `Material Updated by ${getUserID()}`,
            NewData: JSON.stringify(updatedMaterial),
            OldData: JSON.stringify(oldMaterial),
            Remarks: "",
            UserId: getUserID(),
            PlantCode: companyCode
          });
        }
      } else {
        toast({ title: "Error", description: "Failed to update material", variant: "destructive" });
      }
    } catch (error) {
      console.error('Error updating material:', error);
      toast({ title: "Error", description: "Failed to update material", variant: "destructive" });
    }
  };

  const handleRowSelect = (material: Material) => {
    console.log(material)
    setSelectedId(material.M_Id);
    setMaterialCode(material.MatCode || "");
    setMaterialDescription(material.MatDesc);
    setMaterialType(material.MatType);
    setUom(material.UOM);
    setProductType(material.MaterialGroup);
    setCompanyCode(material.CompanyCode);
    setSerializationReq(material.SerilizationFlag === "1");
    setLotControlled(material.LotControlled === "1");
    setTolerance(material.Tolerance);
    setQcChecked(material.QC === "1");
    setQcPercentage(material.QC_Percentage ? Number(material.QC_Percentage) : '');
    setPalletSize(material.PalletCount || '');
    setPackSize(material.PackSize || '');
    setCost(material.Cost || '');
    setMaterialCategory(material.MaterialCategory || '');
    setStatus(material.Status || '');
    setIsEditing(true);
    setShowAdditionalDetails(true)
   
    insertAuditTrail({
      AppType: "Web",
      Activity: "Material Master",
      Action: `Edit initiated by ${getUserID()}`,
      NewData: "",
      OldData: JSON.stringify(material),
      Remarks: "Material selected for editing",
      UserId: getUserID(),
      PlantCode: material.CompanyCode
    });
  };

  const handleCancel = () => {
    setFlag('')
    setWmsApplicable('')
    setPlantCode('')
    setMaterialCode("");
    setMaterialDescription("");
    setMaterialType("");
    setUom("");
    setProductType("");
    setCompanyCode("");
    setSerializationReq(false);
    setLotControlled(false);
    setTolerance("");
    setQcChecked(false);
    setQcPercentage('');
    setPalletSize('');
    setPackSize('');
    setCost('');
    setMaterialCategory('');
    setStatus('');
    setIsEditing(false);
    setSelectedId(null);
    setShowAdditionalDetails(false);
  };

  return (
    <>
      <Card className="w-full mx-auto mt-5">
        <CardHeader>
          <CardTitle>Material Master <span className='font-normal text-sm text-muted-foreground'>(* Fields Are Mandatory)</span></CardTitle>
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
                <Label htmlFor="materialCode">Item Code *</Label>
                <Input
                  id="materialCode"
                  value={materialCode}
                  onChange={(e) => setMaterialCode(e.target.value)}
                  required
                  disabled={isEditing}
                  ref={materialCodeRef}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="materialDescription">Item Desc *</Label>
                <Input
                  id="materialDescription"
                  value={materialDescription}
                  onChange={(e) => setMaterialDescription(e.target.value)}
                  required
                  ref={materialDescRef}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="materialType">Item Type *</Label>
                <Input
                  id="materialType"
                  value={materialType}
                  onChange={(e) => setMaterialType(e.target.value)}
                  required
                  ref={MaterialTypeRef}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="uom">UOM * </Label>
                <CustomDropdown
                  options={units}
                  value={uom}
                  onValueChange={setUom}
                  placeholder="Select UOM..."
                  searchPlaceholder="Search UOM..."
                  emptyText="No UOM found."
                  disabled={isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="productType">Material Group *</Label>
                <Input
                  id="productType"
                  value={productType}
                  onChange={(e) => setProductType(e.target.value)}
                  required
                  ref={productTypeRef}
                />
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
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="serializationReq"
                    checked={serializationReq}
                    onCheckedChange={(checked) => setSerializationReq(checked === true)}
                  />
                  <Label htmlFor="serializationReq">Serialization Req.</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="lotControlled"
                    checked={lotControlled}
                    onCheckedChange={(checked) => setLotControlled(checked === true)}
                  />
                  <Label htmlFor="lotControlled">Lot Controlled</Label>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tolerance">Tolerance</Label>
                  <Input
                    id="tolerance"
                    type='number'
                    value={tolerance}
                    onChange={(e) => setTolerance(e.target.value)}
                    ref={toleranceRef}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="palletSize">Pallet Size</Label>
                  <Input
                    id="palletSize"
                    type='number'
                    value={palletSize}
                    onChange={(e) => setPalletSize(e.target.value)}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="qcCheck"
                    checked={qcChecked}
                    onCheckedChange={(checked) => {
                      setQcChecked(checked === true);
                      if (!checked) {
                        setQcPercentage('');
                      }
                    }}
                  />
                  <Label htmlFor="qcCheck">Quality Check</Label>
                </div>
                {qcChecked && (
                  <div className="space-y-2">
                    <Label htmlFor="qcPercentage">Quality Check Percentage</Label>
                    <Input
                      id="qcPercentage"
                      type="number"
                      value={qcPercentage}
                      onChange={e => {
                        const value = Number(e.target.value);
                        if (value >= 0 && value <= 100) {
                          setQcPercentage(value);
                        } else {
                          toast({ title: "Error", description: "Value entered cannot be greater than 100 or less than 0", variant: "destructive" });
                        }
                      }}
                      min={0}
                      max={100}
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="packSize">Pack Size</Label>
                  <Input
                    id="packSize"
                    value={packSize}
                    onChange={(e) => setPackSize(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cost">Cost</Label>
                  <Input
                    id="cost"
                    type="number"
                    value={cost}
                    onChange={(e) => setCost(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="materialCategory">Material Category</Label>
                  <Input
                    id="materialCategory"
                    value={materialCategory}
                    onChange={(e) => setMaterialCategory(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wmsApplicable">WMS Applicable</Label>
                  <Select value={wmsApplicable} onValueChange={setWmsApplicable}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select WMS applicability" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Yes">Yes</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="flag">Flag</Label>
                  <Select value={flag} onValueChange={setFlag}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Flag" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FEFO">FEFO</SelectItem>
                      <SelectItem value="FIFO">FIFO</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
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
            )}
            
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
            <div className="flex md:justify-between md:flex-row flex-col space-y-5 items-center mb-4">
              <div className="flex items-center space-x-2">
                <span>Show</span>
                <Select defaultValue="10" value={itemsPerPage.toString()} 
                  onValueChange={handleItemsPerPageChange}>
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
              <TableSearch onSearch={handleSearch} />
            </div>
            <div className="relative overflow-x-auto">
              {isLoading ? (
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <ClipLoader color='blue' size={30} />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Select</TableHead>
                      <TableHead>Plant Code</TableHead>
                      <TableHead>Item Code</TableHead>
                      <TableHead>Item Desc</TableHead>
                      <TableHead>Item Type</TableHead>
                      <TableHead>UOM</TableHead>
                      <TableHead>Material Group</TableHead>
                      <TableHead>SerializationFlag</TableHead>
                      <TableHead>LotControlled</TableHead>
                      <TableHead>Tolerance</TableHead>
                      <TableHead>Created By</TableHead>
                      <TableHead>Created Date</TableHead>
                      <TableHead>Updated By</TableHead>
                      <TableHead>Updated Date</TableHead>
                      <TableHead>QC</TableHead>
                      <TableHead>QC Percentage</TableHead>
                      <TableHead>WMS Applicable</TableHead>
                      <TableHead>Flag</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.isArray(paginatedData) && paginatedData.map((material) => (
                      <TableRow key={material.M_Id}>
                        <TableCell>
                          <Button variant={"outline"} onClick={() => handleRowSelect(material)}>Select</Button>
                        </TableCell>

                        <TableCell>{material.PlantCode ? material.PlantCode  : ""}</TableCell>
                        <TableCell>{material.MatCode}</TableCell>
                        <TableCell>{material.MatDesc}</TableCell>
                        <TableCell>{material.MatType}</TableCell>
                        <TableCell>{material.UOM}</TableCell>
                        <TableCell>{material.MaterialGroup}</TableCell>
                        <TableCell>{material.SerilizationFlag}</TableCell>
                        <TableCell>{material.LotControlled}</TableCell>
                        <TableCell>{material.Tolerance}</TableCell>
                        <TableCell>{material.CreatedBy}</TableCell>
                        <TableCell>
                          {material.CreatedDate ? new Date(material.CreatedDate).toLocaleDateString() : ""}
                        </TableCell>
                        <TableCell>{material.UpdateBy ? material.UpdateBy :"" }</TableCell>
                        <TableCell>
                          {material.UpdateDate ? new Date(material.UpdateDate).toLocaleDateString() : ""}
                        </TableCell>
                        <TableCell>{material.QC}</TableCell>
                        <TableCell>{material.QC_Percentage}</TableCell>
                        <TableCell>{material.WMSApplicable  ? material.WMSApplicable :""}</TableCell>
                        <TableCell>{material.flag  ? material.flag :"" }</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}


              {/* Pagination Component */}
              <div className="flex justify-between items-center text-sm md:text-md mt-4">
                <div>
                  {materials.length > 0 
                    ? `Showing ${((currentPage - 1) * itemsPerPage) + 1} to ${Math.min(currentPage * itemsPerPage, materials.length)} of ${materials.length} entries`
                    : 'No entries to show'}
                </div>
                {materials.length > 0 && (
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
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default MaterialMaster;