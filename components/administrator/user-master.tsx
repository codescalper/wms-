"use client";
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import CustomDropdown from '../CustomDropdown';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';
import { BACKEND_URL } from '@/lib/constants';
import insertAuditTrail from '@/utills/insertAudit';
import { getUserID } from '@/utills/getFromSession';
import { logError } from '@/utills/loggingException';

interface PlantOption {
  value: string;
  label: string;
}

interface UserData {
  User_ID: string;
  User_Name: string;
  User_Password: string;
  User_Role: string;
  Status: string;
  Locked: string;
  UpdatedBy: string;
  PassExpDays: number;
  LoginAttempt: number;
  Name: string;
  PlantCode: string;
  EmailId: string;
  MobileNo: string;
}

interface User {
  id: number;
  User_ID: string;
  User_Name: string;
  User_Password: string;
  User_Status: string;
  User_Role: string;
  Web_MenuAccess: string;
  CreatedBy: string;
  CreatedOn: string;
  UpdatedBy: string;
  UpdatedOn: string;
  Locked: string;
  LoginAttempt: number;
  LastPassChange: string;
  PassExpDays: number;
  Expired: string;
  Name: string;
  PlantCode: string;
  CompanyCode: number;
  Department: number;
  ChangePassFlag: string;
  Email: string;
  MobileNo: string;
  LastLogin: string | null;
  LoginVia: string | null;
  LoginCode: string | null;
}

const UserMaster: React.FC = () => {
  const { toast } = useToast();
  const [plantOptions, setPlantOptions] = useState<PlantOption[]>([]);
  const [userTypeOptions,setUserTypeOptions] = useState<PlantOption[]>([]);
  const [formData, setFormData] = useState<UserData>({
    User_ID: '',
    User_Name: '',
    User_Password: '',
    User_Role: '',
    Status: 'active',
    Locked: 'No',
    UpdatedBy: '',
    PassExpDays: 90,
    LoginAttempt: 0,
    Name: '',
    PlantCode: '',
    EmailId: '',
    MobileNo: '',
  });
  const [users, setUsers] = useState<User[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    fetchPlantNames();
    fetchUserTypeRoles();
    fetchUsers();
    insertAuditTrail({
      AppType: "Web",
      Activity: "User Master",
      Action: `User Master Opened by ${getUserID()}`,
      NewData: "",
      OldData: "",
      Remarks: "",
      UserId: getUserID(),
      PlantCode: ""
    });
  }, []);
  
  const fetchPlantNames = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/master/get-all-plant-code`);
      const data: { PlantCode: string }[] = await response.json();
      setPlantOptions(data.map(item => ({ value: item.PlantCode, label: item.PlantCode })));
    } catch (error:any) {
      console.error('Error fetching plant names:', error);
      logError('Error fetching plant names',error, 'UserMaster-fetchPlantNames', getUserID());
    }
  };

  const fetchUserTypeRoles = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/get-all-user-type`);
      const data: { UserType: string }[] = await response.json();
      setUserTypeOptions(data.map(item => ({ value: item.UserType, label: item.UserType })));
    } catch (error:any) {
      console.error('Error fetching User Types:', error);
      logError('Error fetching User Types',error, 'UserMaster-fetchUserTypeRoles', getUserID());
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/all-user-master`);
      const data: User[] = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({ title: "Error", description: "Failed to fetch users", variant: "destructive" });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePlantChange = (value: string) => {
    setFormData(prev => ({ ...prev, PlantCode: value }));
  };
  const handleUserTypeChange = (value: string) => {
    setFormData(prev => ({ ...prev, User_Role: value }));
  };

  const handleStatusChange = (value: string) => {
    setFormData(prev => ({ ...prev, Status: value }));
  };

  const handleLockStatus = (value: string) => {
    setFormData(prev => ({ ...prev, Locked: value }));
  };

  const handleSave = async () => {
    if(!formData.PlantCode){
      toast({ title: "Validation Error", description: "Please Enter plant code",variant:"destructive" });
      return
    }
    if(!formData.User_Role){
      toast({ title: "Validation Error", description: "Please Enter User Role",variant:"destructive" });
      return
    }
    if(!formData.User_Role){
      toast({ title: "Validation Error", description: "Please Enter User Role",variant:"destructive" });
      return
    }
    if (formData.User_Password !== confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
      return;
    }

    try {

      const response = await fetch(`${BACKEND_URL}/api/admin/insert-user-master`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, User_Password: formData.User_Password, CreatedBy: getUserID() }),
      });
      if (response.ok) {
        toast({ title: "Success", description: "User saved successfully" });
        fetchUsers();
        resetForm();

        // Insert audit trail for save action
        insertAuditTrail({
          AppType: "Web",
          Activity: "User Master",
          Action: `New User Added by ${getUserID()}`,
          NewData: `${formData.EmailId , formData.Name , formData.User_ID , formData.User_Name , formData.PlantCode , formData.User_Role}`,
          OldData: "",
          Remarks: "",
          UserId: getUserID(),
          PlantCode: formData.PlantCode
        });
      } else {
        toast({ title: "Error", description: "Failed to save user", variant: "destructive" });
      }
    } catch (error:any) {
      logError("Error saving user",error, 'UserMaster', getUserID());
      console.error('Error saving user:', error);
      toast({ title: "Error", description: "Failed to save user", variant: "destructive" });
    }
  };

  const handleUpdate = async () => {
    if (editingId === null) return;
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/edit-user-master`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ User_Name: formData.User_Name, User_Role: formData.User_Role, Status: formData.Status, User_ID: editingId, MobileNo: formData.MobileNo, EmailId: formData.EmailId, Locked: formData.Locked, PassExpDays: formData.PassExpDays, UpdatedBy: getUserID(), PlantCode: formData.PlantCode }),
      });
      if (response.ok) {
        toast({ title: "Success", description: "User updated successfully" });
        fetchUsers();
        resetForm();

        // Prepare audit data
        const updatedFields: string[] = [];
        const oldData = users.find(user => user.id === editingId);
        if (oldData) {
          if (oldData.User_Name !== formData.User_Name) updatedFields.push(`User Name: ${oldData.User_Name} -> ${formData.User_Name}`);
          if (oldData.Email !== formData.EmailId) updatedFields.push(`Email ID: ${oldData.Email} -> ${formData.EmailId}`);
          if (oldData.MobileNo !== formData.MobileNo) updatedFields.push(`Mobile No: ${oldData.MobileNo} -> ${formData.MobileNo}`);
          if (oldData.User_Status !== formData.Status) updatedFields.push(`Status: ${oldData.User_Status} -> ${formData.Status}`);
          if (oldData.Locked !== formData.Locked) updatedFields.push(`Locked: ${oldData.Locked} -> ${formData.Locked}`);
          if (oldData.PassExpDays !== formData.PassExpDays) updatedFields.push(`Password Exp Days: ${oldData.PassExpDays} -> ${formData.PassExpDays}`);
        }

        // Insert audit trail for update action
        insertAuditTrail({
          AppType: "Web",
          Activity: "User Master",
          Action: `User Updated by ${getUserID()}`,
          NewData: updatedFields.join('; '),
          OldData: "",
          Remarks: "",
          UserId: getUserID(),
          PlantCode: formData.PlantCode
        });
      } else {
        throw new Error('Failed to update');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast({ title: "Error", description: "Failed to update user", variant: "destructive" });
    }
  };

  const handleEdit = (user: User) => {
    setFormData({
      User_ID: user.User_ID,
      User_Name: user.User_Name,
      User_Password: '',
      User_Role: user.User_Role,
      Status: user.User_Status,
      Locked: user.Locked,
      UpdatedBy: user.UpdatedBy,
      PassExpDays: user.PassExpDays,
      LoginAttempt: user.LoginAttempt,
      Name: user.Name,
      PlantCode: user.PlantCode,
      EmailId: user.Email,
      MobileNo: user.MobileNo,
    });
    setIsEditing(true);
    setEditingId(user.id);
    
    // Insert audit trail for edit initiation
    insertAuditTrail({
      AppType: "Web",
      Activity: "User Master",
      Action: `Edit Initiated by ${getUserID()} for user id ${user.User_ID} with userName ${user.User_Name} and role ${user.User_Role}`,
      NewData: "",
      OldData: "",
      Remarks: "",
      UserId: getUserID(),
      PlantCode: ""
    });
  };

  const resetForm = () => {
    setFormData({
      User_ID: '',
      User_Name: '',
      User_Password: '',
      User_Role: '',
      Status: 'active',
      Locked: 'No',
      UpdatedBy: '',
      PassExpDays: 90,
      LoginAttempt: 0,
      Name: '',
      PlantCode: '',
      EmailId: '',
      MobileNo: '',
    });
    setConfirmPassword('');
    setIsEditing(false);
    setEditingId(null);
  };
  return (
    <>
      <Card className="w-full mx-auto mt-5">
        <CardHeader>
          <CardTitle>User Master <span className='font-normal text-sm text-muted-foreground'>(* Fields Are Mandatory)</span></CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div className="space-y-2">
                <Label htmlFor="PlantCode">Plant *</Label>
                <CustomDropdown
                  options={plantOptions}
                  value={formData.PlantCode}
                  onValueChange={handlePlantChange}
                  placeholder="Select plant code"
                  searchPlaceholder="Search plant code..."
                  emptyText="No plant code found."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="User_Role">User Type/Role *</Label>
                <CustomDropdown
                  options={userTypeOptions}
                  value={formData.User_Role}
                  onValueChange={handleUserTypeChange}
                  placeholder="Select User Type"
                  searchPlaceholder="Search User Type..."
                  emptyText="No user type found."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="User_Name">User Name *</Label>
                <Input id="User_Name" name="User_Name" value={formData.User_Name} onChange={handleInputChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="User_ID">User ID *</Label>
                <Input id="User_ID" name="User_ID" value={formData.User_ID} onChange={handleInputChange} required disabled={isEditing} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="EmailId">Email ID *</Label>
                <Input id="EmailId" name="EmailId" value={formData.EmailId} onChange={handleInputChange} required type='email' />
              </div>
              <div className="space-y-2">
                <Label htmlFor="User_Password">Password *</Label>
                <Input id="User_Password" name="User_Password" disabled={isEditing} value={formData.User_Password} onChange={handleInputChange} required type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <Input id="confirmPassword" value={confirmPassword} disabled={isEditing} onChange={(e) => setConfirmPassword(e.target.value)} required type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="Locked">Locked</Label>
                <Select value={formData.Locked} onValueChange={handleLockStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Lock Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="PassExpDays">Password Exp Days *</Label>
                <Input id="PassExpDays" name="PassExpDays" value={formData.PassExpDays} onChange={handleInputChange} required type="number" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="Status">Status</Label>
                <Select value={formData.Status} onValueChange={handleStatusChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Deactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="MobileNo">Mobile No</Label>
                <Input id="MobileNo" name="MobileNo" value={formData.MobileNo} onChange={handleInputChange} type="tel" />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" onClick={handleSave} disabled={isEditing}>Save</Button>
              <Button type="button" onClick={handleUpdate} disabled={!isEditing}>Update</Button>
              <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="w-full mx-auto mt-10">
        <CardHeader>
          <CardTitle className='text-center'>List of all users</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>User Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Web menu Access</TableHead>
                <TableHead>Locked Status</TableHead>
                <TableHead>Pass Exp Days</TableHead>
                <TableHead>Plant Code</TableHead>
                <TableHead>Email ID</TableHead>
                <TableHead>Mobile No</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
                {Array.isArray(users) && users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Button variant="ghost" onClick={() => handleEdit(user)}>Edit</Button>
                    </TableCell>
                    <TableCell>{user.User_ID}</TableCell>
                    <TableCell>{user.User_Name}</TableCell>
                    <TableCell>{user.User_Role}</TableCell>
                    <TableCell>{user.Web_MenuAccess}</TableCell>
                    <TableCell>{user.Locked}</TableCell>
                    <TableCell>{user.PassExpDays}</TableCell>
                    <TableCell>{user.PlantCode}</TableCell>
                    <TableCell>{user.Email}</TableCell>
                    <TableCell>{user.MobileNo}</TableCell>
                  </TableRow>
                ))}
              </TableBody>

          </Table>
        </CardContent>
      </Card>
    </>
  );
};

export default UserMaster;