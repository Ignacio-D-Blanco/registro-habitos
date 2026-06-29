export type FieldType = 'text' | 'number' | 'boolean' | 'date';

export type VisualizationType = 'table' | 'pie_chart' | 'percentage_bar' | 'line_chart';

export interface HabitDefinition {
  id: string;
  name: string;
  description?: string;
  visualizationType: VisualizationType;
  fields: {
    name: string;
    label: string;
    type: FieldType;
    required: boolean;
  }[];
  createdAt: Date;
}

export interface HabitRecord {
  id: string;
  habitId: string;
  date: string;
  data: Record<string, string | number | boolean>; 
  createdAt: Date;
}