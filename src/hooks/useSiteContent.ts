import { useState, useEffect } from 'react';
import { nexus, type SiteComponent } from '@/lib/api/nexus-core';

export function useSiteContent(group: string = 'general') {
    const [components, setComponents] = useState<SiteComponent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadContent();
    }, [group]);

    const loadContent = async () => {
        try {
            const data = await nexus.getComponents(group);
            setComponents(data);
        } catch (error) {
            console.error('Failed to load site content:', error);
        } finally {
            setLoading(false);
        }
    };

    const getValue = (key: string, defaultValue: any) => {
        const component = components.find(c => c.key === key);
        return component ? component.value : defaultValue;
    };

    const getText = (key: string, defaultValue: string = '') => {
        return getValue(key, defaultValue) as string;
    };

    const getImage = (key: string, defaultValue: string = '') => {
        return getValue(key, defaultValue) as string;
    };

    const getJSON = <T>(key: string, defaultValue: T): T => {
        return getValue(key, defaultValue) as T;
    };

    return {
        loading,
        getText,
        getImage,
        getJSON,
        refresh: loadContent
    };
}
