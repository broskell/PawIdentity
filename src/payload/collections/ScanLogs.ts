import { CollectionConfig } from 'payload';

export const ScanLogs: CollectionConfig = {
  slug: 'scan-logs',
  admin: {
    useAsTitle: 'time',
    defaultColumns: ['pet', 'city', 'country', 'scanType', 'time'],
  },
  access: {
    read: ({ req: { user } }) => {
      if (!user) return false;
      if (user.role === 'admin') return true;
      return {
        'pet.owner': { equals: user.id }
      };
    },
    create: () => true, // Creating scan logs is done by anyone who scans the tag
    update: () => false, // Scan logs are read-only write-once ledger
    delete: ({ req: { user } }) => {
      if (!user) return false;
      return user.role === 'admin';
    },
  },
  fields: [
    {
      name: 'pet',
      type: 'relationship',
      relationTo: 'pets',
      required: true,
      index: true,
    },
    {
      name: 'city',
      type: 'text',
    },
    {
      name: 'country',
      type: 'text',
    },
    {
      name: 'lat',
      type: 'number',
    },
    {
      name: 'lng',
      type: 'number',
    },
    {
      name: 'ip',
      type: 'text',
    },
    {
      name: 'device',
      type: 'text',
    },
    {
      name: 'browser',
      type: 'text',
    },
    {
      name: 'time',
      type: 'date',
      defaultValue: () => new Date(),
      required: true,
    },
    {
      name: 'scanType',
      type: 'select',
      options: [
        { label: 'Public Scan', value: 'public' },
        { label: 'Owner Scan', value: 'owner' },
        { label: 'Admin Scan', value: 'admin' },
      ],
      defaultValue: 'public',
      required: true,
    },
  ],
  timestamps: true,
};
