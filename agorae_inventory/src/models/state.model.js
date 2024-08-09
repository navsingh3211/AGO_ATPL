import { Schema, model } from 'mongoose';

const _schema = new Schema(
  {
    id: {
      type: Number,
      required: true,
      index: { unique: true }
    },
    name: {
      type: String
    },
    slug: {
      type: String
    },
    country_id: {
      type: Number,
      index: true
    },
    status: {
      type: Boolean,
      default: 1,
      index: true
    },
    created_on: {
      type: Date
    },
    last_updated_on: {
      type: Date
    },
    deleted_on: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);
_schema.index({
  id: 1,
  status: 1,
  name: 1,
  created_on: 1,
  last_updated_on: 1
});

export default model('State', _schema);
