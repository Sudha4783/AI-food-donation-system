import mongoose from 'mongoose';

const donationSchema = new mongoose.Schema(
  {
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Donation title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    foodType: {
      type: String,
      required: [true, 'Food type is required'],
      enum: [
        'cooked_meal',
        'raw_vegetables',
        'fruits',
        'packaged_food',
        'dairy',
        'bakery',
        'beverages',
        'grains_pulses',
        'snacks',
        'other',
      ],
    },
    quantity: {
      amount: { type: Number, required: true, min: [1, 'Quantity must be at least 1'] },
      unit: {
        type: String,
        enum: ['kg', 'grams', 'litres', 'packets', 'servings', 'pieces'],
        default: 'kg',
      },
    },
    expiryDate: {
      type: Date,
      required: [true, 'Expiry date is required'],
    },
    preparedDate: {
      type: Date,
    },
    storageTemp: {
      type: String,
      enum: ['room_temp', 'refrigerated', 'frozen'],
      default: 'room_temp',
    },
    packaging: {
      type: String,
      enum: ['sealed', 'open', 'partially_open'],
      default: 'sealed',
    },
    location: {
      city: { type: String, required: true, trim: true },
      area: { type: String, trim: true },
      pincode: { type: String, trim: true },
      fullAddress: { type: String, trim: true },
    },
    status: {
      type: String,
      enum: ['available', 'claimed', 'picked_up', 'delivered', 'expired', 'cancelled'],
      default: 'available',
    },
    aiQualityScore: {
      score: { type: Number, min: 0, max: 100 },
      label: {
        type: String,
        enum: ['Fresh', 'Good', 'Borderline', 'Unsafe'],
      },
      recommendation: { type: String },
      analyzedAt: { type: Date },
    },
    claimedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    claimedAt: { type: Date },
    pickedUpAt: { type: Date },
    deliveredAt: { type: Date },
    isUrgent: {
      type: Boolean,
      default: false,
    },
    servingSize: {
      type: Number, // approximate number of people it can feed
    },
    allergens: [
      {
        type: String,
        enum: ['nuts', 'gluten', 'dairy', 'eggs', 'soy', 'shellfish', 'none'],
      },
    ],
    notes: {
      type: String,
      maxlength: [300, 'Notes cannot exceed 300 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Auto-expire donations past expiry date
donationSchema.index({ expiryDate: 1 });
donationSchema.index({ status: 1 });
donationSchema.index({ donor: 1 });
donationSchema.index({ 'location.city': 1 });

// Virtual: is expired
donationSchema.virtual('isExpired').get(function () {
  return new Date() > this.expiryDate;
});

donationSchema.set('toObject', { virtuals: true });
donationSchema.set('toJSON', { virtuals: true });

const Donation = mongoose.model('Donation', donationSchema);
export default Donation;
