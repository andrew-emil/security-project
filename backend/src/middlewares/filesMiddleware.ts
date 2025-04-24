import multer from "multer";

const photosUpload = multer({
	storage: multer.memoryStorage(),
	limits: {
		fileSize: 10 * 1024 * 1024, // 5MB limit
		files: 1,
	},
	fileFilter: (_, file, cb) => {
		if (file.mimetype.startsWith("image/")) {
			cb(null, true);
		} else {
			cb(new Error("Only image files are allowed"));
		}
	},
});

export const validateEquipmentPhoto = photosUpload.single("photo");
export const validateUserPhoto = photosUpload.single("picture");
