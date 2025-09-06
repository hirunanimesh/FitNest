import React from 'react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import AddTask from '@/app/dashboard/user/_components/AddTask'
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from 'lucide-react';
import { CalendarIcon } from 'lucide-react';

import { format } from 'date-fns';
import { Calendar as CalendarUI } from "@/components/ui/calendar";

interface Task {
    id: number;
    task_date: string;
    task: string;
    note: string;
    type: 'workout' | 'appointment' | 'rest';
    customer_id: number;
}

const Calendar: React.FC = () => {
    const [isTaskDialogOpen, setIsTaskDialogOpen] = useState<boolean>(false);
    const [date, setDate] = useState<Date | undefined>(new Date());

    const formatDate = (date: Date): string => {
        return date.toISOString().split('T')[0];
    };

    const formatDisplayDate = (dateStr: string): string => {
        const date = new Date(dateStr);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[date.getMonth()]} ${date.getDate()}`;
    };

    const [tasks, setTasks] = useState<Task[]>([
        { id: 1, task_date: formatDate(new Date()), task: "Morning workout", note: "HIIT session", type: "workout", customer_id: 1 },
        { id: 2, task_date: formatDate(new Date()), task: "Nutrition consultation", note: "Diet planning", type: "appointment", customer_id: 1 },
        { id: 3, task_date: formatDate(new Date()), task: "Rest day", note: "Recovery", type: "rest", customer_id: 1 },
        { id: 4, task_date: formatDate(new Date()), task: "Cardio session", note: "30 min run", type: "workout", customer_id: 1 },
        { id: 5, task_date: formatDate(new Date()), task: "Meal prep", note: "Weekly preparation", type: "appointment", customer_id: 1 }
    ]);

    // Task creation is handled by the shared AddTask component; trainer keeps local tasks state

    return (
        <div className="min-h-screen p-4 bg-gray-800 rounded-lg">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-white mb-8">Fitness Schedule</h1>
                
                {/* Responsive Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* Left Side - Calendar */}
                    <Card className="h-fit bg-gray-900">
                        <CardHeader>
                            <CardTitle className="flex items-center text-white">
                                <CalendarIcon className="mr-2 h-5 w-5 text-white " />
                                Calendar
                            </CardTitle>
                            <CardDescription className='text-gray-300'>Select dates and view your schedule</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <CalendarUI
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                className="rounded-md  w-full bg-transparent text-white "
                            />
                            
                            {/* Legend */}
                            <div className="mt-6 space-y-3">
                                <h4 className="text-sm font-medium text-gray-700">Activity Types</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                    <div className="flex items-center space-x-2 text-sm">
                                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                        <span className="text-muted-foreground">Workouts</span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-sm">
                                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                        <span className="text-muted-foreground">Appointments</span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-sm">
                                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                        <span className="text-muted-foreground">Rest Days</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Right Side - Task Management */}
                    <div className="space-y-6">
                        
                        {/* Add Task Section */}
                        <Card className='bg-gray-900 text-white'>
                            <CardHeader>
                                <CardTitle>Task Management</CardTitle>
                                <CardDescription className='text-gray-300'>Add and manage your fitness tasks</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <AddTask
                                    isTaskDialogOpen={isTaskDialogOpen}
                                    setIsTaskDialogOpen={setIsTaskDialogOpen}
                                    viewingEvent={null}
                                    setViewingEvent={() => { /* trainer view/edit not wired */ }}
                                    editingEvent={null}
                                    setEditingEvent={() => { /* trainer view/edit not wired */ }}
                                    setEvents={setTasks as any}
                                />
                            </CardContent>
                        </Card>

                        {/* Task List */}
                        <Card className='bg-gray-900 text-white'>
                            <CardHeader>
                                <CardTitle>Recent Tasks</CardTitle>
                                <CardDescription className='text-gray-300'>Your upcoming and recent activities</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {tasks.map((task) => (
                                        <div key={task.id} className="flex items-start gap-3 p-3 rounded-lg  bg-transparent text-white shadow-sm hover:shadow-md transition-shadow">
                                            <div className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 ${
                                                task.type === 'workout' ? 'bg-red-500' : 
                                                task.type === 'appointment' ? 'bg-blue-500' : 'bg-green-500'
                                            }`}></div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-white truncate">{task.task}</p>
                                                        <p className="text-xs text-gray-500 mt-1">{task.note}</p>
                                                    </div>
                                                    <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
                                                        {formatDisplayDate(task.task_date)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                
                                {tasks.length === 0 && (
                                    <div className="text-center py-8 text-gray-500">
                                        <p>No tasks scheduled yet</p>
                                        <p className="text-sm">Click "Add New Task" to get started</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Calendar;