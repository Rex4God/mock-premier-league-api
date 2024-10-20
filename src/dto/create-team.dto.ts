import { Types } from 'mongoose';

export class CreateTeamDTO {
  teamName: string;
  stadium: string;
  createdBy: Types.ObjectId;
  createdOn: Date;

  constructor(
    teamName: string,
    stadium: string,
    createdBy: string | Types.ObjectId,
    createdOn: Date
  ) {
    this.teamName = teamName;
    this.stadium = stadium;
    this.createdBy = new Types.ObjectId(createdBy);
    this.createdOn = createdOn;
  }
}
