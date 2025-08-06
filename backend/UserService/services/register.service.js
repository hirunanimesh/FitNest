// services/customer.service.js
import { supabase } from '../database/supabase.js'

class RegisterService {
  async createCustomer({ user_id, first_name, last_name, address, contact_number, date_of_birth, gender, profile_image_url }) {
    try {
      const { data, error } = await supabase
        .from('customer')
        .insert([{
          user_id,
          first_name,
          last_name,
          address,
          contact_number,
          date_of_birth,
          gender,
          profile_image_url
        }])
        .select()
        .single()

      if (error) throw error

      return { success: true, data }
    } catch (error) {
      console.error('Error creating customer:', error)
      return { success: false, error: 'Failed to create customer' }
    }
  }

  
}

export default new RegisterService ()
