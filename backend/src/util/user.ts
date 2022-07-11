import User from '../models/user';

export const userExists = async function(username:string){
    const user = await User.findOne({username: username});
    if (user) return true;
    return false;
};
