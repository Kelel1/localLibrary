const moment = require('moment')
const mongoose = require('mongoose')

const Schema = mongoose.Schema

const BookInstanceSchema = new Schema(
  {
    book: { type: Schema.Types.ObjectId, ref: 'Book', required: true }, //reference to the associated book
    imprint: {type: String, required: true},
    status: {type: String, required: true, enum: ['Available', 'Maintenance', 'Loaned', 'Reserved'], default: 'Maintenance'},
    due_back: {type: Date, default: Date.now}
  }
)

// Virtual for bookinstance's URL
BookInstanceSchema
.virtual('url')
.get(function () {
  return '/catalog/bookinstance/' + this._id
})

// Virtual for bookinstance's formatted date
BookInstanceSchema
  .virtual('due_back_formatted')
  .get(function() {
    return moment(this.due_back).utc().format('MMMM Do, YYYY')
  })


// Virtual for bookinstance's due date for display in form
BookInstanceSchema
  .virtual('due_date')
  .get(function() {
      return moment(this.due_back).utc().format('YYYY-MM-DD');
    
  })


//Export model
module.exports = mongoose.model('BookInstance', BookInstanceSchema)