export const generateCostAIExplanation = (id: string, name: string, type: string, size: number, cost: number) => `Unattached ${type} volume ${name} (${size}GB) is idle, wasting $${cost}/month.`;
export const generateSecurityAIExplanation = (id: string, name: string, port: number, portName: string, cidr: string) => `Port ${port} (${portName}) in ${name} is open to ${cidr}, creating high risk.`;
export const generateUsageAIExplanation = (id: string, name: string, cpu: number, cType: string, rType: string, cCost: number, pCost: number) => `${name} (${cType}) averages ${cpu}% CPU. Downsizing to ${rType} saves $${cCost - pCost}/mo.`;
export const TOP_RECOMMENDATIONS = ["Enable AWS Cost Anomaly Detection.", "Adopt Reserved Instances.", "Use AWS Trusted Advisor periodically."];
