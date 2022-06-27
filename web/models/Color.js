'use strict';
const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;

var colorSchema = Schema( {
  userID: {type:Schema.Types.ObjectId}, // need to add in this line
  name: String,
  using: Boolean,
} );

module.exports = mongoose.model( 'Color', colorSchema );