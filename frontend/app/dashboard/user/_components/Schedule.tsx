import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

// Utility function to format date as YYYY-MM-DD
function formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
}

interface Task {
    id?: string | number;
    task_date: string;
    task: string;
    note: string;
    type?: string;
    customer_id?: number;
}

interface TaskForm {
    task_date: string;
    task: string;
    note: string;
    customer_id?: number;
}

const Schedule: React.FC = () => {
    const { user } = useAuth();
    const userId = user?.id ? Number(user.id) : undefined;
    const accessToken = user?.user_metadata?.accessToken;
    const refreshToken = user?.user_metadata?.refreshToken;
    const calendarId = user?.user_metadata?.calendar_id;

    const [tasks, setTasks] = useState<Task[]>([]);
    const [isTaskDialogOpen, setIsTaskDialogOpen] = useState<boolean>(false);
    const [date, setDate] = useState<Date | undefined>(new Date());

    const [taskForm, setTaskForm] = useState<TaskForm>({
        task_date: formatDate(new Date()),
        task: '',
        note: '',
        customer_id: userId
    });

    // Fetch tasks from Google Calendar via backend
    useEffect(() => {
  if (!user) return;
  async function loadGoogleCalendarTasks() {
    try {
      const res = await fetch('/api/auth/google-calendar/get-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessToken: accessToken ?? '',
          refreshToken: refreshToken ?? '',
          calendarId: calendarId ?? '',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      } else {
        console.error('Error fetching tasks:', await res.text());
      }
    } catch (err) {
      console.error('Failed to fetch Google Calendar tasks', err);
    }
  }
  loadGoogleCalendarTasks();
}, [user, accessToken, refreshToken, calendarId]);

    // When submitting, always use current user id and metadata
    const handleTaskSubmit = async (e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (!user) {
            console.error('No user found');
            return;
        }
        const newTask = {
            ...taskForm,
            customer_id: userId,
            accessToken: user?.user_metadata?.accessToken ?? '',
            refreshToken: user?.user_metadata?.refreshToken ?? '',
            calendarId: user?.user_metadata?.calendar_id ?? '',
        };
        try {
            const res = await fetch('/api/auth/google-calendar/add-task', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newTask),
            });
            if (res.ok) {
                const addedTask = await res.json();
                setTasks((prev) => [...prev, addedTask]);
                setTaskForm({
                    task_date: formatDate(new Date()),
                    task: '',
                    note: '',
                    customer_id: 1
                });
                setIsTaskDialogOpen(false);
            } else {
                console.error('Failed to add Google Calendar task');
            }
        } catch (err) {
            console.error('Error adding Google Calendar task', err);
        }
    };

    return (
        <div>
            {/* Your component JSX here */}
        </div>
    );
};

export default Schedule;