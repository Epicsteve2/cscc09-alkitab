import IUser from '../interfaces/user';
import mongoose, { Schema } from 'mongoose';

const UserSchema: Schema = new Schema(
	{
		bookName: { type: String, required: true },
		numberOfOwners: { type: Number, required: true }
        
	},
	{
		timestamps: true
	}
);

const User = mongoose.model<IUser>('User', UserSchema);

export default User;
