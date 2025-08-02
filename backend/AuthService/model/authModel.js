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
      console.log(data);
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
    console.log('in model');
    try {
      const { user, session } = await AuthModel.createUser(
        email,
        password,
        role
      );
      if (!user) throw new Error("User not returned from signUp");
      const userId = user.id;

      const { data: customerdata, error: insertError } = await supabase
        .from("customers")
        .insert([
          {
            user_id: userId,
            first_name: firstName,
            last_name: LastName,
            address: address,
            phone_no: phoneNo,
            profile_img: profileImg,
            gender: gender,
            birthday: birthday,
          },
        ]);

      if (insertError) throw insertError;
      return customerdata;
    } catch (error) {
      console.error("Error registering customer:", error);
      throw error;
    }
  }
}
module.exports = AuthModel;
