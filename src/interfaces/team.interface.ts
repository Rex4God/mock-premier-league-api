import { Document, Types } from 'mongoose';

export interface ITeam extends Document {
  teamName: string;
  stadium: string;
  createdBy: Types.ObjectId;
  createdOn: Date;
  modifiedBy?: Types.ObjectId;
  modifiedOn?: Date;
}
