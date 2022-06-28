'use strict';
const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;

var contactSchema = Schema( {
    userID: {type:Schema.Types.ObjectId}, // need to add in this line
    name: String,
    email: String,
    phone: String,
    comment: String,
} );

module.exports = mongoose.model( 'Contact', contactSchema );