// controllers/customer.controller.js
import registerService from '../services/register.service.js'

// POST /api/users/customer → Create customer
export const registerCustomer = async (req, res) => {
  const {
    user_id, // ideally comes from auth middleware
    first_name,
    last_name,
    address,
    contact_number,
    date_of_birth,
    gender,
    profile_image_url
  } = req.body

  if (!user_id || !first_name || !last_name) {
    return res.status(400).json({ error: 'user_id, first_name, and last_name are required' })
  }

  const result = await customerService.createCustomer({
    user_id,
    first_name,
    last_name,
    address,
    contact_number,
    date_of_birth,
    gender,
    profile_image_url
  })

  if (!result.success) {
    return res.status(500).json({ error: result.error })
  }

  res.status(201).json(result.data)
}
