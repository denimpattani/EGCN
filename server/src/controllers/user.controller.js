import User from '../models/User.model.js';

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -__v -resetPasswordToken -resetPasswordExpires');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { businessName, phone, businessType, businessScale, address, city, state } = req.body;
    
    // Find user and update
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Update only allowed fields
    if (businessName) user.businessName = businessName;
    if (phone) user.phone = phone;
    if (businessType) user.businessType = businessType;
    if (businessScale) user.businessScale = businessScale;
    if (address) user.address = address;
    if (city) user.city = city;
    if (state) user.state = state;

    await user.save();
    
    // Return updated user data (exclude sensitive fields)
    const updatedUser = await User.findById(req.user.id).select('-password -__v -resetPasswordToken -resetPasswordExpires');

    res.status(200).json({ success: true, message: 'Profile updated successfully', data: updatedUser });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
