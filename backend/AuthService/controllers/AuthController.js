const authmodel = require("../model/authModel");
class AuthController {
  static async login(req, res) {
    const { email, password } = req.body;
    try {
      const data = await authmodel.loginUser(email, password);

      console.log("[Auth Service] User logged in successfully:", data.user);
      console.log("token:", data.session.access_token);

      // Store token in httpOnly cookie (or return as JSON)
      res.cookie("token", data.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 1000, // 1 hour
      });

      return res.status(200).json({
        success: true,
        message: "Login successful",
        user: data.user,
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
    const {
      email,
      password,
      role,
      firstName,
      lastName,
      address,
      phoneNo,
      profileImg,
      gender,
      birthday,
    } = req.body;
    try {
      const result = await authmodel.customerRegister(
        email,
        password,
        role,
        firstName,
        lastName,
        address,
        phoneNo,
        profileImg,
        gender,
        birthday
      );
      res.status(201).json({
        success: true,
        message: "Customer registered successfully",
        customer: result,
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
}

module.exports = AuthController;
