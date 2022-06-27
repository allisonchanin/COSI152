'use strict';
const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;

var todoSchema = Schema( {
  userID: {type:Schema.Types.ObjectId}, // need to add in this line
  desc: String,
  completed: Boolean,
  createdAt: Date,
} );

module.exports = mongoose.model( 'ToDoItem', todoSchema );