import IUser from '../interfaces/user';
import mongoose, { Schema } from 'mongoose';

const UserSchema: Schema = new Schema(
	{
		username: { type: String, required: true },
		password: { type: String, required: true }
	},
	{
		timestamps: true
	}
);

const User = mongoose.model<IUser>('User', UserSchema);

export default User;
