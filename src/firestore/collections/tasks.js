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
    description: 'The Firebase Authentication user ID of the person assigned to the task.',
  },
  dueDate: {
    type: 'timestamp',
    description: 'The due date and time for the task.',
  },
  status: {
    type: 'string',
    description: 'The current status of the task (e.g., "pending", "in-progress", "completed").',
    enum: ['pending', 'in-progress', 'completed'],
  },
  priority: {
    type: 'string',
    description: 'The priority level of the task (e.g., "low", "medium", "high").',
    enum: ['low', 'medium', 'high'],
  },
  createdAt: {
    type: 'timestamp',
    description: 'The timestamp when the task was created.',
  },
  updatedAt: {
    type: 'timestamp',
    description: 'The timestamp when the task was last updated.',
  },
};