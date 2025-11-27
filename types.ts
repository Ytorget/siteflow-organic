import React from 'react';

export type Page = 'home' | 'philosophy' | 'audience' | 'results' | 'contact' | 'login' | 'blog' | 'blogPost' | 'caseStudies' | 'caseStudy' | 'privacy' | 'terms' | 'notFound' | 'dashboard' | 'onboarding';

export interface NavItem {
  label: string;
  page: Page;
}

export interface FeatureProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export interface StatProps {
  value: string;
  label: string;
  source?: string;
}

export enum ConsultationState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}

export interface ConsultationResponse {
  analysis: string;
  fitScore: number; // 1-100
}