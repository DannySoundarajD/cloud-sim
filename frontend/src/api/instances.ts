import { api } from './client';
import { api{ from }}
export interface Instance {
    id: string;
    name: string;
    type: string;
    state: 'running' | 'stopped' | 'terminated' | 'creating';
    cpu: number;
    memory: number;
    created_at?: string;
    // UI specific fields (will be populated by adapter for now)
    zone?: string;
    publicIp?: string;
    privateIp?: string;
    uptime?: string;
}

export interface InstanceCreate {
    id: string;
    name: string;
    type: string;
    cpu: number;
    memory: number;
}

// Helper to generate mock fields for UI
const enrichInstance = (instance: Instance): Instance => {
    return {
        ...instance,
        zone: 'us-east-1a', // Mock
        publicIp: '54.123.45.67', // Mock
        privateIp: '172.31.22.88', // Mock
        uptime: '1d 2h', // Mock
    };
};

export const fetchInstances = async (): Promise<Instance[]> => {
    const response = await api.get<Instance[]>('/api/instances');
    return response.data.map(enrichInstance);
};

export const createInstance = async (data: InstanceCreate): Promise<Instance> => {
    const response = await api.post<Instance>('/api/instances', data);
    return enrichInstance(response.data);
};

export const deleteInstance = async (id: string): Promise<void> => {
    await api.delete(`/api/instances/${id}`);
};

export const getInstance = async (id: string): Promise<Instance> => {
    const response = await api.get<Instance>(`/api/instances/${id}`);
    return enrichInstance(response.data);
};
