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
    birthday
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
        profile_img: profileImg,
        gender: gender,
        birthday: birthday,
      };
      console.log('Data to insert:', JSON.stringify(insertData, null, 2));

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
        console.error("Full error object:", JSON.stringify(insertError, null, 2));
        throw insertError;
      }
      
      console.log("Customer data inserted successfully:", customerdata);
      
      // Return both user and customer data
      return {
        user: userData.user,
        session: userData.session,
        customer: customerdata[0] // Return the first (and only) inserted record
      };
    } catch (error) {
      console.error("Error registering customer:", error);
      throw error;
    }
  }

 


}
module.exports = AuthModel;
