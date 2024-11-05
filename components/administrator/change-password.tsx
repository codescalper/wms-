"use client";
import React, { useState, useEffect } from 'react';
import {jwtDecode} from 'jwt-decode';
import Cookies from 'js-cookie';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { BACKEND_URL } from '@/lib/constants';
import insertAuditTrail from '@/utills/insertAudit';

const ChangePassword = () => {
  const { toast } = useToast();
  const token = Cookies.get('token');
  const [formData, setFormData] = useState({
    userName: '',
    userId: '',
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

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
    // Retrieve and decode JWT token
    const token = Cookies.get('token');
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        setFormData(prevData => ({
          ...prevData,
          userName: decodedToken.user.User_Name,
          userId: decodedToken.user.User_ID,
        }));
      } catch (error) {
        console.error("Failed to decode token:", error);
      }
    }

    insertAuditTrail({
      AppType: "Web",
      Activity: "Change Password",
      Action: `Change Password Opened by ${getUserID()}`,
      NewData: "",
      OldData: "",
      Remarks: "",
      UserId: `${getUserID()}`,
      PlantCode: ""
    });
  }, []);

  const handleInputChange = (e: { target: { id: any; value: any; }; }) => {
    const { id, value } = e.target;
    setFormData(prevData => ({ ...prevData, [id]: value }));
  };

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    const { userName, userId, oldPassword, newPassword, confirmPassword } = formData;

    if (!userName || !userId || !oldPassword || !newPassword || !confirmPassword) {
      toast({ title: "Error", description: "Please fill mandatory fields marked as *", variant: "destructive" });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({ title: "Error", description: "New passwords do not match", variant: "destructive" });
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/change-password`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId,
          oldUserPassword: oldPassword,
          newUserPassword: newPassword
        }),
      });

      if (response.ok) {
        toast({ title: "Success", description: "Password changed successfully" });
        setFormData({
          userName: '',
          userId: '',
          oldPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        insertAuditTrail({
          AppType: "Web",
          Activity: "Change Password",
          Action: `Password Changed Successfully by ${getUserID()}`,
          NewData: `New Password: ${newPassword}`, 
          OldData: `Old Password: ${oldPassword}`,
          Remarks: "",
          UserId: `${formData.userId}`,
          PlantCode:''
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message;
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    }
  };

  const handleClear = () => {
    setFormData({
      userName: '',
      userId: '',
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  };

  return (
    <Card className="w-full mx-auto mt-5">
      <CardHeader>
        <CardTitle>Change Password <span className='font-normal text-sm text-muted-foreground'>(* Fields Are Mandatory)</span></CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="userName">User Name *</Label>
              <Input id="userName" value={formData.userName} disabled required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="userId">User ID *</Label>
              <Input id="userId" value={formData.userId} disabled required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="oldPassword">Old Password *</Label>
              <Input id="oldPassword" type="password" value={formData.oldPassword} onChange={handleInputChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password *</Label>
              <Input id="newPassword" type="password" value={formData.newPassword} onChange={handleInputChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <Input id="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleInputChange} required />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="submit">Change Password</Button>
            <Button type="button" variant="outline" onClick={handleClear}>Clear</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ChangePassword;
