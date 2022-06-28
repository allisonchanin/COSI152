'use strict';
const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;

var contactSchema = Schema( {
  name: String,
  email: String,
  phone: String,
  comment: String,
} );

module.exports = mongoose.model( 'Contact', contactSchema );