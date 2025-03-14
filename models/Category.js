const mongoose = require("mongoose");

// Category Schema
const categorySchema = new mongoose.Schema(
	{
		name: { type: String, required: true, unique: true, trim: true },
		imageUrl: { type: String, required: true },
		isFeatured: { type: Boolean, default: true },
	},
	{ timestamps: true }
);

// SubCategory Schema
const subCategorySchema = new mongoose.Schema(
	{
		name: {type: String,required: true},
		description: {type: String,required: true},
		imageUrl: {type: String,required: true},
		category: {type: mongoose.Schema.Types.ObjectId,ref: "Category",required: true},
	},
	{ timestamps: true }
);


const Category = mongoose.model("Category", categorySchema);
const SubCategory = mongoose.model("SubCategory", subCategorySchema);

module.exports = { Category, SubCategory };
