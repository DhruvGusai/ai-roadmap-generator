export interface RoadmapData {
  title: string;
  steps: RoadmapStep[];
  description: string;
}

export interface RoadmapStep {
  title: string;
  description: string;
  duration: string;
  resources?: string[];
}

export interface UserInput {
  career: string;
  experience: string;
  goals: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
}