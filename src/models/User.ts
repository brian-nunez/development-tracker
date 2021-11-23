import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import _debug from 'debug';
import generateRandomString from '../utils/generateRandomString';

const debug = _debug(`${process.env.npm_package_name}:models:User`);

type Name = {
  first: string,
  middle?: string,
  last: string,
};

export interface UserShape extends Document {
  name: Name,
  userId: string,
  email: string,
  password: string,
  avatar?: string,
  lastLogin?: number | null,
  dateCreated?: number,
}

const UserSchema = new Schema<UserShape>({
  name: {
    first: {
      type: String,
      required: true,
    },
    middle: {
      type: String,
      required: false,
    },
    last: {
      type: String,
      required: true,
    },
  },
  userId: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
    default: function() {
      return `https://avatars.dicebear.com/api/identicon/${this.name.first}.svg`;
    },
  },
  lastLogin: {
    type: Number,
    default: null,
  },
  dateCreated: {
    type: Number,
    default: Date.now,
  },
});

const User = model<UserShape>('User', UserSchema);

export async function generateHashedPassword(password: string): Promise<string> {
  return new Promise((resolve) => {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(password, salt, (error, hash) => {
        if (error) {
          debug(`Error generateHashedPassword - ${JSON.stringify(error)}`);
          throw error;
        };
        
        debug('Successful generateHashedPassword');
        resolve(hash);
      });
    });
  });
}

export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  const valid: boolean = await bcrypt.compare(password, hashedPassword);
  return valid;
}

export function cleanUser(user: UserShape) {
  const {
    _id: id,
    name,
    userId,
    email,
    avatar,
  } = user;

  return {
    id,
    name,
    userId,
    email,
    avatar,
  };
}

export async function createUniqueUserId(name: Name): Promise<string> {
  const combinedName = Object.values(name).filter(v => !!v).join('_').toLowerCase();
  const id = `${combinedName}${generateRandomString(5)}`;

  const user = await User.findOne({ userId: id });

  if (user) {
    return createUniqueUserId(name);
  }

  return id;
}

export default User;
