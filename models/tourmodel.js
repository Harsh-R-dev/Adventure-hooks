import mongoose from 'mongoose';
import slugify from 'slugify';

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      minlength: [
        5,
        'Name must have at least 5 characters',
      ],
      maxlength: [
        40,
        'Name must not exceed 40 characters',
      ],
      match: [
        /^[a-zA-Z0-9 ]+$/,
        'Name must be alphanumeric',
      ],
    },

    duration: {
      type: Number,
      required: [
        true,
        'A tour must have a duration',
      ],
      min: [1, 'Duration must be above 1 day'],
      max: [
        100,
        'Duration must be below 100 days',
      ],
    },

    maxGroupSize: {
      type: Number,
      required: [
        true,
        'A tour must have a group size',
      ],
      min: [1, 'Group size must be at least 1'],
    },

    difficulty: {
      type: String,
      required: [
        true,
        'A tour must have a difficulty',
      ],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message:
          'Difficulty must be easy, medium, or difficult',
      },
    },

    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: (val) => Math.round(val * 10) / 10,
    },

    ratingsQuantity: {
      type: Number,
      default: 0,
      min: [
        0,
        'Ratings quantity cannot be negative',
      ],
    },

    price: {
      type: Number,
      required: [
        true,
        'A tour must have a price',
      ],
      min: [50, 'Price must be above 50'],
      max: [
        10000,
        'Price must not exceed 10,000',
      ],
    },

    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price; // Only works on CREATE, not UPDATE
        },
        message:
          'Discount price should be less than the actual price',
      },
    },

    summary: {
      type: String,
      trim: true,
      required: [
        true,
        'A tour must have a summary',
      ],
    },

    description: {
      type: String,
      trim: true,
      minlength: [
        20,
        'Description must be at least 20 characters',
      ],
    },

    imageCover: {
      type: String,
      required: [
        true,
        'A tour must have a cover image',
      ],
    },

    images: {
      type: [String],
      validate: {
        validator: function (arr) {
          return arr.length <= 10;
        },
        message:
          'Cannot upload more than 10 images',
      },
    },

    slug: String,

    createdat: {
      type: Date,
      default: Date.now(),
      select: false,
      validate: {
        validator: (val) => val <= Date.now(),
        message:
          'Created date cannot be in the future',
      },
    },

    startDates: {
      type: [Date],
      validate: {
        validator: function (arr) {
          return arr.every(
            (date) => date >= Date.now()
          );
        },
        message:
          'Start dates cannot be in the past',
      },
    },

    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// -----------------------------
// VIRTUAL PROPERTY
// -----------------------------
tourSchema
  .virtual('durationWeeks')
  .get(function () {
    return this.duration / 7;
  });

// -----------------------------
// DOCUMENT MIDDLEWARE
// -----------------------------
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// -----------------------------
// QUERY MIDDLEWARE
// -----------------------------
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.pre(/^find/, function (next) {
  console.log(
    `Query took ${Date.now() - this.start} ms`
  );
  next();
});

// -----------------------------
// AGGREGATION MIDDLEWARE
// -----------------------------
tourSchema.pre('aggregate', function (next) {
  // Prevent adding match twice
  if (!this.pipeline()[0].$match?.secretTour) {
    this.pipeline().unshift({
      $match: { secretTour: { $ne: true } },
    });
  }
  next();
});

const Tour = mongoose.model('Tour', tourSchema);
export default Tour;
