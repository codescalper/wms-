"use client"
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MultiSelect } from "@/components/multi-select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import axios from 'axios';
import { BACKEND_URL } from '@/lib/constants';


interface UserRole {
  U_ID: number;
  UserType: string;
  Web_MenuAccess: string;
  HHT_MenuAccess: string;
  CreatedBy: string;
  CreatedDate: string;
  UpdatedBy: string | null;
  UpdatedDate: string | null;
}

interface ApiResponse {
  RES: string;
}

const webAccessOptions = [
  { label: "1) - Dashboard", value: "1" },
  { label: "2) - Company Master", value: "2_1" },
  { label: "3) - Plant Master", value: "2_2" },
  { label: "4) - WH Category Master", value: "2_3" },
  { label: "5) - UOM Master", value: "2_8" },
  { label: "6) - Warehouse Master", value: "2_4" },
  { label: "7) - WH Location Master", value: "2_5" },
  { label: "8) - Material Master", value: "2_6" },
  { label: "9) - Line Master", value: "2_7" },
  { label: "10) - Gate Entry Inward", value: "3_1" },
  { label: "11) - Gate Entry Reversal", value: "3_2" },
  { label: "12) - Create GRN", value: "3_3" },
  { label: "13) - RM Label Printing", value: "3_4" },
  { label: "14) - Gate Entry Outward", value: "3_5" },
  { label: "15) - Material Request & Assign", value: "3_6" },
  { label: "16) - Location Label Print", value: "3_7" },
  { label: "17) - Pallet Label Print", value: "3_8" },
  { label: "18) - FG Label Print Manual", value: "7_1" },
  { label: "19) - FG Material Req and Assign", value: "7_2" },
  { label: "20) - RePrint Gate Entry No", value: "4_1" },
  { label: "21) - RePrint RM Label Printing", value: "4_2" },
  { label: "22) - Reprint Pallet Barcode", value: "4_3" },
  { label: "23) - Reprint FG Label Print", value: "4_4" },
  { label: "24) - Gate Inward Details", value: "5_1" },
  { label: "25) - Gate Inward Reversal", value: "5_2" },
  { label: "26) - Create GRN Data", value: "5_3" },
  { label: "27) - RM Label Print Data", value: "5_4" },
  { label: "28) - Gate Outward Details", value: "5_5" },
  { label: "29) - Sql Exception", value: "5_6" },
  { label: "30) - Audit Trail", value: "5_7" },
  { label: "31) - Create GRN Details", value: "5_8" },
  { label: "32) - QC Details", value: "5_9" },
  { label: "33) - Pallet Details", value: "5_10" },
  { label: "34) - RM Inward Details", value: "5_11" },
  { label: "35) - RM Put Away", value: "5_12" },
  { label: "36) - RM Internal Movement Details", value: "5_13" },
  { label: "37) - RM Picking Details", value: "5_14" },
  { label: "38) - RM Receipt Details", value: "5_15" },
  { label: "39) - RM Location Wise Stock", value: "5_16" },
  { label: "40) - RM Stock Take", value: "5_17" },
  { label: "41) - RM Stock Adjustment", value: "5_18" }, 
  { label: "42) - RM Mat Req & Assign Details", value: "5_19" },
  { label: "43) - FG Label Print Details", value: "8_1" },
  { label: "44) - FG Reprint Label Details", value: "8_2" },
  { label: "45) - FG QC Details", value: "8_3" },
  { label: "46) - FG Inward Details", value: "8_4" },
  { label: "47) - FG Put Away", value: "8_5" },
  { label: "48) - FG Internal Transfer", value: "8_6" },
  { label: "49) - User Master", value: "6_1" },
  { label: "50) - User Role Master", value: "6_2" },
  { label: "51) - Change Password", value: "6_3" },
  { label: "52) - Android Access", value: "6_4" },
  { label: "53) - Production Data Upload", value: "3_9" },
  { label: "54) - FG Track Back", value: "3_10" }
];

const hhtAccessOptions = [
  { label: "1) RM Quality Check", value: "1_1" },
  { label: "2) RM Palletization", value: "1_2" },
  { label: "3) RM Material Inward", value: "1_3" },
  { label: "4) RM Put Away", value: "1_4" },
  { label: "5) RM Internal Movement", value: "1_5" },
  { label: "6) RM Material Picking", value: "1_6" },
  { label: "7) RM Material Receipt", value: "1_7" },
  { label: "8) RM Material Consumption", value: "1_8" },
  { label: "9) RM Stock Adjustment", value: "1_9" },
  { label: "10) RM Stock Take", value: "1_10" },
  { label: "11) RM Material Return", value: "1_11" },
  { label: "12) RM Report", value: "1_12" },
  { label: "13) RM Label Re-Print", value: "1_13" },
  { label: "14) RM Printer Setting", value: "1_14" },
  { label: "15) FG Quality Check", value: "2_1" },
  { label: "16) FG Palletization", value: "2_2" },
  { label: "17) FG Material Inward", value: "2_3" },
  { label: "18) FG Put Away", value: "2_4" },
  { label: "19) FG Internal Movement", value: "2_5" },
  { label: "20) FG Material Picking", value: "2_6" },
  { label: "21) FG Material Receipt", value: "2_7" },
  { label: "22) FG Material Consumption", value: "2_8" },
  { label: "23) FG Stock Adjustment", value: "2_9" },
  { label: "24) FG Stock Take", value: "2_10" },
  { label: "25) FG Material Return", value: "2_11" },
  { label: "26) FG Report", value: "2_12" },
  { label: "27) FG Label Re-Print", value: "2_13" },
  { label: "28) FG Printer Setting", value: "2_14" },
  { label: "29) Production Data Upload", value: "2_15" },
  { label: "30) FG Track-Back", value: "2_16" },
];


const UserRoleMaster: React.FC = () => {
  const [userRole, setUserRole] = useState('');
  const [webAccess, setWebAccess] = useState<string[]>([]);
  const [hhtAccess, setHhtAccess] = useState<string[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const userRoleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchUserRoles();
  }, []);

  const fetchUserRoles = async () => {
    try {
      const response = await axios.get<UserRole[]>(`${BACKEND_URL}/api/admin/get-all-user-role`);
      setUserRoles(response.data);
    } catch (error) {
      console.error('Error fetching user roles:', error);
      toast({
        title: "Error",
        description: "Failed to fetch user roles.",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    if (!userRole) {
      userRoleRef.current?.focus();
      toast({
        title: "Error",
        description: "Please enter user role.",
        variant: "destructive",
      });
      return;
    }
    if (webAccess.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one WEB Access",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await axios.post<ApiResponse[]>(`${BACKEND_URL}/api/admin/insert-user-role`, {
        UserRole: userRole,
        WebAccess: webAccess.join(','),
        HHTAccess: hhtAccess.join(','),
        Createdby: "admin" // You might want to get this from a global state or context
      });

      if (response.data[0].RES === "Save") {
        toast({
          title: "Success",
          description: "User Role inserted successfully",
        });
        fetchUserRoles();
        handleCancel();
      }
    } catch (error) {
      console.error('Error saving user role:', error);
      toast({
        title: "Error",
        description: "Failed to save user role.",
        variant: "destructive",
      });
    }
  };

  const handleUpdate = async () => {
    if (!editingId) return;

    try {
      const response = await axios.post<ApiResponse[]>(`${BACKEND_URL}/api/admin/update-user-role`, {
        ID: editingId,
        UserRole: userRole,
        WebAccess: webAccess.join(','),
        HHTAccess: hhtAccess.join(','),
        Updatedby: "admin" // You might want to get this from a global state or context
      });

          toast({
            title: "Success",
            description: "User Role updated successfully",
          });
          fetchUserRoles();
          handleCancel();

     
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: "Error",
        description: "Failed to update user role.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setUserRole('');
    setWebAccess([]);
    setHhtAccess([]);
    setIsEditing(false);
    setEditingId(null);
  };

  const handleEdit = (role: UserRole) => {
    setUserRole(role.UserType);
    setWebAccess(role.Web_MenuAccess.split(','));
    setHhtAccess(role.HHT_MenuAccess.split(','));
    setIsEditing(true);
    setEditingId(role.U_ID);
  };

  return (
    <div className="space-y-8">
      <Card className='mt-5'>
        <CardHeader>
          <CardTitle>User Role Master (* Fields Are Mandatory)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <Label htmlFor="userRole" className="block text-sm font-medium">User Role (*)</Label>
              <Input
                id="userRole"
                value={userRole}
                ref={userRoleRef}
                onChange={(e) => setUserRole(e.target.value)}
                className="mt-1 w-full sm:w-1/2 md:w-1/2 lg:w-1/4"
                disabled={isEditing}
              />
            </div>
    
            <div className="grid md:grid-cols-2 grid-cols-1 md:gap-4 gap-6">
              <div>
                <Label className="block text-sm font-medium">Allow Web Access (*)</Label>
                <MultiSelect
                  options={webAccessOptions}
                  onValueChange={(value: string[]) => setWebAccess(value)}
                  defaultValue={webAccess}
                  placeholder="Select Web Access options"
                  variant="inverted"
                />
              </div>
              <div>
                <Label className="block text-sm font-medium">Allow HHT Access (*)</Label>
                <MultiSelect
                  options={hhtAccessOptions}
                  onValueChange={(value: string[]) => setHhtAccess(value)}
                  defaultValue={hhtAccess}
                  placeholder="Select HHT Access options"
                  variant="inverted"
                />
              </div>
            </div>
    
            <div className="flex justify-end space-x-4">
              <Button onClick={handleSave} disabled={isEditing}>Save</Button>
              <Button onClick={handleUpdate} disabled={!isEditing}>Update</Button>
              <Button onClick={handleCancel} variant="outline">Cancel</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    
            <Card>
        <CardHeader>
            <CardTitle>User Roles</CardTitle>
        </CardHeader>
        <CardContent>
            {Array.isArray(userRoles) && userRoles.length > 0 ? (
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead></TableHead>
                    <TableHead>UID</TableHead>
                    <TableHead>User Role</TableHead>
                    <TableHead>Web Menu Access</TableHead>
                    <TableHead>HHT Menu Access</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead>Created Date</TableHead>
                    <TableHead>Updated By</TableHead>
                    <TableHead>Updated Date</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {userRoles.map((role) => (
                    <TableRow key={role.U_ID}>
                    <TableCell>
                        <Button variant="outline" size="sm" onClick={() => handleEdit(role)}>Edit</Button>
                    </TableCell>
                    <TableCell>{role.U_ID}</TableCell>
                    <TableCell>{role.UserType}</TableCell>
                    <TableCell>{role.Web_MenuAccess}</TableCell>
                    <TableCell>{role.HHT_MenuAccess}</TableCell>
                    <TableCell>{role.CreatedBy}</TableCell>
                    <TableCell>{new Date(role.CreatedDate).toLocaleDateString()}</TableCell>
                    <TableCell>{role.UpdatedBy}</TableCell>
                    <TableCell>{role.UpdatedDate ? new Date(role.UpdatedDate).toLocaleDateString() : '-'}</TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
            ) : (
            <p className='text-center'>No User Roles created yet</p>
            )}
        </CardContent>
        </Card>

    </div>
  );
};

export default UserRoleMaster;