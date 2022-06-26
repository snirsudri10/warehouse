var mongoose = require("mongoose");

var HistorySchema = new mongoose.Schema({
    username:String,
    date:String,
    productName:String,
    quantity:Number
});

module.exports = mongoose.model("History",HistorySchema);