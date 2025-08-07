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
        },
      });
      if (error) throw error;
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

      const {data: physicalData, error: physicalError} = await supabase
      .from("customer_progress")
      .insert([{
        customer_id: customer_id,
        height: height ? parseFloat(height) : null,
        weight: weight ? parseFloat(weight) : null,
        // Map other physical data fields here
      }]);

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
    email,
    password,
    bio,
    contact_no,
    trainer_name,
    profile_img,
    years_of_experience,
    skills,
    documents
  ){
    try{
      const role = "trainer";
      const userData = await AuthModel.createUser(email, password, role);
      if (!userData || !userData.user) {
        throw new Error("User not returned from signUp");
      }
      const insertData = {
        user_id: userData.user.id,
        bio: bio,
        contact_no: contact_no,
        trainer_name: trainer_name,
        profile_img: profile_img,
        years_of_experience: years_of_experience,
        skills: skills,
        verified: false, 
        documents: documents
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
    }
    catch (error) {
      console.error("Error registering trainer:", error);
      throw error;
  }
}
}

module.exports = AuthModel;
