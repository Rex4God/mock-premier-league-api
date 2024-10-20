import mongoose, { Schema } from 'mongoose';
import { ITeam } from '../interfaces/team.interface';
import mongoosePaginate from 'mongoose-paginate-v2';

const TeamSchema: Schema = new Schema({
  teamName: {
    type: String,
    required: true,
  },
  stadium: {
    type: String,
    required: true,
    trim: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdOn: {
    type: Date,
    default: Date.now,
  },
  modifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  modifiedOn: {
    type: Date,
    required: false,
  },
});

TeamSchema.plugin(mongoosePaginate);

TeamSchema.index({ teamName: 'text', stadium: 'text' });

export default mongoose.model<ITeam>('Team', TeamSchema);
