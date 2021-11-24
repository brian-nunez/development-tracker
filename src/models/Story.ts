import { Schema, model, Document } from 'mongoose';
import _debug from 'debug';
import { cleanUser, UserShape } from './User';
import { TaskShape } from './Task';
import generateRandomString from '../utils/generateRandomString';

const debug = _debug(`${process.env.npm_package_name}:models:Story`);

type StoryStatus = 'GROOMING' | 'DEFINED' | "PROGRESS" | 'COMPLETED' | 'ACCEPTED' | 'RELEASED';

export interface StoryShape extends Document {
  name: string,
  storyId: string,
  owner: UserShape,
  tasks: TaskShape[],
  estimate?: number,
  notes?: string,
  acceptenceCriteria?: string,
  status?: StoryStatus,
  dateCreated?: number,
}

const StorySchema = new Schema<StoryShape>({
  name: {
    type: String,
    required: true,
  },
  storyId: {
    type: String,
    required: true,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  tasks: {
    type: [Schema.Types.ObjectId],
    ref: 'Task',
    default: [],
  },
  estimate: {
    type: Number,
    default: 0,
  },
  notes: {
    type: String,
    default: '',
  },
  acceptenceCriteria: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    default: 'GROOMING',
  },
  dateCreated: {
    type: Number,
    default: Date.now,
  },
});

const Story = model<StoryShape>('Story', StorySchema);

export async function populateStoryData(story: StoryShape): Promise<void> {
  const fieldsToPopulate = ['owner'];

  await story.populate(fieldsToPopulate);
}

export function cleanStory(story: StoryShape): object {
  const {
    _id: id,
    name,
    storyId,
    owner,
    tasks,
    estimate,
    notes,
    acceptenceCriteria,
    status,
  } = story;

  return {
    id,
    name,
    storyId,
    owner: cleanUser(owner),
    tasks,
    estimate,
    notes,
    acceptenceCriteria,
    status,
  };
}

export async function createUniqueStoryId(): Promise<string> {
  const id = generateRandomString(10);
  const story = await Story.findOne({ storyId: id });

  if (story) {
    return createUniqueStoryId();
  }

  return id;
}

export async function deleteStoryData(story: StoryShape): Promise<void> {
  // TODO: delete tasks
}

export default Story;
