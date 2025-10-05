"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GetGymPlans, CreateGymPlan } from "@/api/gym/route";
import { toast } from "sonner";

const mockPlans = [
	{ id: 1, name: "Basic Plan", price: "$20/month", description: "Access to gym equipment" },
	{ id: 2, name: "Premium Plan", price: "$50/month", description: "Includes personal trainer sessions" },
	{ id: 3, name: "Family Plan", price: "$80/month", description: "Access for up to 4 family members" },
];

export default function GymPlans() {
	const [plans, setPlans] = useState(mockPlans);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [form, setForm] = useState<{ id: number | null; name: string; price: string; description: string }>({
		id: null,
		name: "",
		price: "",
		description: "",
	});

	

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		
		if (form.id) {
			// Update existing plan (keep current mock behavior for now)
			setPlans((prev: typeof plans) => prev.map((plan) => (plan.id === form.id ? { ...form, id: form.id } : plan)));
			toast.success("Plan updated successfully!");
		} else {
			// Add new plan - call API
			try {
				const gymId = 1; // You'll need to get the actual gym ID from context/auth
				const planData = {
					title: form.name,
					price: parseFloat(form.price.replace('$', '').replace('/month', '')),
					description: form.description,
					duration: 30, // Default to 30 days, you can make this configurable
					gymid: gymId
				};

				const response = await CreateGymPlan(gymId, planData);
				
				if (response.data.success || response.data.message === "Gym plan created successfully") {
					// Add to local state
					setPlans((prev: typeof plans) => [...prev, { 
						...form, 
						id: Date.now(),
						price: `$${planData.price}/month`
					}]);
					
					toast.success("🎉 Plan created successfully! Email notifications have been sent.");
				} else {
					toast.error("Failed to create plan. Please try again.");
				}
			} catch (error) {
				console.error("Error creating plan:", error);
				toast.error("Failed to create plan. Please try again.");
			}
		}
		
		setForm({ id: null, name: "", price: "", description: "" });
		setIsDialogOpen(false);
	};

	const handleEdit = (plan: typeof plans[0]) => {
		setForm({ ...plan });
		setIsDialogOpen(true);
	};

	const handleDelete = (id: number) => {
		setPlans((prev: typeof plans) => prev.filter((plan) => plan.id !== id));
	};

	return (
		<div className="p-6 space-y-6">
			<div className="flex justify-between items-center">
				<h2 className="text-xl font-semibold">Gym Plans</h2>
				<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
					<DialogTrigger asChild>
						<Button>Add New Plan</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>{form.id ? "Edit Plan" : "Add New Plan"}</DialogTitle>
						</DialogHeader>
						<form onSubmit={handleSubmit} className="space-y-4">
							<Input
								placeholder="Plan Name"
								value={form.name}
								onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
								required
							/>
							<Input
								placeholder="Price"
								value={form.price}
								onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
								required
							/>
							<Input
								placeholder="Description"
								value={form.description}
								onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
								required
							/>
							<DialogFooter>
								<Button type="submit">{form.id ? "Update" : "Add"}</Button>
							</DialogFooter>
						</form>
					</DialogContent>
				</Dialog>
			</div>

			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Name</TableHead>
						<TableHead>Price</TableHead>
						<TableHead>Description</TableHead>
						<TableHead>Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{plans.map((plan) => (
						<TableRow key={plan.id}>
							<TableCell>{plan.name}</TableCell>
							<TableCell>{plan.price}</TableCell>
							<TableCell>{plan.description}</TableCell>
							<TableCell>
								<div className="flex space-x-2">
									<Button size="sm" onClick={() => handleEdit(plan)}>
										Edit
									</Button>
									<Button size="sm" variant="destructive" onClick={() => handleDelete(plan.id)}>
										Delete
									</Button>
								</div>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
