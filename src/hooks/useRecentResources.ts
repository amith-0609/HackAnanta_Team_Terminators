import { useState, useEffect } from 'react';

interface RecentResource {
    id: string;
    title: string;
    description: string;
    category: string;
    author: string;
    downloads: number;
    date: string;
    tags: string[];
    viewedAt: number; // timestamp
}

const STORAGE_KEY = 'campusshare_recent_resources';
const MAX_RECENT = 4;

export function useRecentResources() {
    const [recentResources, setRecentResources] = useState<RecentResource[]>([]);

    // Load recent resources from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                setRecentResources(parsed);
            }
        } catch (error) {
            console.error('Error loading recent resources:', error);
        }
    }, []);

    // Add a resource to recent list
    const addRecentResource = (resource: Omit<RecentResource, 'viewedAt'>) => {
        try {
            setRecentResources((prev) => {
                // Remove if already exists (to update position)
                const filtered = prev.filter((r) => r.id !== resource.id);

                // Add to beginning with current timestamp
                const updated = [
                    { ...resource, viewedAt: Date.now() },
                    ...filtered,
                ].slice(0, MAX_RECENT); // Keep only MAX_RECENT items

                // Save to localStorage
                localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

                return updated;
            });
        } catch (error) {
            console.error('Error adding recent resource:', error);
        }
    };

    return {
        recentResources,
        addRecentResource,
    };
}
