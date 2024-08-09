import { Schema, model } from 'mongoose';

const counterSchema = new Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});
const counterModel = model('counter', counterSchema);

const _schema = new Schema(
  {
    instituteId: {
      type: Number,
      index: true,
      select: false
    },
    locationId: {
      type: String,
      index: true
    },
    locationName: {
      type: String,
      index: true,
      required: true
    },
    locationCapacity: {
      type: Number,
      required: false,
      default: null
    },
    status: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

_schema.pre('save', async function (next) {
  if (this.isNew) {
    const counter = await counterModel.findByIdAndUpdate(
      { _id: 'locationId' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    const number = counter.seq;
    this.locationId = `L${number}`;
  }
  next();
});

export default model('locationMaster', _schema);
