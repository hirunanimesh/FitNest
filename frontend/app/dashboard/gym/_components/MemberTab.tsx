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
import { Badge } from "@/components/ui/badge";
import { Search } from 'lucide-react';

const mockProfiles = [
    { id: 1, name: "John Doe", role: "Member", email: "john@example.com" },
    { id: 2, name: "Jane Smith", role: "Trainer", email: "jane@example.com" },
    { id: 3, name: "Alice Johnson", role: "Member", email: "alice@example.com" },
  ];

const MemberTab = () => {

    const [searchQuery, setSearchQuery] = useState("");
    const [filteredProfiles, setFilteredProfiles] = useState(mockProfiles);

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
                <CardTitle>Members Management</CardTitle>
                <CardDescription className='text-gray-300'>View and manage gym members</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center space-x-2 mb-4">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search members..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
                <Table>
                  <TableHeader>
                    <TableRow >
                      <TableHead className='text-gray-300'>Profile</TableHead>
                      <TableHead className='text-gray-300'>Name</TableHead>
                      <TableHead className='text-gray-300'>Email</TableHead>
                      <TableHead className='text-gray-300'>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProfiles
                      .filter((profile) => profile.role === "Member")
                      .map((profile) => (
                        <TableRow key={profile.id} >
                          <TableCell>
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                          </TableCell>
                          <TableCell className="font-medium">{profile.name}</TableCell>
                          <TableCell>{profile.email}</TableCell>
                          <TableCell>
                            <Badge variant="default">Active</Badge>
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

export default MemberTab
