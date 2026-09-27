import { TrainingVideo } from '../types/procurement';

export const TRAINING_VIDEOS: TrainingVideo[] = [
  {
    id: 'VID-01',
    title: 'ATCO SCM Master Operating Procedure: Sourcing & Vendor Audit Guide',
    category: 'User Training',
    duration: '14:20',
    url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Clean standard embed placeholder
    description: 'Comprehensive walk-through of ATCO procurement SLAs: 15-day rejection compensation, 75%/94% shelf-life validation rules, and PFI generation within 48 hours.',
    instructor: 'Tariq Mehmood, Sourcing Director',
    badge: 'Mandatory'
  },
  {
    id: 'VID-02',
    title: 'Vendor Onboarding & Isolated Portal Submission Protocol',
    category: 'Vendor Onboarding',
    duration: '08:45',
    url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    description: 'Instructions for international suppliers submitting CFR/FOB quotes, uploading CoAs, and providing working standards through ATCO secure private links.',
    instructor: 'Procurement Operations Team',
    badge: 'Suppliers'
  },
  {
    id: 'VID-03',
    title: 'Sterile API Plant Audit & Good Manufacturing Practice (GMP) Tour',
    category: 'Plant Audit Video Tours',
    duration: '22:10',
    url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    description: 'Video inspection of cleanroom zones, HEPA laminar airflow, clean steam sterilization, and solvent recovery plants for antibiotic API synthesizers.',
    instructor: 'Global QA Audit Committee',
    badge: 'Quality'
  },
  {
    id: 'VID-04',
    title: 'Regulatory Guidelines: Residual Solvents & Pharmacopeial Monographs (BP/USP)',
    category: 'Quality & Regulatory Guidelines',
    duration: '18:30',
    url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    description: 'Deep dive into ICH Q3C residual solvent limits, heavy metals testing, and nitrosamine impurity screening in active pharmaceutical ingredients.',
    instructor: 'Dr. Samina Khan, Regulatory Affairs',
    badge: 'Compliance'
  },
  {
    id: 'VID-05',
    title: 'Accelerated Stability Protocols for Tropical Climatic Zones (Zone IVb)',
    category: 'Quality & Regulatory Guidelines',
    duration: '12:15',
    url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    description: 'Guidelines on managing 40°C / 75% RH stability chambers, 1-month / 3-month testing intervals, and degradation kinetic modeling.',
    instructor: 'Analytical Development Laboratory',
    badge: 'Technical'
  }
];
