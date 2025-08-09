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
    { id: 1, name: "John Doe", role: "Trainer", email: "john@example.com" },
    { id: 2, name: "Jane Smith", role: "Trainer", email: "jane@example.com" },
    { id: 3, name: "Alice Johnson", role: "Trainer", email: "alice@example.com" },
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
      <Card>
        <CardHeader>
            <CardTitle>Trainers Management</CardTitle>
            <CardDescription>View and manage gym trainers</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Profile</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Specialization</TableHead>
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
                            <Badge variant="default">Active</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">Personal Training</Badge>
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
