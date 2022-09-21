const mongoose = require('mongoose')
const objectId = mongoose.Schema.Types.ObjectId

const bookSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    expert: {
        type: String,
        required: true,
        trim: true
    },

    userId: {
        type: objectId,
        required: true,
        ref: "User"
    },
    ISBN: {
        type: String,
        required: true,
        unique: true
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    subcategory: [{
        type: String,
        required: true,
        trim: true
    }],
    reviews: {
        type: Number,
        default: 0
    },
    deletedAt: {
        type: Date
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    releasedAt: {
        type: Date,
        required: true
    },

}, { timestapms: true })

module.exports = mongoose.model("Book", bookSchema)