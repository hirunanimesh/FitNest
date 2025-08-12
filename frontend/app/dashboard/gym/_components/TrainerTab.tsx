import React from 'react'
import { useState,useEffect } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge";
import { Search } from 'lucide-react';

const mockProfiles = [
    { id: 1, name: "Vidura", role: "Trainer", email: "john@example.com" ,verified:true },
    { id: 2, name: "Hiruna", role: "Trainer", email: "jane@example.com",verified:true },
    { id: 3, name: "Sandali", role: "Trainer", email: "alice@example.com",verified:false },
  ];

const TrainerTab = () => {
    const [filteredProfiles, setFilteredProfiles] = useState(mockProfiles);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        setFilteredProfiles(
          mockProfiles.filter((profile) =>
            profile.name.toLowerCase().includes(searchQuery.toLowerCase())
          )
        );
    }, [searchQuery]);

  return (
    <div>
      <Card className='bg-gray-800 text-white'>
        <CardHeader>
            <CardTitle>Trainers Management</CardTitle>
            <CardDescription className='text-gray-300'>View and manage gym trainers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex flex-row gap-5'>
            <div className="flex items-center space-x-2 mb-4">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm text-gray-800"
              />
            </div>
            <div>
            <Select>
              <SelectTrigger className="w-[180px] text-gray-600">
                <SelectValue placeholder="Filter Trainers"/>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="my">My Trainers</SelectItem>
                <SelectItem value="other">Applications</SelectItem>
              </SelectContent>
            </Select>
            </div>
          </div>
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead className='text-gray-300'>Profile</TableHead>
                    <TableHead className='text-gray-300'>Name</TableHead>
                    <TableHead className='text-gray-300'>Email</TableHead>
                    <TableHead className='text-gray-300'>Status</TableHead>
                    <TableHead className='text-gray-300'>Specialization</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredProfiles
                      .filter((profile) => profile.role === "Trainer")
                      .map((profile) => (
                        <TableRow key={profile.id}>
                          <TableCell>
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                          </TableCell>
                          <TableCell className="font-medium">{profile.name}</TableCell>
                          <TableCell>{profile.email}</TableCell>
                          <TableCell>
                            {profile.verified ? <Badge variant="default" className='bg-green-400 '>Verified</Badge>
                            : <Badge variant="default">Not Verified</Badge>
                          }
                            
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className='text-white'>Personal Training</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                </TableBody>
            </Table>
        </CardContent>
    </Card>
    </div>
  )
}

export default TrainerTab
