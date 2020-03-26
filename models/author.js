const moment = require('moment')
const mongoose = require('mongoose')

const Schema = mongoose.Schema

const AuthorSchema= new Schema(
    {
      first_name: {type: String, required: true, max: 100},
      family_name: {type: String, required: true, max: 100},
      date_of_birth: {type: Date},
      date_of_death: {type: Date},
    }
  )
  
  // Virtual for author's full name
  AuthorSchema
  .virtual('name')
  .get(function () {
  
  // To avoid errors in cases where an author does not have either a family name or first name
  // We want to make sure we handle the exception by returning an empty string for that case
  
    var fullname = ''
    if (this.first_name && this.family_name) {
      fullname = this.family_name + ', ' + this.first_name
    }
    if (!this.first_name || !this.family_name) {
      fullname = ''
    }
  
    return fullname
  })  
  
  // Virtual for author's lifespan
  AuthorSchema
  .virtual('lifespan')
  .get(function() {
    if (!this.date_of_birth && !this.date_of_death) {
      return '';
    }
    if (!this.date_of_death) {
      return moment(this.date_of_birth).utc().format('MMMM Do, YYYY');
    }    
    return this.date_of_birth ?
    moment(this.date_of_birth).utc().format('MMMM Do, YYYY') + ' - ' + moment(this.date_of_death).utc().format('MMMM Do, YYYY') : '';
    
  })

  //  Virtual for author form date fields
  AuthorSchema
  .virtual('dateFields')
  .get(function() {

    if (this.date_of_birth) {
      return moment(this.date_of_birth).utc().format('YYYY MM DD');
    }
    if (this.date_of_death) {
      return moment(this.date_of_birth).utc().format('YYYY MM DD');
    }    

  })
  
  // Virtual for author's URL
  AuthorSchema
  .virtual('url')
  .get(function() {
    return '/catalog/author/' + this._id
  })
  
  //Export model
  module.exports = mongoose.model('Author', AuthorSchema)