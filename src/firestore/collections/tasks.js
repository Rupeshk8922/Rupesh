const taskStructure = {
  taskName: {
    type: 'string',
    description: 'The name of the task.',
  },
  description: {
    type: 'string',
    description: 'A detailed description of the task.',
  },
  assignee: {
    type: 'string',
    description: 'Firebase Authentication user ID of the person assigned to the task.',
  },
  dueDate: {
    type: 'timestamp', // or Timestamp if runtime type
    description: 'Due date and time for the task.',
  },
  status: {
    type: 'string',
    description: 'Current status of the task.',
    enum: ['pending', 'in-progress', 'completed'], // consider using constants elsewhere
  },
  priority: {
    type: 'string',
    description: 'Priority level of the task.',
    enum: ['low', 'medium', 'high'],
  },
  createdAt: {
    type: 'timestamp',
    description: 'Timestamp when task was created.',
  },
  updatedAt: {
    type: 'timestamp',
    description: 'Timestamp when task was last updated.',
    optional: true,
  },
  creatorId: {
    type: 'string',
    description: 'User ID of the creator of the task.',
    optional: true,
  },
};

export default taskStructure;
