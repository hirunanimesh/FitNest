import { GymPlanCreateProducer, GymPlanDeleteProducer, GymPlanPriceUpdateProducer } from "../kafka/Producer.js";
import { addgymplan, assigntrainerstoplan, deletegymplan, getallgymplans, getgymplanbygymid, getplanmembercount, getplantrainers, updategymplan, updateplantrainers,getOneDayGyms , getOtherGyms, getgymplanbyplanid, getgymplandetails, getcustomersnearGym } from "../services/plans.service.js";
import GymPlanEmailService from "../services/GymPlanEmailService.js";


export const addGymPlan = async (req, res) => {
    try {
        const gymPlan = await addgymplan(req.body);
        console.log("Created Gym Plan:", gymPlan);
        if (gymPlan) {
            res.status(200).json({ message: "Gym plan created successfully", gymPlan });
            await GymPlanCreateProducer(gymPlan.plan_id,gymPlan.title,gymPlan.price,gymPlan.duration);
            
            // Send email notifications
            try {
                const emailService = new GymPlanEmailService();
                
                // 1. Send email to gym owner
                const ownerDetails = await emailService.getGymOwnerDetails(gymPlan.gym_id);
                
                if (ownerDetails && ownerDetails.ownerEmail) {
                    console.log('Sending plan creation email to gym owner:', ownerDetails.ownerEmail);
                    await emailService.sendPlanCreationEmail(
                        ownerDetails.ownerEmail,
                        ownerDetails.ownerName,
                        ownerDetails.gymName,
                        gymPlan.title,
                        `$${gymPlan.price}`,
                        gymPlan.duration
                    );
                    console.log('✅ Plan creation email sent successfully to gym owner');
                } else {
                    console.log('❌ Gym owner details not found or missing email');
                }

                // 2. Send promotional emails to nearby customers
                console.log('📧 Starting promotional emails to nearby customers...');
                const nearbyCustomers = await getcustomersnearGym(gymPlan.gym_id);
                
                if (nearbyCustomers && nearbyCustomers.length > 0) {
                    console.log(`📬 Found ${nearbyCustomers.length} nearby customers, sending promotional emails...`);
                    
                    // Send promotional emails to all nearby customers
                    const promotionalEmailPromises = nearbyCustomers.map(async (customer) => {
                        try {
                            await emailService.sendPromotionalEmail(
                                customer.user_email,
                                customer.customer_name,
                                ownerDetails?.gymName || 'Our Gym',
                                gymPlan.title,
                                `$${gymPlan.price}`,
                                gymPlan.duration,
                                customer.distance_km
                            );
                            console.log(`✅ Promotional email sent to customer: ${customer.customer_name} (${customer.user_email})`);
                        } catch (customerEmailError) {
                            console.error(`❌ Failed to send promotional email to customer ${customer.customer_name}:`, customerEmailError);
                        }
                    });
                    
                    // Wait for all promotional emails to be sent
                    await Promise.allSettled(promotionalEmailPromises);
                    console.log('📧 Promotional email campaign completed');
                } else {
                    console.log('📭 No nearby customers found for promotional emails');
                }
            } catch (emailError) {
                console.error('❌ Failed to send emails:', emailError);
                // Don't fail the entire request if email fails
            }
        }
    } catch (error) {
        console.error("Error creating gym plan:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

export const getAllGymPlans = async (req, res) => {
    try {
        const gymPlans = await getallgymplans()
        if (gymPlans) {
            res.status(200).json({ message: "Gym plans retrieved successfully", gymPlans });
        } else {
            res.status(404).json({ message: "No gym plans found" });
        }
    } catch (error) {
        console.error("Error retrieving gym plans:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

export const getGymPlanByGymId = async (req, res) => {
    const { gymId } = req.params;
    try {
        const gymPlan = await getgymplanbygymid(gymId)
        if (gymPlan) {
            res.status(200).json({ message: "Gym plan retrieved successfully", gymPlan });
        } else {
            res.status(404).json({ message: "Gym plan not found" });
        }
    } catch (error) {
        console.error("Error retrieving gym plan:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

export const updateGymPlan = async (req, res) => {
    const { gymPlanId } = req.params;
    try {
        const oldPlan = await getgymplanbyplanid(gymPlanId);
        const updatedGymPlan = await updategymplan(gymPlanId, req.body);
        if (updatedGymPlan) {
            if(oldPlan.price !== updatedGymPlan.price){
                await GymPlanPriceUpdateProducer(gymPlanId,updatedGymPlan.price,updatedGymPlan.duration) 
                console.log("Price changed, send to kafka")
            }
            res.status(200).json({ message: "Gym plan updated successfully", updatedGymPlan });
        } else {
            res.status(404).json({ message: "Gym plan not found" });
        }
    } catch (error) {
        console.error("Error updating gym plan:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

export const deleteGymPlan = async (req, res) => {
    const { gymPlanId } = req.params;
    try {
        const deleteplan = await deletegymplan(gymPlanId);
        if(deleteplan){
            res.status(200).json({ message: "Gym plan deleted successfully" });
            await GymPlanDeleteProducer(gymPlanId)
        }else{
            res.status(404).json({ message: "Gym plan not found" });
        }

    } catch (error) {
        console.error("Error deleting gym plan:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

export const getMemberCountPerPlan = async (req, res) => {
    const {plan_id} = req.params;
    try{
        const count = await getplanmembercount(plan_id)
        if(count){
            res.status(200).json({ message: "Member count retrieved successfully", count });
        }else{
            res.status(404).json({ message: "Plan not found or no members" });
        }
    }catch(error){
        console.error("Error retrieving member count per plan:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

export const assignTrainersToPlan = async (req, res) => {
  try {
    console.log('🔄 Assigning trainers to plan:', { plan_id: req.body.plan_id, trainer_ids: req.body.trainer_ids });
    
    const { plan_id, trainer_ids } = req.body;
    const result = await assigntrainerstoplan(plan_id, trainer_ids);
    
    console.log('✅ Trainers assigned successfully:', result);
    
    res.status(200).json({ 
      message: "Trainers assigned to plan successfully", 
      data: result 
    });

    // Send email notifications to assigned trainers
    try {
      console.log('📧 Starting trainer email notifications...');
      const emailService = new GymPlanEmailService();
      
      // Get plan details
      console.log('📋 Fetching plan details for plan_id:', plan_id);
      const planDetails = await getgymplanbyplanid(plan_id);
      if (!planDetails) {
        console.error('❌ Plan not found for email notification');
        return;
      }
      console.log('📋 Plan details found:', planDetails);

      // Get gym details
      console.log('🏢 Fetching gym details for gym_id:', planDetails.gym_id);
      const ownerDetails = await emailService.getGymOwnerDetails(planDetails.gym_id);
      if (!ownerDetails) {
        console.error('❌ Gym details not found for email notification');
        return;
      }
      console.log('🏢 Gym details found:', ownerDetails);

      // Get trainer details
      console.log('👥 Fetching trainer details for IDs:', trainer_ids);
      const trainerDetails = await emailService.getTrainerDetails(trainer_ids);
      
      if (!trainerDetails || trainerDetails.length === 0) {
        console.log('❌ No trainer details found or no valid emails');
        return;
      }
      
      console.log(`📬 Sending emails to ${trainerDetails.length} trainers...`);
      
      // Send email to each trainer
      for (const trainer of trainerDetails) {
        try {
          console.log(`📧 Sending assignment email to: ${trainer.trainerName} (${trainer.trainerEmail})`);
          await emailService.sendTrainerAssignmentEmail(
            trainer.trainerEmail,
            trainer.trainerName,
            ownerDetails.gymName,
            planDetails.title,
            `$${planDetails.price}`,
            planDetails.duration
          );
          console.log(`✅ Assignment email sent successfully to trainer: ${trainer.trainerName}`);
        } catch (trainerEmailError) {
          console.error(`❌ Failed to send assignment email to trainer ${trainer.trainerName}:`, trainerEmailError);
        }
      }
      console.log('📧 Trainer email notifications completed');
    } catch (emailError) {
      console.error('❌ Failed to send trainer assignment emails:', emailError);
      // Don't fail the entire request if email fails
    }
  } catch (error) {
    console.error("Error assigning trainers to plan:", error);
    res.status(500).json({ 
      message: "Internal server error", 
      error: error.message 
    });
  }
};

export const getPlanTrainers = async (req, res) => {
  try {
    const { planId } = req.params;
    const trainers = await getplantrainers(planId);
    res.status(200).json({ 
      message: "Plan trainers retrieved successfully", 
      data: trainers 
    });
  } catch (error) {
    console.error("Error retrieving plan trainers:", error);
    res.status(500).json({ 
      message: "Internal server error", 
      error: error.message 
    });
  }
};

export const updatePlanTrainers = async (req, res) => {
  try {
    const { planId } = req.params;
    const { trainer_ids } = req.body;
    const result = await updateplantrainers(planId, trainer_ids);
    res.status(200).json({ 
      message: "Plan trainers updated successfully", 
      data: result 
    });
  } catch (error) {
    console.error("Error updating plan trainers:", error);
    res.status(500).json({ 
      message: "Internal server error", 
      error: error.message 
    });
  }
};

export const GetOneDayGyms = async (req, res) => {
    try {
        const gyms = await getOneDayGyms();
        res.status(200).json({ message: "One day gyms retrieved successfully", gyms });
    } catch (error) {
        console.error("Error retrieving one day gyms:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

//get gyms which are not providing one day plans
export const GetOtherGyms = async (req, res) => {
    try {
        const gyms = await getOtherGyms();
        res.status(200).json({ message: "Other gyms retrieved successfully", gyms });
    } catch (error) {
        console.error("Error retrieving other gyms:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

export const GetGymPlanDetails = async (req,res)=>{
    try{
        const planIds = req.body;
        console.log("Received plan IDs:", planIds.planIds.planIds);
        const planDetails = await getgymplandetails(planIds.planIds.planIds);
        if(planDetails){
            res.status(200).json({ message: "Gym plan details retrieved successfully", planDetails });
        }
        
    }catch(error){
        console.error("Error retrieving gym plan details:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

export const GetPlanDetailFromPlanId = async(req,res)=>{
    try{
        const {planId}=req.params;
        const planDetails = await getgymplanbyplanid(planId)
        if(planDetails){
            res.status(200).json({ message: "Gym plan details retrieved successfully", planDetails });
        }else{
            res.status(200).json({ message: "Plan not found", planDetails:null });
        }
    }catch(error){
        console.error("Error retrieving gym plan details:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}
