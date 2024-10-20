import mongoose, { Schema } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import { IFixture } from '../interfaces/fixture.interface';
import { STATUS } from '../utils/constant';

const FixtureSchema: Schema = new Schema(
  {
    homeTeam: {
      type: String,
      required: true,
    },
    awayTeam: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: [STATUS.PENDING, STATUS.COMPLETED],
      default: STATUS.PENDING,
      required: true,
    },
    score: {
      home: {
        type: Number,
        default: 0,
      },
      away: {
        type: Number,
        default: 0,
      },
    },
    uniqueLink: {
      type: String,
      unique: true,
      required: true,
    },
  },
  { timestamps: true }
);

FixtureSchema.plugin(mongoosePaginate);

FixtureSchema.index({ homeTeam: 'text', awayTeam: 'text' });

export default mongoose.model<IFixture>('Fixture', FixtureSchema);
