var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ImageSchema = new Schema
(
    {
        filename: { type: String, required: true },
        authorID: { type: String, required: true },
    }
);

module.exports=mongoose.model("Image",ImageSchema);