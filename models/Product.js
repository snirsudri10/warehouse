var mongoose = require("mongoose");

var ProductSchema = new mongoose.Schema({
    barcode_id: String,
    quantity: Number,
    price: Number,
    name: {type: String, unique: true}
});

module.exports = mongoose.model("Product",ProductSchema);