/**
 * EC2 API Client for CloudSim
 * 
 * Provides frontend access to AWS EC2 operations via the backend.
 */

import { api } from './client';

export interface EC2Instance {
    instance_id: string;
    name: string;
    instance_type: string;
    state: string;
    public_ip: string | null;
    private_ip: string | null;
    launch_time: string | null;
    availability_zone: string;
}

export interface CreateInstanceRequest {
    name: string;
    instance_type: string;
}

export interface ActionResponse {
    message: string;
    instance_id: string;
}

/**
 * List all EC2 instances.
 */
export async function listInstances(): Promise<EC2Instance[]> {
    const response = await api.get<EC2Instance[]>('/api/ec2/instances');
    return response.data;
}

/**
 * Get a specific EC2 instance.
 */
export async function getInstance(instanceId: string): Promise<EC2Instance> {
    const response = await api.get<EC2Instance>(`/api/ec2/instances/${instanceId}`);
    return response.data;
}

/**
 * Create a new EC2 instance.
 */
export async function createInstance(data: CreateInstanceRequest): Promise<ActionResponse> {
    const response = await api.post<ActionResponse>('/api/ec2/instances', data);
    return response.data;
}

/**
 * Start a stopped EC2 instance.
 */
export async function startInstance(instanceId: string): Promise<ActionResponse> {
    const response = await api.post<ActionResponse>(`/api/ec2/instances/${instanceId}/start`);
    return response.data;
}

/**
 * Stop a running EC2 instance.
 */
export async function stopInstance(instanceId: string): Promise<ActionResponse> {
    const response = await api.post<ActionResponse>(`/api/ec2/instances/${instanceId}/stop`);
    return response.data;
}

/**
 * Reboot an EC2 instance.
 */
export async function rebootInstance(instanceId: string): Promise<ActionResponse> {
    const response = await api.post<ActionResponse>(`/api/ec2/instances/${instanceId}/reboot`);
    return response.data;
}

/**
 * Terminate an EC2 instance.
 */
export async function terminateInstance(instanceId: string): Promise<ActionResponse> {
    const response = await api.delete<ActionResponse>(`/api/ec2/instances/${instanceId}`);
    return response.data;
}

/**
 * Get available instance types.
 */
export async function getInstanceTypes(): Promise<string[]> {
    const response = await api.get<{ instance_types: string[] }>('/api/ec2/instance-types');
    return response.data.instance_types;
}

// ============================================================================
// CLOUDWATCH METRICS
// ============================================================================
export interface MetricDataPoint {
    timestamp: string;
    value: number;
}

export interface InstanceMetrics {
    instance_id: string;
    cpu_utilization: MetricDataPoint[];
    network_in: MetricDataPoint[];
    network_out: MetricDataPoint[];
    disk_read_ops: MetricDataPoint[];
    disk_write_ops: MetricDataPoint[];
}

export interface CurrentMetrics {
    instance_id: string;
    cpu_percent: number;
    network_in_bytes: number;
    network_out_bytes: number;
}

/**
 * Get CloudWatch metrics history for an instance.
 */
export async function getInstanceMetrics(instanceId: string, periodMinutes: number = 60): Promise<InstanceMetrics> {
    const response = await api.get<InstanceMetrics>(`/api/ec2/instances/${instanceId}/metrics?period=${periodMinutes}`);
    return response.data;
}

/**
 * Get current (latest) metrics for an instance.
 */
export async function getCurrentMetrics(instanceId: string): Promise<CurrentMetrics> {
    const response = await api.get<CurrentMetrics>(`/api/ec2/instances/${instanceId}/metrics/current`);
    return response.data;
}

// ============================================================================
// COST EXPLORER
// ============================================================================
export interface DailyCost {
    date: string;
    compute: number;
    storage: number;
    network: number;
    total: number;
}

export interface CostSummary {
    month_to_date: number;
    projected_monthly: number;
    days_elapsed: number;
}

/**
 * Get daily cost breakdown for the last N days.
 */
export async function getDailyCosts(days: number = 7): Promise<DailyCost[]> {
    const response = await api.get<DailyCost[]>(`/api/ec2/costs/daily?days=${days}`);
    return response.data;
}

/**
 * Get current month cost summary.
 */
export async function getCostSummary(): Promise<CostSummary> {
    const response = await api.get<CostSummary>('/api/ec2/costs/summary');
    return response.data;
}
