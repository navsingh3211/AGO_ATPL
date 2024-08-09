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
    state_id: {
      type: Number,
      index: true
    },
    is_featured: {
      type: Boolean,
      default: 0
    },
    is_major_city: {
      type: Boolean,
      defaultValue: 0
    },
    latitude: {
      type: String
    },
    longitude: {
      type: String
    },
    area: {
      type: Number
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
    },
    isDeleted: {
      type: Boolean,
      select: false
    },
    deletedAt: {
      type: Date,
      select: false
    }
  },
  {
    timestamps: true
  }
);
_schema.index({ id: 1, state_id: 1, status: 1 });
export default model('City', _schema);
