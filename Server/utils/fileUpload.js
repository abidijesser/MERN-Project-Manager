const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure storage for profile pictures
const profilePictureStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = 'public/uploads/profile-pictures';
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Use userId + timestamp to ensure uniqueness
    const userId = req.user.id;
    const timestamp = Date.now();
    const fileExtension = path.extname(file.originalname);
    
    cb(null, `${userId}-${timestamp}${fileExtension}`);
  }
});

// File filter to only allow image files
const imageFileFilter = (req, file, cb) => {
  // Accept only image files
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
    return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
};

// Create multer upload instance for profile pictures
const uploadProfilePicture = multer({
  storage: profilePictureStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  },
  fileFilter: imageFileFilter
}).single('profilePicture');

module.exports = {
  uploadProfilePicture
};
