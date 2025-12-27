export interface Notification {
    id: string;
    title: string;
    description: string;
    date: string;
    read: boolean;
    type: 'offer' | 'system' | 'alert';
}

export const notifications: Notification[] = [
    {
        id: '1',
        title: 'Student Offer: Lovable Pro',
        description: 'Get Lovable Pro for free for 1 month! Valid for all verified students.',
        date: '2 hours ago',
        read: false,
        type: 'offer',
    },
    {
        id: '2',
        title: 'Student Offer: Cursor Pro',
        description: 'Exclusive offer: Cursor Pro for free for 3 months. Claim now!',
        date: '1 day ago',
        read: false,
        type: 'offer',
    },
    {
        id: '3',
        title: 'Welcome to CampusShare',
        description: 'Start exploring internships and resources tailored for you.',
        date: '2 days ago',
        read: true,
        type: 'system',
    }
];
