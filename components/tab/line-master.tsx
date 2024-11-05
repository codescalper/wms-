"use client";
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import CustomDropdown from '../CustomDropdown';
import { BACKEND_URL } from '@/lib/constants';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';
import { toast as sooner } from "sonner";
import insertAuditTrail from '@/utills/insertAudit';
import { delay } from '@/utills/delay';
import { getUserPlant } from '@/utills/getFromSession';

interface PlantOption {
  value: string;
  label: string;
}

interface LineData {
  Plant: string;
  LineCode: string;
  LineDesc: string;
  LineIP: string;
}

interface Line extends LineData {
  LID: number;
  CreatedBy: string;
  CreatedOn: string;
  UpdatedBy: string | null;
  UpdatedOn: string | null;
}

const LineMaster: React.FC = () => {
  const { toast } = useToast();
  const [plantOptions, setPlantOptions] = useState<PlantOption[]>([]);
  const [formData, setFormData] = useState<LineData>({
    Plant: "",
    LineCode: "",
    LineDesc: "",
    LineIP: "",
  });
  const [lines, setLines] = useState<Line[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const token = Cookies.get('token');
  useEffect(() => {
    const fetchDataSequentially = async () => {
      await delay(20);
      fetchPlantNames();
      await delay(50);
      fetchLines();
      await delay(50);
      // await   insertAuditTrail({
      //   AppType: "Web",
      //   Activity: "Line Master",
      //   Action: `Line Master Opened by ${getUserID()}`,
      //   NewData: "",
      //   OldData: "",
      //   Remarks: "",
      //   UserId: getUserID(),
      //   PlantCode: getUserPlant()
      // });
    };
    fetchDataSequentially();
  }, []);


  const fetchPlantNames = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/master/get-all-plant-code`, {
        headers: {
          'authorization': `Bearer ${token}`
        }
      });
      const data: { PlantCode: string }[] = await response.json();
      setPlantOptions(data.map(item => ({ value: item.PlantCode, label: item.PlantCode })));
    } catch (error) {
      console.error('Error fetching plant names:', error);
      toast({ title: "Error", description: "Failed to fetch plant names", variant: "destructive" });
    }
  };

  const fetchLines = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/master/get-all-line`, {
        headers: {
          'authorization': `Bearer ${token}`
        }
      });
      const data: Line[] = await response.json();
      setLines(data);
    } catch (error) {
      console.error('Error fetching lines:', error);
      toast({ title: "Error", description: "Failed to fetch lines", variant: "destructive" });
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
    return '';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePlantChange = (value: string) => {
    setFormData(prev => ({ ...prev, Plant: value }));
  };

  const handleSave = async () => {
    if (!formData.Plant || !formData.LineIP || !formData.LineCode) {
      sooner(`Please fill mandatory fields marked as *`);
      return;
    }
    try {
      const response = await fetch(`${BACKEND_URL}/api/master/insert-line`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          plant: formData.Plant,
          lineCode: formData.LineCode,
          lineDesc: formData.LineDesc,
          lineIP: formData.LineIP,
          user: getUserID() // Include User_ID from JWT token
        }),
      });
      if (response.ok) {
        toast({ title: "Success", description: "Line saved successfully" });
        fetchLines();
        resetForm();

        // Insert audit trail for save action
        // insertAuditTrail({
        //   AppType: "Web",
        //   Activity: "Line Master",
        //   Action: `New Line Added by ${getUserID()}`,
        //   NewData: JSON.stringify(formData),
        //   OldData: "",
        //   Remarks: "",
        //   UserId: getUserID(),
        //   PlantCode: formData.Plant
        // });
      } else {
        toast({ title: "Error", description: "Failed to save line", variant: "destructive" });
      }
    } catch (error) {
      console.error('Error saving line:', error);
      toast({ title: "Error", description: "Failed to save line", variant: "destructive" });
    }
  };

  const handleUpdate = async () => {
    if (editingId === null) return;
    try {
      const response = await fetch(`${BACKEND_URL}/api/master/update-line`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          plant: formData.Plant,
          lineCode: formData.LineCode,
          lineDesc: formData.LineDesc,
          lineIP: formData.LineIP,
          user: getUserID(), // Include User_ID from JWT token
          id: editingId
        }),
      });
      if (response.ok) {
        toast({ title: "Success", description: "Line updated successfully" });
        fetchLines();
        resetForm();

        // Prepare audit data
        const changedFields: string[] = [];
        const oldLine = lines.find(line => line.LID === editingId);
        if (oldLine) {
          if (oldLine.LineCode !== formData.LineCode) changedFields.push(`Line Code: ${oldLine.LineCode} -> ${formData.LineCode}`);
          if (oldLine.LineDesc !== formData.LineDesc) changedFields.push(`Line Desc: ${oldLine.LineDesc} -> ${formData.LineDesc}`);
          if (oldLine.LineIP !== formData.LineIP) changedFields.push(`Line IP: ${oldLine.LineIP} -> ${formData.LineIP}`);
          if (oldLine.Plant !== formData.Plant) changedFields.push(`Plant: ${oldLine.Plant} -> ${formData.Plant}`);
        }

        // Insert audit trail for update action
        // insertAuditTrail({
        //   AppType: "Web",
        //   Activity: "Line Master",
        //   Action: `Line Updated by ${getUserID()}`,
        //   NewData: changedFields.join(", "),
        //   OldData: JSON.stringify(oldLine),
        //   Remarks: "",
        //   UserId: getUserID(),
        //   PlantCode: formData.Plant
        // });
      } else {
        toast({ title: "Error", description: "Failed to update line", variant: "destructive" });
      }
    } catch (error) {
      console.error('Error updating line:', error);
      toast({ title: "Error", description: "Failed to update line", variant: "destructive" });
    }
  };

  const handleEdit = (line: Line) => {
    setFormData({
      Plant: line.Plant,
      LineCode: line.LineCode,
      LineDesc: line.LineDesc,
      LineIP: line.LineIP,
    });
    setIsEditing(true);
    setEditingId(line.LID);

    // Insert audit trail for edit action
    // insertAuditTrail({
    //   AppType: "Web",
    //   Activity: "Line Master",
    //   Action: `Line Edit Initiated by ${getUserID()}`,
    //   NewData: "",
    //   OldData: JSON.stringify(line),
    //   Remarks: "",
    //   UserId: getUserID(),
    //   PlantCode: ""
    // });
  };

  const resetForm = () => {
    setFormData({ Plant: "", LineCode: "", LineDesc: "", LineIP: "" });
    setIsEditing(false);
    setEditingId(null);
  };

  return (
    <>
      <Card className="w-full mx-auto mt-5">
        <CardHeader>
          <CardTitle>Line Master <span className='font-normal text-sm text-muted-foreground'>(* Fields Are Mandatory)</span></CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="plant">Plant Code *</Label>
                <CustomDropdown
                  options={plantOptions}
                  value={formData.Plant}
                  onValueChange={handlePlantChange}
                  placeholder="Select plant..."
                  searchPlaceholder="Search plant..."
                  emptyText="No plant found."
                  disabled={isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lineCode">Line Code *</Label>
                <Input 
                  id="lineCode" 
                  name="LineCode"
                  value={formData.LineCode}
                  onChange={handleInputChange}
                  required 
                  disabled={isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lineDesc">Line Desc</Label>
                <Input 
                  id="lineDesc" 
                  name="LineDesc"
                  value={formData.LineDesc}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lineIP">Line IP *</Label>
                <Input 
                  id="lineIP" 
                  name="LineIP"
                  value={formData.LineIP}
                  onChange={handleInputChange}
                  required 
                />
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
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Select</TableHead>
                <TableHead>Plant Name</TableHead>
                <TableHead>Line Code</TableHead>
                <TableHead>Line Description</TableHead>
                <TableHead>Line IP</TableHead>
                <TableHead>Created by</TableHead>
                <TableHead>Created on</TableHead>
                <TableHead>Updated by</TableHead>
                <TableHead>Updated on</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lines.map((line) => (
                <TableRow key={line.LID}>
                  <TableCell>
                    <Button variant={'ghost'} onClick={() => handleEdit(line)}>Select</Button>
                  </TableCell>
                  <TableCell>{line.Plant}</TableCell>
                  <TableCell>{line.LineCode}</TableCell>
                  <TableCell>{line.LineDesc}</TableCell>
                  <TableCell>{line.LineIP}</TableCell>
                  <TableCell>{line.CreatedBy}</TableCell>
                  <TableCell>{new Date(line.CreatedOn).toLocaleDateString()}</TableCell>
                  <TableCell>{line.UpdatedBy}</TableCell>
                  <TableCell>{line.UpdatedOn ? new Date(line.UpdatedOn).toLocaleDateString() : ""}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
};

export default LineMaster;
