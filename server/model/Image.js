var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ImageSchema = new Schema
(
    {
        path: { type: String, required: true },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
    }
);

module.exports=mongoose.model("Image",ImageSchema);