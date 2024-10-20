import { Types } from 'mongoose';

export class UpdateTeamDTO {
  teamName?: string;
  stadium?: string;
  modifiedBy?: Types.ObjectId;
  modifiedOn?: Date;

  constructor(
    teamName?: string,
    stadium?: string,
    modifiedBy?: string | Types.ObjectId,
    modifiedOn?: Date
  ) {
    this.teamName = teamName;
    this.stadium = stadium;
    this.modifiedBy = modifiedBy ? new Types.ObjectId(modifiedBy) : undefined;
    this.modifiedOn = modifiedOn || new Date();
  }
}
