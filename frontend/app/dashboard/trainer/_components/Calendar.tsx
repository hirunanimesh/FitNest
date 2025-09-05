import React from 'react';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from 'lucide-react';
import { CalendarIcon } from 'lucide-react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { supabase } from "@/lib/supabase";
import axios from 'axios';

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

interface TaskForm {
    task_date: string;
    task: string;
    note: string;
    customer_id: number;
}

const Calendar: React.FC = () => {
    const [isTaskDialogOpen, setIsTaskDialogOpen] = useState<boolean>(false);
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [events, setEvents] = useState<any[]>([]);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserId(user.id);
                fetchCalendarEvents(user.id);
            }
        };
        getUser();
    }, []);

    const fetchCalendarEvents = async (id: string) => {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/userservice/calendar/events/${id}`);
            const googleEvents = response.data.map((event: any) => ({
                id: event.id,
                title: event.summary,
                start: event.start.dateTime || event.start.date,
                end: event.end.dateTime || event.end.date,
                backgroundColor: '#34a853'
            }));
            setEvents(googleEvents);
        } catch (error) {
            console.error('Error fetching calendar events:', error);
        }
    };

    const createCalendarEvent = async (eventData: any) => {
        if (!userId) return;
        try {
            await axios.post(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/userservice/calendar/event/${userId}`, eventData);
            fetchCalendarEvents(userId);
        } catch (error) {
            console.error('Error creating calendar event:', error);
        }
    };

    const connectGoogleCalendar = async () => {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                scopes: 'email profile https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events'
            }
        });
        if (error) console.error('Error connecting to Google:', error);
    };

    const formatDate = (date: Date): string => {
        return date.toISOString().split('T')[0];
    };

    const formatDisplayDate = (dateStr: string): string => {
        const date = new Date(dateStr);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[date.getMonth()]} ${date.getDate()}`;
    };

    const [taskForm, setTaskForm] = useState<TaskForm>({
        task_date: formatDate(new Date()),
        task: "",
        note: "",
        customer_id: 1
    });

    const [tasks, setTasks] = useState<Task[]>([
        { id: 1, task_date: formatDate(new Date()), task: "Morning workout", note: "HIIT session", type: "workout", customer_id: 1 },
        { id: 2, task_date: formatDate(new Date()), task: "Nutrition consultation", note: "Diet planning", type: "appointment", customer_id: 1 },
        { id: 3, task_date: formatDate(new Date()), task: "Rest day", note: "Recovery", type: "rest", customer_id: 1 },
        { id: 4, task_date: formatDate(new Date()), task: "Cardio session", note: "30 min run", type: "workout", customer_id: 1 },
        { id: 5, task_date: formatDate(new Date()), task: "Meal prep", note: "Weekly preparation", type: "appointment", customer_id: 1 }
    ]);

    const handleTaskSubmit = (e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (taskForm.task && taskForm.task_date && userId) {
            const eventData = {
                summary: taskForm.task,
                description: taskForm.note,
                start: taskForm.task_date,
                end: taskForm.task_date
            };
            createCalendarEvent(eventData);
            setTaskForm({
                task_date: formatDate(new Date()),
                task: "",
                note: "",
                customer_id: 1
            });
            setIsTaskDialogOpen(false);
        }
    };

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
                            <Button onClick={connectGoogleCalendar} className="mb-4 bg-blue-500 text-white">
                                Connect Google Calendar
                            </Button>
                            <FullCalendar
                                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                                initialView="dayGridMonth"
                                events={events}
                                height="auto"
                                headerToolbar={{
                                    left: 'prev,next today',
                                    center: 'title',
                                    right: 'dayGridMonth,timeGridWeek,timeGridDay'
                                }}
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
                                <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button className="w-full" size="lg">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add New Task
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[500px]">
                                        <DialogHeader>
                                            <DialogTitle>Add New Task</DialogTitle>
                                            <DialogDescription>
                                                Create a new task for your fitness schedule.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <form onSubmit={handleTaskSubmit}>
                                            <div className="grid gap-4 py-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="task_date">Date</Label>
                                                    <Input
                                                        id="task_date"
                                                        type="date"
                                                        value={taskForm.task_date}
                                                        onChange={(e) => setTaskForm(prev => ({ ...prev, task_date: e.target.value }))}
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="task">Task Title</Label>
                                                    <Input
                                                        id="task"
                                                        value={taskForm.task}
                                                        onChange={(e) => setTaskForm(prev => ({ ...prev, task: e.target.value }))}
                                                        placeholder="Enter task title"
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="note">Notes</Label>
                                                    <Textarea
                                                        id="note"
                                                        value={taskForm.note}
                                                        onChange={(e) => setTaskForm(prev => ({ ...prev, note: e.target.value }))}
                                                        placeholder="Add additional notes or details"
                                                        rows={3}
                                                    />
                                                </div>
                                            </div>
                                            <DialogFooter>
                                                <Button type="button" variant="outline" onClick={() => setIsTaskDialogOpen(false)} formNoValidate>
                                                    Cancel
                                                </Button>
                                                <Button type="button" onClick={handleTaskSubmit}>Add Task</Button>
                                            </DialogFooter>
                                            </form>
                                    </DialogContent>
                                </Dialog>
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