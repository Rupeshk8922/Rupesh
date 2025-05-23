const petitionsCollection = {
  title: {
    type: 'string',
    description: 'The title of the petition.',
  },
  description: {
    type: 'string',
    description: 'A detailed description of the petition.',
  },
  signatures: {
    type: 'array',
    items: {
      type: 'string', // userId string
      description: 'User ID of the signatory.',
    },
    description: 'An array of user IDs who have signed the petition.',
  },
  targetCount: {
    type: 'number',
    description: 'The target number of signatures for the petition.',
  },
  createdAt: {
    type: 'timestamp', // as string for consistency
    description: 'The timestamp when the petition was created.',
  },
};

export default petitionsCollection;
