const { supabase } = require("../superbaseClient");
class AuthModel {
  //create a new user with email, password and role
  static async createUser(email, password, role) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { role },
          emailRedirectTo: `${process.env.FRONTEND_URL || 'http://localhost:3001'}/auth/confirm`
        },
      });
      if (error) {
        console.error("Supabase auth error:", error);
        throw error;
      }
      console.log("User signup result:", data);
      return data;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }
  // Login user with email and password common for all users
  static async loginUser(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error logging in user:", error);
      throw error;
    }
  }

  // Get user info from token
  static async getUserFromToken(token) {
    try {
      const { data, error } = await supabase.auth.getUser(token);
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error getting user from token:", error);
      throw error;
    }
  }

  // Complete OAuth customer profile
  static async completeOAuthCustomerProfile(
    user_id,
    firstName,
    lastName,
    address,
    phoneNo,
    profileImg,
    gender,
    birthday,
    weight,
    height,
    location,
    userRole
  ) {
    try {
      
        const { data, error } = await supabase.auth.admin.updateUserById(
          user_id,
          {
            user_metadata: {
              role: userRole,
            },
          }
        );

        if (error) {
          console.error("Error updating user metadata:", error);
          return;
        }

        console.log("User metadata updated:", data);

    } catch (error) {
      console.error("Error updating user metadata:", error);
      throw error;
    }

    try {
      // Check if customer already exists
      const { data: existingCustomer, error: checkError } = await supabase
        .from("customer")
        .select("*")
        .eq("user_id", user_id)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        // PGRST116 = not found
        console.error("Error checking existing customer:", checkError);
        throw checkError;
      }

      if (existingCustomer) {
        return {
          success: false,
          alreadyExists: true,
          message: "Customer profile already exists for this user",
          customer: existingCustomer
        };
      }

      // Prepare the insert data
      const insertData = {
        user_id: user_id,
        first_name: firstName,
        last_name: lastName,
        address: address,
        phone_no: phoneNo,
        profile_img: profileImg,
        gender: gender,
        birthday: birthday,
        location: location,
      };

      console.log(
        "OAuth profile data to insert:",
        JSON.stringify(insertData, null, 2)
      );

      // Insert customer data into customers table
      const { data: customerdata, error: insertError } = await supabase
        .from("customer")
        .insert([insertData])
        .select();

      if (insertError) {
        console.error("Database insertion error details:");
        console.error("Error message:", insertError.message);
        console.error("Error code:", insertError.code);
        console.error("Error details:", insertError.details);
        console.error("Error hint:", insertError.hint);
        console.error(
          "Full error object:",
          JSON.stringify(insertError, null, 2)
        );
        throw insertError;
      }

      console.log("OAuth customer data inserted successfully:", customerdata);
      const customer_id = customerdata[0].id;

      const insertPhysicalData = {
        customer_id: customer_id,
        height: height ? parseFloat(height) : null,
        weight: weight ? parseFloat(weight) : null,
      };
      console.log("physical data", insertPhysicalData);

      // Insert physical data if provided
      if (weight || height) {
        const { data: physicalData, error: physicalError } = await supabase
          .from("customer_progress")
          .insert([
            insertPhysicalData,
          ]);

        if (physicalError) {
          console.error("Physical data insertion error:", physicalError);
        } else {
          console.log("Physical data inserted successfully:", physicalData);
        }
      }

      return customerdata[0];
    } catch (error) {
      console.error("Error completing OAuth customer profile:", error);
      throw error;
    }
  }

  // Complete OAuth trainer profile
  static async completeOAuthTrainerProfile(
    user_id,
    nameWithInitials,
    contactNo,
    bio,
    skills,
    experience,
    profileImage,
    documents,
    userRole
  ) {
    try {
      console.log("=== OAuth Trainer Profile Debug ===");
      console.log("user_id:", user_id);
      console.log("user_id type:", typeof user_id);
      console.log("user_id length:", user_id ? user_id.length : 'N/A');
      
      // Validate user_id
      if (!user_id) {
        throw new Error("user_id is required but was not provided");
      }

      // Check if user_id is a valid UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(user_id)) {
        throw new Error(`Invalid user_id format: ${user_id}. Expected UUID format.`);
      }

      console.log("user_id validation passed");

      console.log("About to call supabase.auth.admin.updateUserById with:");
      console.log("- user_id:", user_id);
      console.log("- user_id type:", typeof user_id);
      console.log("- userRole:", userRole);

      // Ensure user_id is a string and trim any whitespace
      const cleanUserId = String(user_id).trim();
      console.log("- cleanUserId:", cleanUserId);
      console.log("- cleanUserId length:", cleanUserId.length);

      // Update user metadata with trainer role
      const { data, error } = await supabase.auth.admin.updateUserById(
        cleanUserId,
        {
          user_metadata: {
            role: userRole,
          },
        }
      );

      if (error) {
        console.error("Error updating user metadata:", error);
        throw error;
      }

      console.log("User metadata updated:", data);

      // Check if trainer already exists
      const { data: existingTrainer, error: checkError } = await supabase
        .from("trainer")
        .select("*")
        .eq("user_id", user_id)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        // PGRST116 = not found
        console.error("Error checking existing trainer:", checkError);
        throw checkError;
      }

      if (existingTrainer) {
        return {
          success: false,
          alreadyExists: true,
          message: "Trainer profile already exists for this user",
          trainer: existingTrainer
        };
      }

      // Prepare the insert data
      const insertData = {
        user_id: user_id,
        trainer_name: nameWithInitials,
        bio: bio,
        contact_no: contactNo,
        profile_img: profileImage,
        skills: skills,
        years_of_experience: experience ? parseInt(experience) : 0,
        verified: false,
        documents: documents,
      };

      console.log(
        "OAuth trainer profile data to insert:",
        JSON.stringify(insertData, null, 2)
      );

      // Insert trainer data into trainer table
      const { data: trainerData, error: insertError } = await supabase
        .from("trainer")
        .insert([insertData])
        .select();

      if (insertError) {
        console.error("Database insertion error details:");
        console.error("Error message:", insertError.message);
        console.error("Error code:", insertError.code);
        console.error("Error details:", insertError.details);
        console.error("Error hint:", insertError.hint);
        console.error(
          "Full error object:",
          JSON.stringify(insertError, null, 2)
        );
        throw insertError;
      }

      console.log("OAuth trainer data inserted successfully:", trainerData);
      return trainerData[0];
    } catch (error) {
      console.error("Error completing OAuth trainer profile:", error);
      throw error;
    }
  }

  static async customerRegister(
    email,
    password,
    role,
    firstName,
    LastName,
    address,
    phoneNo,
    profileImg,
    gender,
    birthday,
    weight,
    height,
    location
  ) {
    try {
      // Create user and get the data object
      const userData = await AuthModel.createUser(email, password, role);

      if (!userData || !userData.user) {
        throw new Error("User not returned from signUp");
      }

      const userId = userData.user.id;

      // Prepare the insert data
      const insertData = {
        user_id: userId,
        first_name: firstName,
        last_name: LastName,
        address: address,
        phone_no: phoneNo,
        profile_img: profileImg, // This will now be the Cloudinary URL
        gender: gender,
        birthday: birthday,
        // weight: weight ? parseInt(weight) : null,
        // height: height ? parseInt(height) : null,
        location: location, // This is now a JSON object for JSONB field
      };
      console.log("Data to insert:", JSON.stringify(insertData, null, 2));

      // Insert customer data into customers table
      const { data: customerdata, error: insertError } = await supabase
        .from("customer")
        .insert([insertData])
        .select(); // Add .select() to return the inserted data

      if (insertError) {
        console.error("Database insertion error details:");
        console.error("Error message:", insertError.message);
        console.error("Error code:", insertError.code);
        console.error("Error details:", insertError.details);
        console.error("Error hint:", insertError.hint);
        console.error(
          "Full error object:",
          JSON.stringify(insertError, null, 2)
        );
        throw insertError;
      }

      console.log("Customer data inserted successfully:", customerdata);
      const customer_id = customerdata[0].customer_id; // Get the ID of the inserted customer
      console.log("Inserted customer ID:", customer_id);

      const { data: physicalData, error: physicalError } = await supabase
        .from("customer_progress")
        .insert([
          {
            customer_id: customer_id,
            height: height ? parseFloat(height) : null,
            weight: weight ? parseFloat(weight) : null,
            // Map other physical data fields here
          },
        ]);

      if (physicalError) {
        console.error("Physical data insertion error:", physicalError);
      }
      console.log("Physical data inserted successfully:", physicalData);

      // Return both user and customer data
      return {
        user: userData.user,
        session: userData.session,
        customer: customerdata[0], // Return the first (and only) inserted record
      };
    } catch (error) {
      console.error("Error registering customer:", error);
      throw error;
    }
  }

  static async GymRegister(
    email,
    password,
    gym_name,
    address,
    location,
    phone_no,
    profile_img,
    description,
    verified,
    documents
  ) {
    const role = "gym";
    try {
      const userData = await AuthModel.createUser(email, password, role);
      if (!userData || !userData.user) {
        throw new Error("User not returned from signUp");
      }
      const insertData = {
        user_id: userData.user.id,
        address: address,
        contact_no: phone_no,
        gym_name: gym_name,
        profile_img: profile_img,
        location: location,
        verified: verified,
        documents: documents,
        description: description,
      };

      console.log("Data to insert:", JSON.stringify(insertData, null, 2));

      const { data: gym_data, error: insertError } = await supabase
        .from("gym")
        .insert([insertData])
        .select();
      if (insertError) {
        console.error("Database insertion error details:");
        console.error("Error message:", insertError.message);
        console.error("Error code:", insertError.code);
        console.error("Error details:", insertError.details);
        console.error("Error hint:", insertError.hint);
        console.error(
          "Full error object:",
          JSON.stringify(insertError, null, 2)
        );
        throw insertError;
      }
      console.log("Gym data inserted successfully:", gym_data);
      return {
        user: userData.user,
        session: userData.session,
        gym: gym_data[0], // Return the first (and only) inserted record
      };
    } catch (error) {
      console.error("Error registering gym:", error);
      throw error;
    }
  }

  static async TrainerRegister(
    nameWithInitials,
     email,
      bio,
      password,
      contactNo,
      profileImage,
      skills,
      experience,
      documents,
      role
  ) {
    try {
      const userRole = "trainer";
      const userData = await AuthModel.createUser(email, password, userRole);
      
      if (!userData || !userData.user) {
        throw new Error("User not returned from signUp");
      }

      // Check if email confirmation is required
      if (!userData.user.email_confirmed_at && userData.user.confirmation_sent_at) {
        // Email confirmation is required - return early with confirmation message
        return {
          user: userData.user,
          session: userData.session,
          requiresConfirmation: true,
          message: "Please check your email and confirm your account before completing registration"
        };
      }

      const insertData = {
        user_id: userData.user.id,
        bio: bio,
        contact_no: contactNo,
        trainer_name: nameWithInitials,
        profile_img: profileImage,
        skills: skills,
        years_of_experience: experience,
        verified: false,
        documents: documents,
      };

      console.log("Data to insert:", JSON.stringify(insertData, null, 2));

      const { data: trainer_data, error: insertError } = await supabase
        .from("trainer")
        .insert([insertData])
        .select();
      if (insertError) {
        console.error("Database insertion error details:");
        console.error("Error message:", insertError.message);
        console.error("Error code:", insertError.code);
        console.error("Error details:", insertError.details);
        console.error("Error hint:", insertError.hint);
        console.error(
          "Full error object:",
          JSON.stringify(insertError, null, 2)
        );
        throw insertError;
      }
      console.log("Trainer data inserted successfully:", trainer_data);
      return {
        user: userData.user,
        session: userData.session,
        trainer: trainer_data[0], // Return the first (and only) inserted record
      };
    } catch (error) {
      console.error("Error registering trainer:", error);
      throw error;
    }
  }
}

module.exports = AuthModel;
