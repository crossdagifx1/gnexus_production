/**
 * G-Nexus Input/Output Types
 * Core type definitions for the advanced input/output system
 */

// Content Types
export type ContentType =
    | 'text'
    | 'markdown'
    | 'code'
    | 'image'
    | 'video'
    | 'audio'
    | 'pdf'
    | 'spreadsheet'
    | 'document'
    | 'url'
    | 'json'
    | 'csv';

// Input Data Structure
export interface InputData {
    id: string;
    type: ContentType;
    content: string | File | Blob;
    metadata: InputMetadata;
    timestamp: Date;
}

export interface InputMetadata {
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
    duration?: number; // For audio/video
    dimensions?: { width: number; height: number }; // For images/video
    pageCount?: number; // For documents
    url?: string;
    language?: string; // For code
}

// Validation
export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
    warnings: string[];
}

export interface ValidationError {
    field: string;
    message: string;
    code: string;
}

// Analysis Result Types
export type ResultType =
    | 'text_analysis'
    | 'image_analysis'
    | 'video_analysis'
    | 'audio_transcription'
    | 'document_summary'
    | 'data_insights'
    | 'code_execution'
    | 'web_content'
    | 'translation'
    | 'business_ideas';

export type ResultStatus = 'processing' | 'streaming' | 'completed' | 'error';

// Analysis Result
export interface AnalysisResult {
    id: string;
    type: ResultType;
    status: ResultStatus;
    progress: number;

    // Input reference
    inputId: string;

    // Content
    summary: string;
    content: string;
    insights: Insight[];
    data?: StructuredData;
    visualizations?: Visualization[];
    recommendations?: Recommendation[];

    // Metadata
    metadata: ResultMetadata;
}

export interface ResultMetadata {
    processingTime: number;
    modelUsed: string;
    confidence: number;
    timestamp: Date;
    tokensUsed?: number;
}

// Insight Structure
export interface Insight {
    id: string;
    type: 'observation' | 'pattern' | 'anomaly' | 'trend' | 'key_point';
    title: string;
    description: string;
    importance: 'high' | 'medium' | 'low';
    data?: any;
}

// Structured Data
export interface StructuredData {
    type: 'table' | 'json' | 'csv' | 'tree' | 'graph';
    data: any;
    schema?: DataSchema;
}

export interface DataSchema {
    fields: FieldSchema[];
}

export interface FieldSchema {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array';
    nullable: boolean;
}

// Visualization
export interface Visualization {
    id: string;
    type: ChartType;
    title: string;
    data: any;
    config: ChartConfig;
}

export type ChartType =
    | 'line'
    | 'bar'
    | 'pie'
    | 'scatter'
    | 'area'
    | 'heatmap'
    | 'treemap'
    | 'network'
    | 'gauge'
    | 'radar';

export interface ChartConfig {
    xAxis?: AxisConfig;
    yAxis?: AxisConfig;
    colors?: string[];
    legend?: boolean;
    animated?: boolean;
    interactive?: boolean;
}

export interface AxisConfig {
    label?: string;
    type?: 'linear' | 'category' | 'time' | 'log';
    min?: number;
    max?: number;
}

// Recommendation
export interface Recommendation {
    id: string;
    title: string;
    description: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
    actions: RecommendedAction[];
}

export interface RecommendedAction {
    id: string;
    label: string;
    type: 'link' | 'button' | 'tool';
    target?: string;
    params?: Record<string, any>;
}

// Export Formats
export type ExportFormat = 'png' | 'pdf' | 'csv' | 'json' | 'markdown' | 'html';

// File Upload Configuration
export interface FileUploadConfig {
    acceptedTypes: ContentType[];
    maxFileSize: number; // in bytes
    multiple: boolean;
    dragDrop: boolean;
    preview: boolean;
    compression: boolean;
}

// Default configurations
export const DEFAULT_FILE_CONFIG: FileUploadConfig = {
    acceptedTypes: ['image', 'video', 'audio', 'pdf', 'spreadsheet', 'document'],
    maxFileSize: 50 * 1024 * 1024, // 50MB
    multiple: true,
    dragDrop: true,
    preview: true,
    compression: false,
};

// MIME type mapping
export const MIME_TYPE_MAP: Record<string, ContentType> = {
    'image/jpeg': 'image',
    'image/png': 'image',
    'image/gif': 'image',
    'image/webp': 'image',
    'image/svg+xml': 'image',
    'video/mp4': 'video',
    'video/webm': 'video',
    'video/quicktime': 'video',
    'audio/mpeg': 'audio',
    'audio/wav': 'audio',
    'audio/ogg': 'audio',
    'audio/webm': 'audio',
    'application/pdf': 'pdf',
    'application/vnd.ms-excel': 'spreadsheet',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'spreadsheet',
    'text/csv': 'csv',
    'application/json': 'json',
    'text/plain': 'text',
    'text/markdown': 'markdown',
    'text/html': 'document',
    'application/msword': 'document',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'document',
};

// Content type icons (emoji)
export const CONTENT_TYPE_ICONS: Record<ContentType, string> = {
    text: '📝',
    markdown: '📑',
    code: '💻',
    image: '🖼️',
    video: '🎬',
    audio: '🎤',
    pdf: '📄',
    spreadsheet: '📊',
    document: '📃',
    url: '🌐',
    json: '{ }',
    csv: '📈',
};

// Content type colors
export const CONTENT_TYPE_COLORS: Record<ContentType, string> = {
    text: '#94a3b8',
    markdown: '#06b6d4',
    code: '#3b82f6',
    image: '#f97316',
    video: '#ef4444',
    audio: '#8b5cf6',
    pdf: '#dc2626',
    spreadsheet: '#22c55e',
    document: '#6366f1',
    url: '#0ea5e9',
    json: '#f59e0b',
    csv: '#84cc16',
};
