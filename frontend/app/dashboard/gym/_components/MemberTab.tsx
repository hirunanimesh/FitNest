import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { useGym } from '../context/GymContext';
import { GetAllGymCustomers, GetGymCustomerIds, GetGymPlans } from '@/api/gym/route';

const MemberTab = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { gymId } = useGym();

  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true);
      try {
        const gymPlans = await GetGymPlans(gymId);
        const customerIds = await GetGymCustomerIds(gymPlans.data.gymPlan);
        const customers = await GetAllGymCustomers(customerIds.data.customerIds);
        console.log("Fetched Customers:", customers.data.customers);
        setMembers(customers.data.customers || []);
      } catch (error) {
        console.error("Error fetching members:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, [gymId]);

  const filteredMembers = members.filter((member) =>
    `${member.first_name} ${member.last_name}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`${!loading ? 'animate-fade-in' : ''}`}>
      <Card className='bg-gray-800 text-white'>
        <CardHeader>
          <CardTitle>Members Management</CardTitle>
          <CardDescription className='text-gray-300'>
            View and manage gym members
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Search className="h-4 w-4" />
            <Input
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm text-gray-800"
            />
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-red-500"></div>
            </div>
          ) : filteredMembers.length === 0 ? (
            <p className="text-gray-300 text-center mt-4">No members found</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className='text-gray-300'>Profile</TableHead>
                  <TableHead className='text-gray-300'>Name</TableHead>
                  <TableHead className='text-gray-300'>Phone</TableHead>
                  <TableHead className='text-gray-300'>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.map((member) => {
                  const fullName = `${member.first_name} ${member.last_name}`;
                  return (
                    <TableRow key={member.id}>
                      <TableCell>
                        <Avatar className="h-8 w-8">
                          {member.profile_img ? (
                            <AvatarImage src={member.profile_img} alt={fullName} />
                          ) : (
                            <AvatarFallback>
                              {member.first_name?.charAt(0) || "U"}
                            </AvatarFallback>
                          )}
                        </Avatar>
                      </TableCell>
                      <TableCell className="font-medium">{fullName}</TableCell>
                      <TableCell>{member.phone_no || member.mobile || "N/A"}</TableCell>
                      <TableCell>
                        <Badge variant="default">Active</Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MemberTab;
