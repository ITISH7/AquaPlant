import { useState } from "react";
import { Plus, Edit, Clock } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertScheduleSchema, type Schedule, type InsertSchedule } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function ScheduleManager() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const { toast } = useToast();

  const { data: schedules = [], isLoading } = useQuery<Schedule[]>({
    queryKey: ['/api/schedules'],
  });

  const form = useForm<InsertSchedule>({
    resolver: zodResolver(insertScheduleSchema),
    defaultValues: {
      time: "07:00",
      frequency: "daily",
      duration: 30,
      active: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertSchedule) => apiRequest("POST", "/api/schedules", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/schedules'] });
      setIsModalOpen(false);
      form.reset();
      toast({ title: "Schedule created", description: "New watering schedule has been added." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create schedule.", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertSchedule> }) => 
      apiRequest("PUT", `/api/schedules/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/schedules'] });
      setIsModalOpen(false);
      setEditingSchedule(null);
      form.reset();
      toast({ title: "Schedule updated", description: "Watering schedule has been updated." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update schedule.", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/schedules/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/schedules'] });
      toast({ title: "Schedule deleted", description: "Watering schedule has been deleted." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete schedule.", variant: "destructive" });
    },
  });

  const onSubmit = (data: InsertSchedule) => {
    if (editingSchedule) {
      updateMutation.mutate({ id: editingSchedule.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    form.reset({
      time: schedule.time,
      frequency: schedule.frequency,
      duration: schedule.duration,
      active: schedule.active,
    });
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingSchedule(null);
    form.reset({
      time: "07:00",
      frequency: "daily",
      duration: 30,
      active: true,
    });
    setIsModalOpen(true);
  };

  const getNextWatering = () => {
    const activeSchedules = schedules.filter((s: Schedule) => s.active);
    if (activeSchedules.length === 0) return null;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    let nextSchedule: { schedule: Schedule; diff: number } | null = null;
    let minDiff = Infinity;

    activeSchedules.forEach((schedule: Schedule) => {
      const [hours, minutes] = schedule.time.split(':').map(Number);
      const scheduleTime = hours * 60 + minutes;
      
      let diff = scheduleTime - currentTime;
      if (diff < 0) diff += 24 * 60; // Next day
      
      if (diff < minDiff) {
        minDiff = diff;
        nextSchedule = { schedule, diff };
      }
    });

    if (!nextSchedule) return null;

    const nextDate = new Date(now);
    if (nextSchedule.diff >= 24 * 60 - currentTime) {
      nextDate.setDate(nextDate.getDate() + 1);
    }
    
    const [hours, minutes] = nextSchedule.schedule.time.split(':').map(Number);
    nextDate.setHours(hours, minutes, 0, 0);

    const hoursUntil = Math.floor(nextSchedule.diff / 60);
    const minutesUntil = nextSchedule.diff % 60;

    return {
      time: nextDate.toLocaleDateString() === now.toLocaleDateString() 
        ? `Today ${nextSchedule.schedule.time}` 
        : `Tomorrow ${nextSchedule.schedule.time}`,
      countdown: `in ${hoursUntil}h ${minutesUntil}m`
    };
  };

  const nextWatering = getNextWatering();

  return (
    <>
      {/* Watering Schedule */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Watering Schedule</h2>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" onClick={handleAdd}>
                <Plus size={16} className="mr-1" />
                Add
              </Button>
            </DialogTrigger>
            <DialogContent className="slide-in">
              <DialogHeader>
                <DialogTitle>
                  {editingSchedule ? 'Edit' : 'Add'} Watering Schedule
                </DialogTitle>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="frequency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Frequency</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="every2days">Every 2 days</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration (seconds)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min={5} 
                            max={300} 
                            {...field} 
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="active"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel>Active</FormLabel>
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex space-x-3 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => setIsModalOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1"
                      disabled={createMutation.isPending || updateMutation.isPending}
                    >
                      {editingSchedule ? 'Update' : 'Add'} Schedule
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
        
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-gray-300 rounded-full" />
                  <div className="space-y-1">
                    <div className="w-16 h-4 bg-gray-300 rounded" />
                    <div className="w-20 h-3 bg-gray-300 rounded" />
                  </div>
                </div>
                <div className="w-4 h-4 bg-gray-300 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {schedules.map((schedule: Schedule) => (
              <div 
                key={schedule.id} 
                className={`flex items-center justify-between p-3 bg-gray-50 rounded-lg ${!schedule.active ? 'opacity-60' : ''}`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${schedule.active ? 'bg-primary' : 'bg-gray-400'}`} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{schedule.time}</p>
                    <p className="text-xs text-gray-600 capitalize">
                      {schedule.frequency} • {schedule.active ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(schedule)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Edit size={12} />
                </Button>
              </div>
            ))}
            
            {schedules.length === 0 && (
              <p className="text-center text-gray-500 text-sm py-4">
                No watering schedules configured
              </p>
            )}
          </div>
        )}
      </div>

      {/* Next Watering */}
      {nextWatering && (
        <div className="bg-gradient-to-br from-primary to-primary/80 rounded-xl shadow-sm text-white p-6">
          <div className="flex items-center space-x-3 mb-3">
            <Clock size={16} className="text-white text-opacity-80" />
            <h3 className="font-semibold">Next Watering</h3>
          </div>
          <p className="text-2xl font-bold mb-1">{nextWatering.time}</p>
          <p className="text-white text-opacity-80 text-sm">{nextWatering.countdown}</p>
        </div>
      )}
    </>
  );
}
