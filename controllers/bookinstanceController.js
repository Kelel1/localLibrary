var BookInstance = require('../models/bookinstance');
var Book = require('../models/book');
var async = require('async');
const { body,validationResult } = require('express-validator');
const { sanitizeBody } = require('express-validator');

// Display list of all BookInstances.
exports.bookinstance_list = function(req, res, next) {

    BookInstance.find()
      .populate('book')
      .exec(function (err, list_bookinstances) {
        if (err) { return next(err); }
        // Successful, so render
        res.render('bookinstance_list', { title: 'Book Instance List', bookinstance_list: list_bookinstances });
      });
      
  };

// Display detail page for a specific BookInstance.
exports.bookinstance_detail = function(req, res, next) {

    BookInstance.findById(req.params.id)
    .populate('book')
    .exec(function (err, bookinstance) {
      if (err) { return next(err); }
      if (bookinstance==null) { // No results.
          var err = new Error('Book copy not found');
          err.status = 404;
          return next(err);
        }
      // Successful, so render.
      res.render('bookinstance_detail', { title: 'Copy: '+bookinstance.book.title, bookinstance:  bookinstance});
    })

};

// Display BookInstance create form on GET.
exports.bookinstance_create_get = function(req, res, next) {       

  Book.find({},'title')
  .exec(function (err, books) {
    if (err) { return next(err); }
    // Successful, so render.
    res.render('bookinstance_form', {title: 'Create BookInstance', book_list: books});
  });
  
};

// Handle BookInstance create on POST.
exports.bookinstance_create_post = [

  // Validate fields.
  body('book', 'Book must be specified').trim().isLength({ min: 1 }),
  body('imprint', 'Imprint must be specified').trim().isLength({ min: 1 }),
  body('due_back', 'Invalid date').optional({ checkFalsy: true }).isISO8601(),
  
  // Sanitize fields.
  sanitizeBody('book').escape(),
  sanitizeBody('imprint').escape(),
  sanitizeBody('status').trim().escape(),
  sanitizeBody('due_back').toDate(),
  
  // Process request after validation and sanitization.
  (req, res, next) => {

      // Extract the validation errors from a request.
      const errors = validationResult(req);

      // Create a BookInstance object with escaped and trimmed data.
      var bookinstance = new BookInstance(
        { book: req.body.book,
          imprint: req.body.imprint,
          status: req.body.status,
          due_back: req.body.due_back
         });

      if (!errors.isEmpty()) {
          // There are errors. Render form again with sanitized values and error messages.
          Book.find({},'title')
              .exec(function (err, books) {
                  if (err) { return next(err); }
                  // Successful, so render.
                  res.render('bookinstance_form', { title: 'Create BookInstance', book_list: books, selected_book: bookinstance.book._id , errors: errors.array(), bookinstance: bookinstance });
          });
          return;
      }
      else {
          // Data from form is valid.
          bookinstance.save(function (err) {
              if (err) { return next(err); }
                 // Successful - redirect to new record.
                 res.redirect(bookinstance.url);
              });
      }
  }
];

// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = function(req, res) {

  async.parallel({
    bookinstance: function(callback) {
      BookInstance.findById(req.params.id).exec(callback)
    }
  }, function(err, results) {
      if (err) { return next(err); }
      if (results.bookinstance==null) { // No results.
        res.redirect('/catalog/bookinstance');

      }
      // Successful so render
      res.render('bookinstance_delete', { title: 'Delete Bookinstance', bookinstance: results.bookinstance });

  });
    
  
};

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = function(req, res) {
    

  async.parallel({
    bookinstance: function(callback) {
      BookInstance.findById(req.body.bookinstanceid).exec(callback)
    }
  }, function(err, results) {
      if (err) { return next(err); }
      // Success
      // res.render('bookinstance_delete', { title: 'Delete Bookinstance', bookinstance: results.bookinstance });
      
      else {
        BookInstance.findByIdAndRemove(req.body.bookinstanceid, function deleteBookinstance(err) {
          if (err) { return next(err); }
          // Success - go to bookinstance list
            res.redirect('/catalog/bookinstances');
        })
      }
      
  });
};

// Display BookInstance update form on GET.
exports.bookinstance_update_get = function(req, res, next) {
    
  // Get book for form.
  
  async.parallel({
    bookinstance: function(callback) {
      BookInstance.findById(req.params.id).populate('book').exec(callback)
    },
    books: function(callback) {
      Book.find(callback);
    }
  }, function(err, results) {
    if (err) {return next(err); }
    if (results.bookinstance==null) { // No results.
      res.redirect('/catalog/bookinstance');
    }

    // Successfull so render
    res.render('bookinstance_form', { title: 'Update Bookinstance', bookinstance: results.bookinstance, book_list: results.books });
  })
    
};

// Handle bookinstance update on POST.
exports.bookinstance_update_post = [


  // Validate fields.
  body('imprint').trim().isLength({ min: 1 }),

  // Sanitize fields. 
  sanitizeBody('book').escape(),
  sanitizeBody('imprint').escape(),
  sanitizeBody('status').escape(),
  sanitizeBody('due_back').toDate(),

  // Process request after validation and sanitization.
  (req, res, next) => {

    // Extract the validation and sanitization.
    const errors = validationResult(req);

    //  Create a Bookinstance object with the escaped/trimmed data and old id.
    var bookinstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      due_back: req.body.due_back,
      _id: req.params.id
    });

    if (!errors.isEmpty()) {
      
      res.render('bookinstance_form', { title: 'Update Bookinstance', bookinstance: bookinstance, errors: errors.array() });
      return;
    }
    else {
      // Data from form is valid. Update the record.
      BookInstance.findByIdAndUpdate(req.params.id, bookinstance, {}, function (err, thebookinstance) {
          if (err) { return next(err); }
          // Successful = redirect to bookinstance detail page.
          res.redirect(thebookinstance.url);
      })
    }

  }
];