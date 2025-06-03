const mongoose = require("mongoose");
const schema = mongoose.Schema;
let User = require("./user.js");
let Listing = require("./listing.js");

let bookingSchema = new schema({
    start: {
        type: String
    },
    end: {
        type: String
    },
    guest: String,
    owner: {
        type: schema.Types.ObjectId,
        ref: "User"
    },
    place: {
        type: schema.Types.ObjectId,
        ref: "Listing"
    },
    days: {
        type: Number
    },
    status: {
        type: String,
        enum: ["active", "cancelled"],
        default: "active"
    }
}, {
    timestamps: true // ✅ correct placement here
});

let Booking = mongoose.model("Booking", bookingSchema);
module.exports = Booking;
