import { CollectionConfig } from 'payload';

export const Notifications: CollectionConfig = {
  slug: 'notifications',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'user', 'read', 'createdAt'],
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false;
      if (user.role === 'admin') return true;
      return { user: { equals: user.id } };
    },
    create: ({ req: { user } }) => {
      if (!user) return false;
      return user.role === 'admin'; // Dispatched via backend system triggers
    },
    update: ({ req: { user } }) => {
      if (!user) return false;
      if (user.role === 'admin') return true;
      return { user: { equals: user.id } }; // Users can mark as read
    },
    delete: ({ req: { user } }) => {
      if (!user) return false;
      if (user.role === 'admin') return true;
      return { user: { equals: user.id } };
    },
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'message',
      type: 'text',
      required: true,
    },
    {
      name: 'type',
      type: 'select',
      options: [
        { label: 'General Info', value: 'info' },
        { label: 'Scan Alert', value: 'scan' },
        { label: 'Vaccine Alert', value: 'vaccine' },
        { label: 'Lost Pet Update', value: 'lost' },
      ],
      defaultValue: 'info',
      required: true,
    },
    {
      name: 'read',
      type: 'checkbox',
      defaultValue: false,
      required: true,
    },
  ],
  timestamps: true,
};
