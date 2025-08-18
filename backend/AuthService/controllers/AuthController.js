const authmodel = require("../model/authModel");
const { uploadImage } = require("../config/cloudinary");

class AuthController {
  static async login(req, res) {
    const { email, password } = req.body;
    try {
      const data = await authmodel.loginUser(email, password);

      console.log("[Auth Service] User logged in successfully:", data.user);
      console.log("token:", data.session.access_token);

      // Get user role from metadata
      const userRole = data.user.user_metadata?.role || "customer";

      // Store token in httpOnly cookie (or return as JSON)
      // res.cookie("token", data.session.access_token, {
      //   httpOnly: true,
      //   secure: process.env.NODE_ENV === "production",
      //   maxAge: 60 * 60 * 1000, // 1 hour
      // });

      return res.status(200).json({
        success: true,
        message: "Login successful",
        user: data.user,
        role: userRole,
        session: data.session,
      });
    } catch (error) {
      console.error("[Auth Service] Error during login:", error);

      // Handle specific auth errors
      if (error.code === "email_not_confirmed") {
        return res.status(400).json({
          success: false,
          message:
            "Please check your email and click the confirmation link before logging in",
          error: "Email not confirmed",
          code: "email_not_confirmed",
        });
      }

      return res.status(401).json({
        success: false,
        message: "Login failed",
        error: error.message,
      });
    }
  }

  static async getUserInfo(req, res) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
          success: false,
          message: "Authorization token required",
        });
      }

      const token = authHeader.split(" ")[1];
      const userData = await authmodel.getUserFromToken(token);

      return res.status(200).json({
        success: true,
        user: userData.user,
        role: userData.user.user_metadata?.role || "customer",
      });
    } catch (error) {
      console.error("[Auth Service] Error getting user info:", error);
      return res.status(401).json({
        success: false,
        message: "Invalid token",
        error: error.message,
      });
    }
  }

  static async completeOAuthProfile(req, res) {
    try {
      console.log("OAuth profile completion request:", req.body);

      const {
        user_id,
        firstName,
        lastName,
        address,
        phoneNo,
        gender,
        birthday,
        location,
        weight,
        height,
        userRole,
        profileImage,
      } = req.body;

      // Parse location as JSON object for JSONB field if it's a string
      let locationObject = null;
      if (location && typeof location === "string") {
        try {
          locationObject = JSON.parse(location);
        } catch (parseError) {
          console.error("Error parsing location JSON:", parseError);
          locationObject = null;
        }
      } else if (location && typeof location === "object") {
        locationObject = location;
      }

      //let profileImageUrl = null;

      // Check if a file was uploaded
      // if (req.file) {
      //   try {
      //     // Upload image to Cloudinary
      //     const cloudinaryResult = await uploadImage(
      //       req.file.buffer,
      //       'fitnest/customers',
      //       `customer_oauth_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      //     );
      //     profileImageUrl = cloudinaryResult.secure_url;
      //     console.log('OAuth profile image uploaded successfully to Cloudinary:', profileImageUrl);
      //   } catch (uploadError) {
      //     console.error('Error uploading OAuth profile image to Cloudinary:', uploadError);
      //   }
      // }

      const result = await authmodel.completeOAuthCustomerProfile(
        user_id,
        firstName,
        lastName,
        address,
        phoneNo,
        profileImage,
        gender,
        birthday,
        weight,
        height,
        locationObject,
        userRole
      );

      // Check if customer already exists
      if (result && result.alreadyExists) {
        return res.status(200).json({
          success: false,
          alreadyExists: true,
          message:
            "User profile already exists. Please login instead of completing profile again.",
          customer: result.customer,
        });
      }

      res.status(201).json({
        success: true,
        message: "OAuth profile completed successfully",
        customer: result,
      });
    } catch (error) {
      console.error("[Auth Service] Error completing OAuth profile:", error);
      res.status(500).json({
        success: false,
        message: "Failed to complete OAuth profile",
        error: error.message,
      });
    }
  }

  static async completeOAuthTrainerProfile(req, res) {
    console.log("OAuth trainer profile completion request:", req.body);
    try {
      console.log("OAuth trainer profile completion request:", req.body);

      const {
        user_id,
        nameWithInitials,
        contactNo,
        bio,
        skills,
        experience,
        profileImage,
        documents,
        userRole,
      } = req.body;

      // Validate user_id
      if (!user_id) {
        console.error("user_id is missing from request");
        return res.status(400).json({
          success: false,
          message: "user_id is required",
        });
      }

      console.log("Processing for user_id:", user_id);

      // Parse documents from JSON string if needed
      let documentsArray = [];
      if (documents && typeof documents === "string") {
        try {
          documentsArray = JSON.parse(documents);
        } catch (parseError) {
          console.error("Error parsing documents JSON:", parseError);
          documentsArray = [];
        }
      } else if (documents && Array.isArray(documents)) {
        documentsArray = documents;
      }

      const result = await authmodel.completeOAuthTrainerProfile(
        user_id,
        nameWithInitials,
        contactNo,
        bio,
        skills,
        experience,
        profileImage,
        documentsArray,
        userRole
      );

      // Check if trainer already exists
      if (result && result.alreadyExists) {
        return res.status(200).json({
          success: false,
          alreadyExists: true,
          message:
            "Trainer profile already exists. Please login instead of completing profile again.",
          trainer: result.trainer,
        });
      }

      res.status(201).json({
        success: true,
        message: "OAuth trainer profile completed successfully",
        trainer: result,
      });
    } catch (error) {
      console.error("[Auth Service] Error completing OAuth trainer profile:", error);
      res.status(500).json({
        success: false,
        message: "Failed to complete OAuth trainer profile",
        error: error.message,
      });
    }
  }

  static async createUser(req, res) {
    const { email, password, role } = req.body;
    try {
      const result = await authmodel.createUser(email, password, role);
      res.status(201).json({
        success: true,
        message: "User created successfully",
        user: result.user,
      });
    } catch (error) {
      console.error("[Auth Service] Error during user creation:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create user",
        error: error.message,
      });
    }
  }

  static async customerRegister(req, res) {
    try {
      console.log("Request body:", req.body);
      console.log("Request file:", req.file);

      // Extract data from req.body (FormData fields)
      const email = req.body.email;
      const password = req.body.password;
      const role = req.body.role || "customer";
      const firstName = req.body.firstName;
      const lastName = req.body.lastName;
      const address = req.body.address;
      const phoneNo = req.body.phoneNo;
      const gender = req.body.gender;
      const birthday = req.body.birthday;
      const weight = req.body.weight;
      const height = req.body.height;

      // Parse location as JSON object for JSONB field
      let locationObject = null;
      if (req.body.location && req.body.location !== "") {
        try {
          locationObject = JSON.parse(req.body.location);
        } catch (parseError) {
          console.error("Error parsing location JSON:", parseError);
          locationObject = null;
        }
      }

      let profileImageUrl = null;

      // Check if a file was uploaded
      if (req.file) {
        try {
          // Upload image to Cloudinary
          const cloudinaryResult = await uploadImage(
            req.file.buffer,
            "fitnest/customers",
            `customer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          );
          profileImageUrl = cloudinaryResult.secure_url;
          console.log(
            "Image uploaded successfully to Cloudinary:",
            profileImageUrl
          );
        } catch (uploadError) {
          console.error("Error uploading image to Cloudinary:", uploadError);
          // Continue with registration even if image upload fails
          // You can choose to return an error here if image is required
        }
      }

      const result = await authmodel.customerRegister(
        email,
        password,
        role,
        firstName,
        lastName,
        address,
        phoneNo,
        profileImageUrl, // Store the Cloudinary URL instead of file
        gender,
        birthday,
        weight,
        height,
        locationObject // Pass as JSON object for JSONB field
      );

      res.status(201).json({
        success: true,
        message: "Customer registered successfully",
        customer: result,
        profileImageUrl: profileImageUrl,
      });
    } catch (error) {
      console.error(
        "[Auth Service] Error during customer registration:",
        error
      );
      res.status(500).json({
        success: false,
        message: "Failed to register customer",
        error: error.message,
      });
    }
  }

  static async GymRegister(req, res) {
    const {
      email,
      password,
      gymName,
      address,
      location,
      contactNo,
      profileImage,
      description,
      documents,
      operatingHours,
      ownerName,

    } = req.body;
    try {
      console.log("in controller");
      const result = await authmodel.GymRegister(
        email,
      password,
      gymName,
      address,
      location,
      contactNo,
      profileImage,
      description,
      documents,
      operatingHours,
      ownerName,
      );
      res.status(201).json({
        success: true,
        message: "Gym registered successfully",
        gym: result,
      });
    } catch (error) {
      console.error("[Auth Service] Error during gym registration:", error);
      res.status(500).json({
        success: false,
        message: "Failed to register gym",
        error: error.message,
      });
    }
  }

  static async TrainerRegister(req, res) {
    const {
      nameWithInitials,
      email,
      bio,
      password,
      contactNo,
      profileImage,
      skills,
      experience,
      documents,
      role,
    } = req.body;
    console.log("Trainer registration request body:", req.body);
    try {
      const result = await authmodel.TrainerRegister(
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
      );

      // Handle email confirmation required case
      if (result.requiresConfirmation) {
        return res.status(200).json({
          success: true,
          requiresConfirmation: true,
          message: result.message,
          user: result.user
        });
      }

      res.status(201).json({
        success: true,
        message: "Trainer registered successfully",
        trainer: result,
      });
    } catch (error) {
      console.error("[Auth Service] Error during trainer registration:", error);
      res.status(500).json({
        success: false,
        message: "Failed to register trainer",
        error: error.message,
      });
    }
  }
}

module.exports = AuthController;
